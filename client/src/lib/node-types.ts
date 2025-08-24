export const NODE_TYPES = {
  // Input Nodes
  webhook: {
    label: 'Webhook',
    description: 'Trigger workflows via HTTP requests',
    category: 'inputs',
    color: 'blue',
    defaultData: {
      method: 'POST',
      path: '/webhook',
      authentication: 'none'
    }
  },
  manual: {
    label: 'Manual Trigger',
    description: 'Start workflows manually',
    category: 'inputs',
    color: 'blue',
    defaultData: {}
  },
  schedule: {
    label: 'Schedule',
    description: 'Run workflows on a schedule',
    category: 'inputs',
    color: 'blue',
    defaultData: {
      cron: '0 9 * * *',
      timezone: 'UTC'
    }
  },

  // AI Nodes
  openai: {
    label: 'OpenAI Chat',
    description: 'GPT-powered conversational AI',
    category: 'ai',
    color: 'amber',
    defaultData: {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 150,
      systemPrompt: 'You are a helpful AI assistant.',
      userMessage: '{{input}}'
    }
  },
  agent: {
    label: 'AI Agent',
    description: 'Multi-provider AI agent with configurable LLM',
    category: 'ai',
    color: 'amber',
    defaultData: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      tools: ['search', 'calculator'],
      memory: true,
      prompt: 'You are an AI agent with access to tools.'
    }
  },
  vector: {
    label: 'Vector Search',
    description: 'Semantic search and retrieval',
    category: 'ai',
    color: 'amber',
    defaultData: {
      collection: 'default',
      topK: 5,
      threshold: 0.7
    }
  },

  // Processing Nodes
  code: {
    label: 'Code',
    description: 'Execute JavaScript/Python code',
    category: 'processing',
    color: 'emerald',
    defaultData: {
      language: 'javascript',
      code: '// Your code here\nreturn { result: "Hello World" };'
    }
  },
  condition: {
    label: 'Condition',
    description: 'Branch workflow based on conditions',
    category: 'processing',
    color: 'emerald',
    defaultData: {
      condition: 'input.value > 0'
    }
  },
  merge: {
    label: 'Merge',
    description: 'Combine multiple data streams',
    category: 'processing',
    color: 'emerald',
    defaultData: {
      strategy: 'merge',
      waitForAll: true
    }
  },

  // Output Nodes
  email: {
    label: 'Send Email',
    description: 'Send emails via SMTP',
    category: 'outputs',
    color: 'red',
    defaultData: {
      to: '',
      subject: 'Workflow Notification',
      body: 'Your workflow has completed successfully.',
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
      }
    }
  },
  'webhook-response': {
    label: 'Webhook Response',
    description: 'Return data to webhook caller',
    category: 'outputs',
    color: 'red',
    defaultData: {
      statusCode: 200,
      responseData: '{"status": "success"}'
    }
  },

  // LangChain Document Processing Nodes
  'pdf-loader': {
    label: 'PDF Loader',
    description: 'Load and extract text from PDF documents',
    category: 'Document Processing',
    color: '#3b82f6',
    defaultData: {
      filePath: '',
      pages: ''
    }
  },
  'csv-loader': {
    label: 'CSV Loader',
    description: 'Load and parse CSV files',
    category: 'Document Processing',
    color: '#10b981',
    defaultData: {
      filePath: '',
      delimiter: ','
    }
  },
  'url-scraper': {
    label: 'URL Scraper',
    description: 'Scrape content from web URLs',
    category: 'Document Processing',
    color: '#f59e0b',
    defaultData: {
      url: '',
      selector: 'body'
    }
  },

  // LangChain Vector Store Nodes
  'pinecone-store': {
    label: 'Pinecone Store',
    description: 'Store and retrieve vectors using Pinecone',
    category: 'Vector Stores',
    color: '#8b5cf6',
    defaultData: {
      apiKey: '',
      environment: '',
      indexName: ''
    }
  },
  'weaviate-store': {
    label: 'Weaviate Store',
    description: 'Store and retrieve vectors using Weaviate',
    category: 'Vector Stores',
    color: '#06b6d4',
    defaultData: {
      url: '',
      className: ''
    }
  },

  // LangChain AI Model Nodes
  'openai-chat': {
    label: 'OpenAI Chat',
    description: 'Chat completion using OpenAI models',
    category: 'AI Models',
    color: '#10b981',
    defaultData: {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  'anthropic-chat': {
    label: 'Anthropic Claude',
    description: 'Chat completion using Anthropic Claude',
    category: 'AI Models',
    color: '#8b5cf6',
    defaultData: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7
    }
  },

  // LangChain Memory Nodes
  'conversation-memory': {
    label: 'Conversation Memory',
    description: 'Store and retrieve conversation history',
    category: 'Memory',
    color: '#f59e0b',
    defaultData: {
      memoryKey: '',
      maxTokens: 2000
    }
  },

  // LangChain Tool Nodes
  'web-search': {
    label: 'Web Search',
    description: 'Search the web for information',
    category: 'Tools',
    color: '#ef4444',
    defaultData: {
      searchEngine: 'google',
      maxResults: 5
    }
  },
  'code-executor': {
    label: 'Code Executor',
    description: 'Execute Python or JavaScript code',
    category: 'Tools',
    color: '#6366f1',
    defaultData: {
      language: 'python',
      timeout: 30
    }
  }
} as const;

export type NodeTypeKey = keyof typeof NODE_TYPES;
