# 🚀 AgentFlow - Professional Workflow Automation Platform

> **Transform your workflows into intelligent, AI-powered automation systems with a Flowise-inspired interface**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

## ✨ Overview

AgentFlow is a powerful, full-stack workflow automation platform that combines the simplicity of visual workflow design with the power of AI and LangChain integration. Built with modern technologies and inspired by Flowise, it provides a professional interface for creating, managing, and executing complex AI workflows.

## 🌟 Key Features

### 🎯 **Core Workflow Engine**
- **Visual Workflow Builder** - Drag-and-drop interface for creating workflows
- **Node Library** - Extensive collection of pre-built nodes for common tasks
- **Real-time Execution** - Monitor and track workflow runs in real-time
- **Template System** - Pre-built workflow templates for quick start

### 🤖 **AI & LangChain Integration**
- **Multi-LLM Support** - OpenAI, Anthropic, Google Gemini, Cohere, Mistral
- **Vector Store Integration** - Pinecone, Weaviate for RAG workflows
- **Document Processing** - PDF, CSV, and web scraping capabilities
- **Memory Management** - Conversation memory and context preservation
- **Tool Integration** - Web search, code execution, and custom tools

### 🎨 **Professional UI/UX**
- **Modern Dashboard** - Professional overview with statistics and quick actions
- **Enhanced Navigation** - Intuitive navigation between different sections
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Theme Support** - Light and dark mode support

### 🔑 **API Key Management**
- **Centralized Management** - Manage all API keys in one place
- **Secure Storage** - Local storage with encryption support
- **Testing Interface** - Test API keys before using them
- **Import/Export** - Backup and restore your API configurations

### 📊 **Monitoring & Analytics**
- **Execution History** - Track all workflow runs with detailed logs
- **Performance Metrics** - Success rates, execution times, and statistics
- **Real-time Monitoring** - Live updates on running workflows
- **Error Tracking** - Detailed error logs and debugging information

## 🏗️ Architecture

```
AgentFlow/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
├── server/                 # Express.js backend server
│   ├── services/          # Business logic services
│   ├── routes/            # API endpoint definitions
│   ├── middleware/        # Express middleware
│   └── config/            # Server configuration
└── shared/                 # Shared schemas and types
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Git** for cloning the repository
- **API Keys** for AI services (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AgentFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development servers**
   ```bash
   npm run dev:full
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/agentflow

# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
COHERE_API_KEY=your_cohere_api_key
MISTRAL_API_KEY=your_mistral_api_key

# Vector Store Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
WEAVIATE_API_KEY=your_weaviate_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### API Key Setup

1. **Navigate to Settings** → **API Keys**
2. **Add your API keys** for the services you want to use
3. **Test each key** to ensure they're working
4. **Save your configuration**

## 🎯 Usage Examples

### Creating Your First Workflow

1. **Start from Dashboard**
   - Click "Create New Workflow" on the dashboard
   - Or use a template from the Templates section

2. **Add Nodes**
   - Drag nodes from the node library to the canvas
   - Connect nodes to create your workflow logic
   - Configure node properties in the properties panel

3. **Configure AI Services**
   - Set up your API keys in the Settings
   - Configure LLM parameters for each AI node
   - Set up vector stores for RAG workflows

4. **Test and Execute**
   - Use the "Test Node" feature to test individual nodes
   - Execute the entire workflow with sample inputs
   - Monitor execution in real-time

### Workflow Templates

AgentFlow comes with several pre-built templates:

- **Customer Support Bot** - Automated customer service workflows
- **Document Q&A System** - RAG-based document processing
- **Web Research Agent** - Automated web research and summarization
- **AI Code Assistant** - Code generation and review workflows
- **Conversational AI** - Chatbot and conversation management

### LangChain Integration

```typescript
// Example: Creating a RAG workflow
const workflow = {
  nodes: [
    {
      type: 'pdf-loader',
      config: { filePath: 'document.pdf' }
    },
    {
      type: 'pinecone-store',
      config: { 
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT
      }
    },
    {
      type: 'openai-chat',
      config: { 
        model: 'gpt-4',
        temperature: 0.7
      }
    }
  ]
};
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start backend server only
npm run dev:frontend     # Start frontend server only
npm run dev:full         # Start both servers concurrently

# Building
npm run build            # Build frontend for production
npm run build:server     # Build backend for production

# Testing
npm run test             # Run test suite
npm run test:watch       # Run tests in watch mode

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Type checking
npm run type-check       # Run TypeScript compiler check
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── layout/         # Layout components (navbar, sidebar)
│   └── workflow/       # Workflow-specific components
├── pages/              # Application pages
│   ├── dashboard.tsx   # Main dashboard
│   ├── workflow-builder.tsx  # Workflow creation interface
│   ├── templates.tsx   # Workflow templates
│   ├── executions.tsx  # Execution monitoring
│   └── settings.tsx    # Application settings
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions
```

### Adding New Node Types

1. **Define the node type** in `lib/node-types.ts`
2. **Create the node component** in `components/workflow/`
3. **Add execution logic** in `server/services/workflow-engine.ts`
4. **Update the properties panel** for configuration

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build
npm run build:server

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment Considerations

- **Database**: Use PostgreSQL for production
- **API Keys**: Store securely using environment variables
- **SSL**: Enable HTTPS for production deployments
- **Monitoring**: Set up logging and monitoring solutions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and add tests
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📚 API Reference

### Core Endpoints

- `GET /api/health` - Health check
- `GET /api/templates` - Get workflow templates
- `POST /api/workflows` - Create new workflow
- `POST /api/workflows/execute` - Execute workflow
- `GET /api/executions` - Get execution history

### LangChain Endpoints

- `POST /api/langchain/pdf` - Process PDF documents
- `POST /api/langchain/openai` - OpenAI chat completion
- `POST /api/langchain/pinecone` - Vector store operations
- `POST /api/langchain/search` - Web search functionality

### Settings Endpoints

- `POST /api/settings/api-keys` - Save API keys
- `GET /api/settings/health` - Settings service health

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes using ports 5000 or 5173
   lsof -ti:5000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **API Key Errors**
   - Ensure all required API keys are set in `.env`
   - Check API key validity in the Settings panel
   - Verify API key permissions and quotas

3. **LangChain Import Errors**
   ```bash
   # Reinstall LangChain packages
   npm install @langchain/openai @langchain/anthropic --legacy-peer-deps
   ```

4. **Database Connection Issues**
   - Verify `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Check database permissions

### Getting Help

- **Check the logs** in the terminal for detailed error messages
- **Review the documentation** for common solutions
- **Open an issue** on GitHub with detailed error information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flowise** - Inspiration for the UI/UX design
- **LangChain** - AI workflow capabilities
- **ReactFlow** - Workflow visualization
- **Shadcn/ui** - Beautiful UI components

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Made with ❤️ by the AgentFlow Team**

*Transform your workflows, amplify your productivity*
