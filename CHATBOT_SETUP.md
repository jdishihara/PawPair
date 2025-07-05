# PawBot Setup Guide

## Overview
PawBot is an AI assistant that helps users with pet care questions and PawPair app features. It's integrated into the Messages screen and uses OpenAI's GPT model.

## Features
- 🐕 Pet care advice (health, nutrition, training, behavior)
- 📱 PawPair app help and feature explanations  
- 💬 Natural conversation with memory
- 🔄 Fallback responses when offline
- 🎨 Beautiful UI with collapsible interface

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (starts with `sk-...`)

### 2. Add API Key
Open `utils/chatBotService.ts` and replace:
```typescript
const OPENAI_API_KEY = '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';
```
With your actual API key:
```typescript
const OPENAI_API_KEY = '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';
```

### 3. Cost Information
- **Model**: GPT-3.5 Turbo (~$0.002 per 1K tokens)
- **Typical cost**: $0.01-0.05 per conversation
- **Very affordable** for personal projects

## Demo Mode
If you don't have an API key, the chatbot automatically falls back to demo mode with pre-written responses for common topics:
- Pet health questions
- Training and behavior  
- Nutrition advice
- PawPair app features

## Usage
1. Open the **Messages** screen
2. Tap the **PawBot** card at the top
3. Ask questions like:
   - "How often should I walk my dog?"
   - "What should I feed my puppy?"
   - "How do I find sitters on PawPair?"
   - "My dog is acting strange, what should I do?"

## Customization
Edit the `SYSTEM_PROMPT` in `utils/chatBotService.ts` to:
- Add more PawPair-specific information
- Include your local area pet resources
- Adjust the bot's personality
- Add emergency contact information

## Technical Details
- **Storage**: Messages saved locally per user
- **Privacy**: Conversations are user-specific
- **Offline**: Falls back to basic responses
- **Memory**: Maintains conversation context
- **Responsive**: Expandable/collapsible UI

## Troubleshooting
- **No responses**: Check API key and internet connection
- **Generic responses**: Bot is in demo mode (no API key)
- **Slow responses**: Normal for OpenAI API calls (1-3 seconds)
- **Clear chat**: Use refresh button to reset conversation