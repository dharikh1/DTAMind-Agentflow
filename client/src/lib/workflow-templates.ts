export const WORKFLOW_TEMPLATES = {
  'customer-support': {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'AI agent that handles customer inquiries with sentiment analysis and escalation',
    category: 'customer-service',
    nodes: [
      {
        id: 'trigger-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'webhook',
          label: 'Customer Message',
          description: 'Incoming customer support request',
          category: 'inputs'
        }
      },
      {
        id: 'openai-1',
        type: 'customNode',
        position: { x: 400, y: 100 },
        data: {
          nodeType: 'openai',
          label: 'Analyze Message',
          description: 'Analyze customer sentiment and generate response',
          category: 'ai',
          model: 'gpt-4o',
          temperature: 0.7,
          systemPrompt: 'You are a customer support AI. Analyze the customer message sentiment and provide an appropriate response. Return a JSON object with sentiment score (0-1) and response.',
          userMessage: 'Customer message: {{input.message}}'
        }
      },
      {
        id: 'condition-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: {
          nodeType: 'condition',
          label: 'Check Sentiment',
          description: 'Route based on customer sentiment',
          category: 'processing',
          condition: 'previousResults.sentiment > 0.7'
        }
      },
      {
        id: 'email-1',
        type: 'customNode',
        position: { x: 1000, y: 50 },
        data: {
          nodeType: 'email',
          label: 'Positive Feedback Alert',
          description: 'Notify team of positive feedback',
          category: 'outputs',
          to: 'support@company.com',
          subject: 'Positive Customer Feedback Received',
          body: 'We received positive feedback: {{previousResults.response}}'
        }
      },
      {
        id: 'escalate-1',
        type: 'customNode',
        position: { x: 1000, y: 150 },
        data: {
          nodeType: 'webhook-response',
          label: 'Escalate Issue',
          description: 'Create high priority support ticket',
          category: 'outputs',
          statusCode: 200,
          responseData: '{"action": "escalate", "priority": "high", "response": "{{previousResults.response}}"}'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'openai-1' },
      { id: 'e2-3', source: 'openai-1', target: 'condition-1' },
      { id: 'e3-4', source: 'condition-1', target: 'email-1', sourceHandle: 'true' },
      { id: 'e3-5', source: 'condition-1', target: 'escalate-1', sourceHandle: 'false' }
    ]
  },

  'content-generator': {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Generate blog posts, social media content, and marketing materials',
    category: 'content',
    nodes: [
      {
        id: 'manual-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'manual',
          label: 'Manual Trigger',
          description: 'Start content generation process',
          category: 'inputs'
        }
      },
      {
        id: 'openai-1',
        type: 'customNode',
        position: { x: 400, y: 100 },
        data: {
          nodeType: 'openai',
          label: 'Generate Content',
          description: 'Create engaging content based on topic',
          category: 'ai',
          model: 'gpt-4o',
          temperature: 0.8,
          maxTokens: 500,
          systemPrompt: 'You are a content creation AI. Generate engaging, SEO-friendly content based on the provided topic and target audience.',
          userMessage: 'Topic: {{input.topic}}\nTarget Audience: {{input.audience}}\nContent Type: {{input.contentType}}'
        }
      },
      {
        id: 'code-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: {
          nodeType: 'code',
          label: 'Format Output',
          description: 'Format content for publishing',
          category: 'processing',
          language: 'javascript',
          code: `
// Format the generated content
const content = previousResults['openai-1'].response;
const formatted = {
  title: content.split('\\n')[0],
  body: content.split('\\n').slice(1).join('\\n'),
  wordCount: content.split(' ').length,
  generatedAt: new Date().toISOString()
};
return formatted;
          `
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'manual-1', target: 'openai-1' },
      { id: 'e2-3', source: 'openai-1', target: 'code-1' }
    ]
  },

  'data-analysis': {
    id: 'data-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Automated data processing and insight generation with visualizations',
    category: 'analytics',
    nodes: [
      {
        id: 'schedule-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'schedule',
          label: 'Daily Analysis',
          description: 'Trigger daily at 9 AM',
          category: 'inputs',
          cron: '0 9 * * *',
          timezone: 'UTC'
        }
      },
      {
        id: 'code-1',
        type: 'customNode',
        position: { x: 400, y: 100 },
        data: {
          nodeType: 'code',
          label: 'Fetch Data',
          description: 'Retrieve data from database',
          category: 'processing',
          language: 'javascript',
          code: `
// Simulate data fetching
const data = {
  sales: Math.floor(Math.random() * 10000) + 5000,
  users: Math.floor(Math.random() * 1000) + 500,
  revenue: Math.floor(Math.random() * 50000) + 20000
};
return { data, timestamp: new Date().toISOString() };
          `
        }
      },
      {
        id: 'openai-1',
        type: 'customNode',
        position: { x: 700, y: 100 },
        data: {
          nodeType: 'openai',
          label: 'Generate Insights',
          description: 'AI-powered data analysis',
          category: 'ai',
          model: 'gpt-4o',
          temperature: 0.3,
          systemPrompt: 'You are a data analyst AI. Analyze the provided data and generate actionable insights and recommendations.',
          userMessage: 'Data to analyze: {{previousResults}}'
        }
      },
      {
        id: 'email-1',
        type: 'customNode',
        position: { x: 1000, y: 100 },
        data: {
          nodeType: 'email',
          label: 'Daily Report',
          description: 'Send analysis report to team',
          category: 'outputs',
          to: 'analytics@company.com',
          subject: 'Daily Analytics Report - {{new Date().toDateString()}}',
          body: 'Here are today\'s insights:\n\n{{previousResults.response}}'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'schedule-1', target: 'code-1' },
      { id: 'e2-3', source: 'code-1', target: 'openai-1' },
      { id: 'e3-4', source: 'openai-1', target: 'email-1' }
    ]
  }
};

export type TemplateKey = keyof typeof WORKFLOW_TEMPLATES;
