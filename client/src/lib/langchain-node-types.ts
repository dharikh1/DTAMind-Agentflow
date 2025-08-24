import { LucideIcon, FileText, Database, Brain, Globe, Code, MessageSquare, Image, Mic, Search } from 'lucide-react';

export interface LangChainNodeType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  color: string;
  inputs: string[];
  outputs: string[];
  config: NodeConfig[];
  defaultData: Record<string, any>;
}

export interface NodeConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'textarea' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
  description?: string;
}

export const LANGCHAIN_NODE_TYPES: LangChainNodeType[] = [
  // Document Processing Nodes
  {
    id: 'pdf-loader',
    name: 'PDF Loader',
    description: 'Load and extract text from PDF documents',
    icon: FileText,
    category: 'Document Processing',
    color: '#3b82f6',
    inputs: [],
    outputs: ['text'],
    config: [
      {
        key: 'filePath',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: '/path/to/document.pdf',
        description: 'Path to the PDF file'
      },
      {
        key: 'pages',
        label: 'Pages',
        type: 'text',
        required: false,
        placeholder: '1-5 or 1,3,5',
        description: 'Specific pages to extract (optional)'
      }
    ],
    defaultData: {
      filePath: '',
      pages: ''
    }
  },
  {
    id: 'csv-loader',
    name: 'CSV Loader',
    description: 'Load and parse CSV files',
    icon: FileText,
    category: 'Document Processing',
    color: '#10b981',
    inputs: [],
    outputs: ['data'],
    config: [
      {
        key: 'filePath',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: '/path/to/data.csv',
        description: 'Path to the CSV file'
      },
      {
        key: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        required: false,
        options: [',', ';', '\t', '|'],
        defaultValue: ',',
        description: 'CSV delimiter character'
      }
    ],
    defaultData: {
      filePath: '',
      delimiter: ','
    }
  },
  {
    id: 'url-scraper',
    name: 'URL Scraper',
    description: 'Scrape content from web URLs',
    icon: Globe,
    category: 'Document Processing',
    color: '#f59e0b',
    inputs: [],
    outputs: ['text', 'metadata'],
    config: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://example.com',
        description: 'URL to scrape'
      },
      {
        key: 'selector',
        label: 'CSS Selector',
        type: 'text',
        required: false,
        placeholder: 'body, .content, #main',
        description: 'CSS selector to extract specific content'
      }
    ],
    defaultData: {
      url: '',
      selector: 'body'
    }
  },

  // Vector Store Nodes
  {
    id: 'pinecone-store',
    name: 'Pinecone Store',
    description: 'Store and retrieve vectors using Pinecone',
    icon: Database,
    category: 'Vector Stores',
    color: '#8b5cf6',
    inputs: ['embeddings'],
    outputs: ['vectorId'],
    config: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text',
        required: true,
        placeholder: 'your-pinecone-api-key',
        description: 'Pinecone API key'
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'text',
        required: true,
        placeholder: 'us-west1-gcp',
        description: 'Pinecone environment'
      },
      {
        key: 'indexName',
        label: 'Index Name',
        type: 'text',
        required: true,
        placeholder: 'knowledge-base',
        description: 'Pinecone index name'
      }
    ],
    defaultData: {
      apiKey: '',
      environment: '',
      indexName: ''
    }
  },
  {
    id: 'weaviate-store',
    name: 'Weaviate Store',
    description: 'Store and retrieve vectors using Weaviate',
    icon: Database,
    category: 'Vector Stores',
    color: '#06b6d4',
    inputs: ['embeddings'],
    outputs: ['vectorId'],
    config: [
      {
        key: 'url',
        label: 'Weaviate URL',
        type: 'text',
        required: true,
        placeholder: 'http://localhost:8080',
        description: 'Weaviate server URL'
      },
      {
        key: 'className',
        label: 'Class Name',
        type: 'text',
        required: true,
        placeholder: 'Document',
        description: 'Weaviate class name for documents'
      }
    ],
    defaultData: {
      url: '',
      className: ''
    }
  },

  // AI Model Nodes
  {
    id: 'openai-chat',
    name: 'OpenAI Chat',
    description: 'Chat completion using OpenAI models',
    icon: MessageSquare,
    category: 'AI Models',
    color: '#10b981',
    inputs: ['messages'],
    outputs: ['response'],
    config: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        options: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultValue: 'gpt-4o',
        description: 'OpenAI model to use'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Creativity level (0-2)'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Maximum response length'
      }
    ],
    defaultData: {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    id: 'anthropic-chat',
    name: 'Anthropic Claude',
    description: 'Chat completion using Anthropic Claude',
    icon: MessageSquare,
    category: 'AI Models',
    color: '#8b5cf6',
    inputs: ['messages'],
    outputs: ['response'],
    config: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        options: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        defaultValue: 'claude-3-5-sonnet-20241022',
        description: 'Anthropic model to use'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Creativity level (0-1)'
      }
    ],
    defaultData: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7
    }
  },

  // Memory Nodes
  {
    id: 'conversation-memory',
    name: 'Conversation Memory',
    description: 'Store and retrieve conversation history',
    icon: Brain,
    category: 'Memory',
    color: '#f59e0b',
    inputs: ['message'],
    outputs: ['context'],
    config: [
      {
        key: 'memoryKey',
        label: 'Memory Key',
        type: 'text',
        required: true,
        placeholder: 'chat_history',
        description: 'Unique identifier for this memory'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 2000,
        description: 'Maximum tokens to store'
      }
    ],
    defaultData: {
      memoryKey: '',
      maxTokens: 2000
    }
  },

  // Tool Nodes
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    icon: Search,
    category: 'Tools',
    color: '#ef4444',
    inputs: ['query'],
    outputs: ['results'],
    config: [
      {
        key: 'searchEngine',
        label: 'Search Engine',
        type: 'select',
        required: true,
        options: ['google', 'bing', 'duckduckgo'],
        defaultValue: 'google',
        description: 'Search engine to use'
      },
      {
        key: 'maxResults',
        label: 'Max Results',
        type: 'number',
        required: false,
        defaultValue: 5,
        description: 'Maximum number of results'
      }
    ],
    defaultData: {
      searchEngine: 'google',
      maxResults: 5
    }
  },
  {
    id: 'code-executor',
    name: 'Code Executor',
    description: 'Execute Python or JavaScript code',
    icon: Code,
    category: 'Tools',
    color: '#6366f1',
    inputs: ['code', 'variables'],
    outputs: ['result', 'variables'],
    config: [
      {
        key: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['python', 'javascript'],
        defaultValue: 'python',
        description: 'Programming language to execute'
      },
      {
        key: 'timeout',
        label: 'Timeout (seconds)',
        type: 'number',
        required: false,
        defaultValue: 30,
        description: 'Execution timeout'
      }
    ],
    defaultData: {
      language: 'python',
      timeout: 30
    }
  }
];

export const getNodeTypeById = (id: string): LangChainNodeType | undefined => {
  return LANGCHAIN_NODE_TYPES.find(nodeType => nodeType.id === id);
};

export const getNodeTypesByCategory = (category: string): LangChainNodeType[] => {
  return LANGCHAIN_NODE_TYPES.filter(nodeType => nodeType.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = LANGCHAIN_NODE_TYPES.map(nodeType => nodeType.category);
  return Array.from(new Set(categories));
};
