import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./config/storage";
import { workflowEngine } from "./services/workflow-engine";
import { insertWorkflowSchema, insertWorkflowExecutionSchema } from "@shared/schema";
import { requireAuth, optionalAuth, type AuthRequest } from "./middleware/auth";
import { registerAuthRoutes } from "./routes/auth";
import { registerTestRoutes } from "./routes/test";
import { registerLangChainRoutes } from "./routes/langchain";
import { registerWorkflowRoutes } from "./routes/workflows";
import { registerSettingsRoutes } from "./routes/settings";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);
  
  // Register test routes
  registerTestRoutes(app);
  
  // Register LangChain routes
  registerLangChainRoutes(app);
  
  // Register workflow routes
  registerWorkflowRoutes(app);
  
  // Register settings routes
  registerSettingsRoutes(app);
  
  // Workflow routes (with optional auth for user scoping)
  app.get("/api/workflows", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user?.id;
      const workflows = await storage.getWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      // Optional: Add user access control here if needed
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const validatedData = insertWorkflowSchema.parse(req.body);
      const userId = req.user?.id || 'default-user';
      const workflow = await storage.createWorkflow({ ...validatedData, userId });
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid workflow data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  app.put("/api/workflows/:id", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(req.params.id, validatedData);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid workflow data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const deleted = await storage.deleteWorkflow(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Workflow execution routes
  app.post("/api/workflows/:id/execute", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const execution = await workflowEngine.executeWorkflow(
        workflow.id,
        workflow.nodes as any[],
        workflow.edges as any[],
        req.body
      );

      res.json(execution);
    } catch (error) {
      console.error("Workflow execution error:", error);
      res.status(500).json({ 
        error: "Workflow execution failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/workflows/:id/executions", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const executions = await storage.getWorkflowExecutions(req.params.id);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch executions" });
    }
  });

  app.get("/api/executions/:id", optionalAuth, async (req, res) => {
    try {
      const storage = await getStorage();
      const execution = await storage.getWorkflowExecution(req.params.id);
      if (!execution) {
        return res.status(404).json({ error: "Execution not found" });
      }
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch execution" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      // Return predefined templates
      const templates = [
        {
          id: "customer-support",
          name: "Customer Support Agent",
          description: "AI agent that handles customer inquiries with sentiment analysis and escalation",
          category: "customer-service",
          nodes: [
            {
              id: "trigger-1",
              type: "webhook",
              position: { x: 100, y: 100 },
              data: { name: "Customer Message" }
            },
            {
              id: "openai-1",
              type: "openai",
              position: { x: 400, y: 100 },
              data: {
                name: "Analyze Message",
                systemPrompt: "You are a customer support AI. Analyze the customer message and provide an appropriate response.",
                model: "gpt-4o",
                temperature: 0.7
              }
            },
            {
              id: "condition-1",
              type: "condition",
              position: { x: 700, y: 100 },
              data: {
                name: "Check Sentiment",
                condition: "sentiment > 0.7"
              }
            },
            {
              id: "email-1",
              type: "email",
              position: { x: 1000, y: 50 },
              data: {
                name: "Send Alert",
                to: "support@company.com",
                subject: "Positive Customer Feedback"
              }
            },
            {
              id: "escalate-1",
              type: "webhook-response",
              position: { x: 1000, y: 150 },
              data: {
                name: "Escalate Issue",
                responseData: "{ \"action\": \"escalate\", \"priority\": \"high\" }"
              }
            }
          ],
          edges: [
            { id: "e1-2", source: "trigger-1", target: "openai-1" },
            { id: "e2-3", source: "openai-1", target: "condition-1" },
            { id: "e3-4", source: "condition-1", target: "email-1" },
            { id: "e3-5", source: "condition-1", target: "escalate-1" }
          ]
        },
        {
          id: "content-generator",
          name: "Content Generator",
          description: "Generate blog posts, social media content, and marketing materials",
          category: "content",
          nodes: [
            {
              id: "manual-1",
              type: "manual",
              position: { x: 100, y: 100 },
              data: { name: "Manual Trigger" }
            },
            {
              id: "openai-1",
              type: "openai",
              position: { x: 400, y: 100 },
              data: {
                name: "Generate Content",
                systemPrompt: "You are a content creation AI. Generate engaging content based on the provided topic.",
                model: "gpt-4o"
              }
            }
          ],
          edges: [
            { id: "e1-2", source: "manual-1", target: "openai-1" }
          ]
        },
        {
          id: "document-qa",
          name: "Document Q&A System",
          description: "RAG system for answering questions from PDF documents using vector search",
          category: "rag",
          nodes: [
            {
              id: "pdf-1",
              type: "pdf-loader",
              position: { x: 100, y: 100 },
              data: {
                name: "Load PDF",
                filePath: "/path/to/document.pdf"
              }
            },
            {
              id: "vector-1",
              type: "pinecone-store",
              position: { x: 400, y: 100 },
              data: {
                name: "Vector Store",
                apiKey: "your-pinecone-api-key",
                environment: "us-west1-gcp",
                indexName: "knowledge-base"
              }
            },
            {
              id: "openai-1",
              type: "openai-chat",
              position: { x: 700, y: 100 },
              data: {
                name: "Answer Questions",
                model: "gpt-4o",
                temperature: 0.7,
                maxTokens: 1000
              }
            }
          ],
          edges: [
            { id: "e1-2", source: "pdf-1", target: "vector-1" },
            { id: "e2-3", source: "vector-1", target: "openai-1" }
          ]
        },
        {
          id: "web-research-agent",
          name: "Web Research Agent",
          description: "AI agent that researches topics by searching the web and analyzing content",
          category: "research",
          nodes: [
            {
              id: "manual-1",
              type: "manual",
              position: { x: 100, y: 100 },
              data: { name: "Research Topic" }
            },
            {
              id: "search-1",
              type: "web-search",
              position: { x: 400, y: 100 },
              data: {
                name: "Web Search",
                searchEngine: "google",
                maxResults: 5
              }
            },
            {
              id: "scraper-1",
              type: "url-scraper",
              position: { x: 700, y: 100 },
              data: {
                name: "Scrape Content",
                url: "{{search_results[0].url}}",
                selector: "body"
              }
            },
            {
              id: "claude-1",
              type: "anthropic-chat",
              position: { x: 1000, y: 100 },
              data: {
                name: "Analyze & Summarize",
                model: "claude-3-5-sonnet-20241022",
                temperature: 0.3
              }
            }
          ],
          edges: [
            { id: "e1-2", source: "manual-1", target: "search-1" },
            { id: "e2-3", source: "search-1", target: "scraper-1" },
            { id: "e3-4", source: "scraper-1", target: "claude-1" }
          ]
        },
        {
          id: "ai-code-assistant",
          name: "AI Code Assistant",
          description: "AI-powered code review, generation, and optimization workflow",
          category: "development",
          nodes: [
            {
              id: "code-input",
              type: "manual",
              position: { x: 100, y: 100 },
              data: { label: "Code Input", nodeType: "manual" }
            },
            {
              id: "code-executor",
              type: "code-executor",
              position: { x: 300, y: 100 },
              data: {
                name: "Code Executor",
                type: "code-executor",
                category: "Tools",
                color: "#f97316",
                config: {
                  code: "{{input_code}}",
                  language: "python",
                  timeout: 30
                }
              }
            },
            {
              id: "code-reviewer",
              type: "openai-chat",
              position: { x: 500, y: 100 },
              data: {
                name: "Code Reviewer",
                type: "openai-chat",
                category: "AI Models",
                color: "#10b981",
                config: {
                  messages: [
                    { role: "system", content: "You are an expert code reviewer. Review the code for bugs, security issues, and improvements." },
                    { role: "user", content: "Review this code:\n{{input_code}}\n\nExecution result: {{code_executor.result}}" }
                  ],
                  model: "gpt-4o",
                  temperature: 0.2,
                  maxTokens: 1500
                }
              }
            },
            {
              id: "code-optimizer",
              type: "anthropic-chat",
              position: { x: 700, y: 100 },
              data: {
                name: "Code Optimizer",
                type: "anthropic-chat",
                category: "AI Models",
                color: "#10b981",
                config: {
                  messages: [
                    { role: "system", content: "You are a code optimization expert. Suggest improvements and optimizations." },
                    { role: "user", content: "Optimize this code:\n{{input_code}}\n\nReview feedback: {{code_reviewer.response}}" }
                  ],
                  model: "claude-3-5-sonnet-20241022",
                  temperature: 0.3
                }
              }
            }
          ],
          edges: [
            { id: "e1", source: "code-input", target: "code-executor" },
            { id: "e2", source: "code-input", target: "code-reviewer" },
            { id: "e3", source: "code-executor", target: "code-reviewer" },
            { id: "e4", source: "code-reviewer", target: "code-optimizer" }
          ]
        },
        {
          id: "conversational-ai",
          name: "Conversational AI with Memory",
          description: "AI chatbot with conversation memory and context retention",
          category: "conversation",
          nodes: [
            {
              id: "user-input",
              type: "manual",
              position: { x: 100, y: 100 },
              data: { label: "User Input", nodeType: "manual" }
            },
            {
              id: "conversation-memory",
              type: "conversation-memory",
              position: { x: 300, y: 100 },
              data: {
                name: "Conversation Memory",
                type: "conversation-memory",
                category: "Memory",
                color: "#eab308",
                config: {
                  memoryKey: "chat_history",
                  maxTokens: 2000
                }
              }
            },
            {
              id: "ai-chat",
              type: "openai-chat",
              position: { x: 500, y: 100 },
              data: {
                name: "AI Chat",
                type: "openai-chat",
                category: "AI Models",
                color: "#10b981",
                config: {
                  messages: [
                    { role: "system", content: "You are a helpful AI assistant. Use conversation memory to maintain context." },
                    { role: "user", content: "{{user_input}}" }
                  ],
                  model: "gpt-4o",
                  temperature: 0.7,
                  maxTokens: 1000
                }
              }
            },
            {
              id: "response-output",
              type: "webhook-response",
              position: { x: 700, y: 100 },
              data: {
                label: "Response Output",
                nodeType: "webhook-response",
                responseData: "{{ai_chat.response}}"
              }
            }
          ],
          edges: [
            { id: "e1", source: "user-input", target: "conversation-memory" },
            { id: "e2", source: "conversation-memory", target: "ai-chat" },
            { id: "e3", source: "ai-chat", target: "response-output" }
          ]
        }
      ];
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
