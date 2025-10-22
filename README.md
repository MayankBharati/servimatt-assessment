# Servimatt Frontend Engineer Assessment

A lightweight AI chat application built with Next.js and React.

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/MayankBharati/servimatt-assessment.git
cd servimatt-assessment

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
# Add your API key to .env.local

# Start development server
pnpm dev
```

Visit `http://localhost:1290` to use the application.

## Features

**Core Requirements:**
- Prompt input with submit button
- AI API integration (Groq API)
- Dynamic response display with streaming
- Error handling and loading states

**Bonus Features:**
- Chat history persistence
- Clear/new chat functionality

## Environment Variables

Create `apps/web/.env.local` with:
```
GROQ_API_KEY=your_groq_api_key
INSTANT_APP_ID=your_instant_db_app_id
INSTANT_API_TOKEN=your_instant_db_token
```
