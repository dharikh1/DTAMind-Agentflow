export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  supportsSystemPrompt: boolean;
}

// Available LLM providers - matches server-side configuration
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

export function getProviderModels(providerId: string): string[] {
  return LLM_PROVIDERS[providerId]?.models || [];
}

export function getProviderName(providerId: string): string {
  return LLM_PROVIDERS[providerId]?.name || providerId;
}

export function supportsSystemPrompt(providerId: string): boolean {
  return LLM_PROVIDERS[providerId]?.supportsSystemPrompt || false;
}