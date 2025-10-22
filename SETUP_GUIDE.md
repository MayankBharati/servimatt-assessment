# AI Nexus Setup Guide

## Quick Setup Instructions

### 1. Create InstantDB Account
1. Go to https://instantdb.com
2. Sign up for a free account
3. Create a new app named "ai-nexus-mayank"
4. Copy the **App ID** from the dashboard

### 2. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 3. Update Environment Variables
Edit `apps/web/.env.local` and replace:

```env
# Replace with your actual OpenAI API key
OPENAI_API_KEY=sk-your-actual-key-here

# Replace with your InstantDB App ID
NEXT_PUBLIC_INSTANTDB_ID=your-actual-app-id-here

# Optional: Get from InstantDB dashboard for file uploads
INSTANTDB_ADMIN_SECRET=your-admin-secret-here
```

### 4. Run the Application
```bash
# From the project root
pnpm install
pnpm dev
```

### 5. Access Your App
Open http://localhost:1290 in your browser

## Features Available

### Without OpenAI API Key:
- View the interface
- Navigate between agents
- See personal branding
- AI chat functionality (not available)

### With OpenAI API Key:
- All features above
- AI chat with streaming responses
- File upload and RAG analysis
- Multi-agent conversations
- Chat history persistence

## Troubleshooting

### InstantDB Connection Issues:
- Make sure you've created your own app at instantdb.com
- Verify the App ID is correct in `.env.local`
- Check that the app is active in your InstantDB dashboard

### OpenAI API Issues:
- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure the key has the right permissions

### Port Already in Use:
- The app runs on port 1290
- If occupied, kill the process: `netstat -ano | findstr :1290` then `taskkill /PID <PID> /F`

## Personal Customizations

This project has been personalized with:
- **Branding**: "AI Nexus by Mayank Bharati"
- **Theme**: Purple/pink gradient colors
- **Agents**: Web Dev Tutor, Career Advisor, Math Tutor, History Tutor
- **Animations**: Custom CSS animations and effects
- **Typography**: Inter font family

## Assignment Compliance

**Core Requirements:**
- Prompt input + submit button
- AI API integration (OpenAI)
- Dynamic response display
- Error handling and loading states

**Bonus Features:**
- Chat history persistence
- Clear/new chat functionality

**Advanced Features:**
- Multi-agent system
- RAG document analysis
- Real-time synchronization
- Production-ready architecture
