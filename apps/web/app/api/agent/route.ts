import { run, Agent } from '@openai/agents';
import { triageAgent } from '@workspace/agent-core';
import { NextRequest, NextResponse } from 'next/server';
import { parseFileContent, createContextPrompt, ParsedContent } from '@/lib/file-parsers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
// Use the global fetch available in the Next.js runtime

export const runtime = 'nodejs';

// Safety limits
const MAX_MESSAGE_LENGTH = 4000; // characters
const MAX_FILES_PER_REQUEST = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 requests per hour per IP
    const clientIp = getClientIp(request);
    console.log('Request from IP:', clientIp);
    
    const rateLimitResult = rateLimit(clientIp, {
      limit: 20,
      window: 60 * 60 * 1000, // 1 hour
    });
    
    console.log('Rate limit result:', rateLimitResult);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetAt);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${resetDate.toLocaleTimeString()}.`,
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    let message, fileAttachments, enableStreaming, agent;
    try {
      const body = await request.json();
      message = body.message;
      fileAttachments = body.fileAttachments || [];
      enableStreaming = body.stream;
      agent = body.agent;
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    // Validation: Message length
    if (message && message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 },
      );
    }

    // Validation: File count
    if (fileAttachments && fileAttachments.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files per request.` },
        { status: 400 },
      );
    }

    // Validation: File sizes
    if (fileAttachments && fileAttachments.length > 0) {
      const oversizedFiles = fileAttachments.filter((f: FileAttachment) => f.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        return NextResponse.json(
          { error: `File too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB per file.` },
          { status: 400 },
        );
      }
    }

    if (!message && (!fileAttachments || fileAttachments.length === 0)) {
      return NextResponse.json(
        { error: 'Message or file attachments required' },
        { status: 400 },
      );
    }

    // Decide which LLM provider to use: OpenAI (preferred) or Groq/Google (fallback)
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasGoogleKey = !!process.env.GOOGLE_API_KEY;

    if (!hasOpenAIKey && !hasGroqKey && !hasGoogleKey) {
      return NextResponse.json(
        { error: 'No LLM API key configured. Please set OPENAI_API_KEY, GROQ_API_KEY, or GOOGLE_API_KEY in .env.local' },
        { status: 500 },
      );
    }

    let finalMessage = message || 'Please analyze the uploaded files.';

    // Process file attachments for RAG
    if (fileAttachments && fileAttachments.length > 0) {
      try {
        console.log(`Processing ${fileAttachments.length} file attachments for RAG...`);
        
        const parsedFiles: ParsedContent[] = await Promise.all(
          fileAttachments.map(async (file: FileAttachment) => {
            return await parseFileContent(file.id, file.name, file.type);
          })
        );

        // Create enhanced prompt with file context
        finalMessage = createContextPrompt(parsedFiles, message || '');
        
        console.log(`RAG context created with ${parsedFiles.length} files`);
      } catch (fileError) {
        console.error('File processing error:', fileError);
        return NextResponse.json(
          { error: 'Failed to process uploaded files', details: String(fileError) },
          { status: 500 },
        );
      }
    }

    // Create custom agent if agent info is provided
    let selectedAgent = triageAgent;
    
    if (agent && agent.isCustom) {
      // Get the agent details from the database to get full info
      const customInstructions = `You are ${agent.title}, a specialized AI assistant.

${agent.personality ? `Personality: ${agent.personality}` : ''}

${agent.expertise ? `Expertise: You specialize in ${agent.expertise}.` : ''}

${agent.systemPrompt ? `Additional Instructions: ${agent.systemPrompt}` : ''}

Please respond in character and use your specialized knowledge to help the user.`;

      selectedAgent = new Agent({
        name: agent.title || 'Custom Agent',
        instructions: customInstructions,
      });
    }
    // Helper: call Google Gemini API
    async function callGoogleGenerative(prompt: string): Promise<string> {
      const apiKey = process.env.GOOGLE_API_KEY as string;

      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY is not set');
      }

      console.log('Making Google Gemini API call with key starting with:', apiKey.substring(0, 10) + '...');

      // Use Gemini Pro API endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${encodeURIComponent(apiKey)}`;

      const body = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      };

      console.log('Request URL:', url);
      console.log('Request body:', JSON.stringify(body, null, 2));

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', resp.status);
      console.log('Response headers:', Object.fromEntries(resp.headers.entries()));

      if (!resp.ok) {
        const txt = await resp.text();
        console.error('Google Gemini API error response:', txt);
        throw new Error(`Google Gemini API error ${resp.status}: ${txt}`);
      }

      const data = await resp.json();
      console.log('Google Gemini API response:', JSON.stringify(data, null, 2));

      // Handle Gemini API response format
      if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          return candidate.content.parts.map((part: any) => part.text || '').join('');
        }
      }

      // Check for blocked content
      if (data?.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
        throw new Error('Content was blocked by Google Gemini safety filters');
      }

      // Fallback for unexpected response format
      console.warn('Unexpected response format from Google Gemini API:', data);
      return JSON.stringify(data);
    }

    // Helper: call Groq API
    async function callGroq(prompt: string): Promise<string> {
      const apiKey = process.env.GROQ_API_KEY as string;

      if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set');
      }

      const url = 'https://api.groq.com/openai/v1/chat/completions';

      const body = {
        model: 'llama-3.1-8b-instant', // Updated to current fast model
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.2,
        max_tokens: 1024,
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Groq API error ${resp.status}: ${txt}`);
      }

      const data = await resp.json();

      if (data?.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        return data.choices[0].message?.content || '';
      }

      return JSON.stringify(data);
    }

    // Run the agent with the enhanced message
    if (hasOpenAIKey) {
      // Use existing OpenAI agents flow
      if (enableStreaming) {
        const result = await run(selectedAgent, finalMessage, { stream: true });

        // Create a readable stream for the response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              if (fileAttachments && fileAttachments.length > 0) {
                const processingChunk = `data: ${JSON.stringify({
                  toolCall: { name: 'file_analysis' },
                  done: false,
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(processingChunk));
              }

              for await (const event of result) {
                if (event.type === 'raw_model_stream_event') {
                  const data = event.data;
                  if (data.type === 'output_text_delta' && data.delta) {
                    const chunk = `data: ${JSON.stringify({ content: data.delta, done: false })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(chunk));
                  }
                }
              }

              await result.completed;

              const finalChunk = `data: ${JSON.stringify({
                content: '',
                done: true,
                agent: 'RAG-Enhanced Agent',
                filesProcessed: fileAttachments?.length || 0,
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(finalChunk));
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          },
        });
      } else {
        // Non-streaming response (existing behavior)
        const result = await run(selectedAgent, finalMessage);

        return NextResponse.json(
          {
            output: result.finalOutput,
            agent: 'RAG-Enhanced Agent',
            filesProcessed: fileAttachments?.length || 0,
          },
          {
            headers: {
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            },
          },
        );
      }
    } else if (hasGroqKey) {
      // Fallback to Groq API (non-streaming only)
      if (enableStreaming) {
        return NextResponse.json({ error: 'Streaming is not supported for Groq API fallback' }, { status: 501 });
      }

      try {
        const groqResponse = await callGroq(finalMessage);

        return NextResponse.json(
          {
            output: groqResponse,
            agent: 'Groq API (Llama 3.1)',
            filesProcessed: fileAttachments?.length || 0,
          },
          {
            headers: {
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            },
          },
        );
      } catch (gErr) {
        console.error('Groq API error:', gErr);
        return NextResponse.json({ error: 'Groq API call failed', details: String(gErr) }, { status: 500 });
      }
    } else if (hasGoogleKey) {
      // Fallback to Google Gemini API (non-streaming only)
      if (enableStreaming) {
        return NextResponse.json({ error: 'Streaming is not supported for Google Gemini API fallback' }, { status: 501 });
      }

      try {
        const googleResponse = await callGoogleGenerative(finalMessage);

        return NextResponse.json(
          {
            output: googleResponse,
            agent: 'Google Gemini API (fallback)',
            filesProcessed: fileAttachments?.length || 0,
          },
          {
            headers: {
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            },
          },
        );
      } catch (gErr) {
        console.error('Google Gemini API error:', gErr);
        return NextResponse.json({ error: 'Google Gemini API call failed', details: String(gErr) }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 },
    );
  }
}
