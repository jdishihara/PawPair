// utils/chatBotService.ts
import OpenAI from 'openai';

// Note: In production, store API key securely (environment variables or secure storage)
const OPENAI_API_KEY = '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'; // Replace with your actual API key

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are PawBot, a friendly and knowledgeable AI assistant for PawPair - a dog sitting and walking app that connects dog owners with trusted dog sitters. 

Your role is to help users with:
1. Pet care advice (dog health, behavior, training, nutrition)
2. Dog sitting and walking tips
3. PawPair app features and how to use them
4. Emergency pet care guidance
5. Breed-specific information

About PawPair:
- Users can sign up as dog owners or dog sitters
- Owners can find nearby sitters using an interactive map
- Sitters can browse available dogs and set their availability
- The app includes messaging, scheduling, and location features
- Users have profiles with photos that appear on the map
- Features include swipe-to-match functionality between owners and sitters

Guidelines:
- Always be helpful, friendly, and pet-focused
- For medical emergencies, always recommend consulting a veterinarian
- Keep responses concise but informative
- Use emojis occasionally to maintain a friendly tone
- If asked about features not in PawPair, politely redirect to pet care topics
- Encourage responsible pet ownership and safety

Remember: You're here to help make pet care easier and safer for everyone! 🐕❤️`;

export interface ChatBotMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

export class ChatBotService {
  private conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({ 
        role: 'user', 
        content: userMessage 
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const botResponse = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't process that request. Please try again! 🐕";

      // Add bot response to conversation history
      this.conversationHistory.push({ 
        role: 'assistant', 
        content: botResponse 
      });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 21) { // 1 system + 20 messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-20) // Keep last 20 messages
        ];
      }

      return botResponse;
    } catch (error) {
      console.error('ChatBot API Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Basic fallback responses for common topics
    if (lowerMessage.includes('health') || lowerMessage.includes('sick')) {
      return "For any health concerns with your dog, I always recommend consulting with a veterinarian. They can provide the best medical advice for your furry friend! 🏥🐕";
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
      return "Dog nutrition is important! Generally, dogs need a balanced diet with high-quality protein. Avoid chocolate, grapes, onions, and other toxic foods. Consult your vet for specific dietary recommendations! 🍖🥕";
    }
    
    if (lowerMessage.includes('training') || lowerMessage.includes('behavior')) {
      return "Positive reinforcement training works best with dogs! Use treats, praise, and consistency. Start with basic commands like sit, stay, and come. Be patient - every dog learns at their own pace! 🎾🏆";
    }
    
    if (lowerMessage.includes('pawpair') || lowerMessage.includes('app')) {
      return "PawPair helps you find trusted dog sitters and walking services! You can browse profiles on our interactive map, message potential sitters, and schedule services. Is there a specific feature you'd like to know more about? 📱🗺️";
    }
    
    return "I'm here to help with pet care questions and PawPair app information! Feel free to ask me about dog health, training, nutrition, or how to use the app features. 🐕💬";
  }

  clearHistory(): void {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  // Demo mode for testing without API key
  async sendMessageDemo(userMessage: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.getFallbackResponse(userMessage);
  }
}

export const chatBotService = new ChatBotService();