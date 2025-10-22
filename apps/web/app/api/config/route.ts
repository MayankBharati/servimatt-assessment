import { NextResponse } from 'next/server';

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasGoogleKey = !!process.env.GOOGLE_API_KEY;

  return NextResponse.json({
    providers: {
      openai: hasOpenAIKey,
      groq: hasGroqKey,
      google: hasGoogleKey,
    },
    streamingSupported: hasOpenAIKey, // Only OpenAI supports streaming in this implementation
  });
}