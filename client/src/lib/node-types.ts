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
    description: 'Multi-tool AI agent with memory',
    category: 'ai',
    color: 'amber',
    defaultData: {
      model: 'gpt-4o',
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
  }
} as const;

export type NodeTypeKey = keyof typeof NODE_TYPES;
