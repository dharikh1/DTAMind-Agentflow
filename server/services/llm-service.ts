import OpenAI from 'openai';

// Initialize OpenAI client conditionally
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not provided. Set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  supportsSystemPrompt: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  provider: string;
  model: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

// Available LLM providers
export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    supportsSystemPrompt: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    supportsSystemPrompt: true,
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    supportsSystemPrompt: true,
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    models: ['command-r-plus', 'command-r', 'command'],
    supportsSystemPrompt: false,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    supportsSystemPrompt: true,
  }
};

export class LLMService {
  async chat(options: ChatCompletionOptions): Promise<string> {
    const provider = LLM_PROVIDERS[options.provider];
    if (!provider) {
      throw new Error(`Unsupported provider: ${options.provider}`);
    }

    switch (options.provider) {
      case 'openai':
        return this.chatOpenAI(options);
      case 'anthropic':
        return this.chatAnthropic(options);
      case 'google':
        return this.chatGoogle(options);
      case 'cohere':
        return this.chatCohere(options);
      case 'mistral':
        return this.chatMistral(options);
      default:
        throw new Error(`Provider ${options.provider} not implemented yet`);
    }
  }

  private async chatOpenAI(options: ChatCompletionOptions): Promise<string> {
    try {
      const messages: ChatMessage[] = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      messages.push(...options.messages);

      const openaiClient = getOpenAIClient();
      const response = await openaiClient.chat.completions.create({
        model: options.model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to process OpenAI chat completion");
    }
  }

  private async chatAnthropic(options: ChatCompletionOptions): Promise<string> {
    // Note: This would require the Anthropic SDK and API key
    // For now, return a placeholder response
    console.warn("Anthropic provider not fully implemented yet");
    return `[Anthropic ${options.model}] This provider needs to be configured with API key and SDK.`;
  }

  private async chatGoogle(options: ChatCompletionOptions): Promise<string> {
    // Note: This would require the Google AI SDK and API key
    console.warn("Google provider not fully implemented yet");
    return `[Google ${options.model}] This provider needs to be configured with API key and SDK.`;
  }

  private async chatCohere(options: ChatCompletionOptions): Promise<string> {
    // Note: This would require the Cohere SDK and API key
    console.warn("Cohere provider not fully implemented yet");
    return `[Cohere ${options.model}] This provider needs to be configured with API key and SDK.`;
  }

  private async chatMistral(options: ChatCompletionOptions): Promise<string> {
    // Note: This would require the Mistral SDK and API key
    console.warn("Mistral provider not fully implemented yet");
    return `[Mistral ${options.model}] This provider needs to be configured with API key and SDK.`;
  }

  async generateResponse(provider: string, model: string, prompt: string, context?: any): Promise<string> {
    const systemPrompt = `You are a helpful AI assistant. ${context ? `Context: ${JSON.stringify(context)}` : ''}`;
    
    return this.chat({
      provider,
      model,
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });
  }

  // Keep backward compatibility with existing OpenAI methods
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; confidence: number }> {
    try {
      const openaiClient = getOpenAIClient();
      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
}

export const llmService = new LLMService();