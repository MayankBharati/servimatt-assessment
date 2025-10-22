# AI Nexus - Personal AI Assistant Platform

<img width="1538" height="989" alt="AI Nexus Interface" src="https://github.com/user-attachments/assets/dd40e00c-afc4-49e3-ad5d-fec93de79691" />

> **For full documentation, see [PROJECT_README.md](./PROJECT_README.md)**

**AI Nexus** is a personal AI assistant platform created by **Mayank Bharati** for the Servimatt Frontend Engineer Technical Assessment. It features multi-agent orchestration, RAG document analysis, and a beautiful modern interface.

**Live Demo:** [ai-nexus-mayank.vercel.app](https://ai-nexus-mayank.vercel.app/dashboard)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd servimatt-assessment-main

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
# Edit .env.local with your API keys

# Start development server
pnpm dev
```

## Servimatt Assessment Submission

This project fulfills all requirements for the Frontend Engineer Technical Assessment:

**Core Requirements:**
- Prompt input with submit button
- AI API integration (OpenAI Agents SDK)
- Dynamic response display with streaming
- Comprehensive error handling and loading states

**Bonus Features:**
- Multi-agent orchestration with specialized agents
- File upload and RAG document analysis
- Real-time chat with message persistence
- Custom agent creation with personality customization
- Modern UI with dark/light theme support
- Responsive design for mobile and desktop

## API Integration

The platform integrates with multiple AI providers for robust and flexible AI interactions:

- **Primary API:** Groq API (llama-3.1-8b-instant model)
- **Fallback Support:** OpenAI and Google Gemini APIs
- **Streaming Responses:** Real-time message streaming for better UX
- **Error Handling:** Automatic fallback between providers
- **Rate Limiting:** Built-in rate limiting to prevent API abuse

### Environment Setup
```bash
# Required environment variables
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key  # Optional fallback
GOOGLE_API_KEY=your_google_api_key  # Optional fallback
INSTANT_APP_ID=your_instant_db_app_id
INSTANT_API_TOKEN=your_instant_db_token
```

## Personal Features

- **Custom Branding**: "AI Nexus" with personal purple/pink gradient theme
- **Specialized Agents**: Web Development Tutor, Career Advisor, Math Tutor, History Tutor
- **Personal Touches**: Custom animations, gradient text, floating elements
- **Modern Typography**: Inter font family for better readability
- **Enhanced UX**: Sparkle effects, pulse animations, and smooth transitions

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment (see PROJECT_README.md)
cp apps/web/.env.local.example apps/web/.env.local

# Run development server
pnpm dev
```

Visit `http://localhost:1290`

## Architecture

Monorepo with:

- `apps/web` - Next.js 15 application
- `packages/agent-core` - OpenAI Agents SDK configuration
- `packages/ui` - Shared shadcn/ui components

See [PROJECT_README.md](./PROJECT_README.md) for complete documentation.
