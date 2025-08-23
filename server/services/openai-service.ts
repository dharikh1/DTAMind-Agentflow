import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your_openai_api_key"
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  messages: ChatMessage[];
}

export class OpenAIService {
  async chat(options: ChatCompletionOptions): Promise<string> {
    try {
      const messages: ChatMessage[] = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      messages.push(...options.messages);

      const response = await openai.chat.completions.create({
        model: options.model || "gpt-4o",
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 150,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to process chat completion");
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; confidence: number }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide sentiment (positive/negative/neutral), score (-1 to 1), and confidence (0 to 1). Respond with JSON in this format: { 'sentiment': string, 'score': number, 'confidence': number }"
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sentiment: result.sentiment || "neutral",
        score: Math.max(-1, Math.min(1, result.score || 0)),
        confidence: Math.max(0, Math.min(1, result.confidence || 0))
      };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      throw new Error("Failed to analyze sentiment");
    }
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant. ${context ? `Context: ${JSON.stringify(context)}` : ''}`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Response generation error:", error);
      throw new Error("Failed to generate response");
    }
  }
}

export const openaiService = new OpenAIService();
