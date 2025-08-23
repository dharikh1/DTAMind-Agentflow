import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./config/storage";
import { workflowEngine } from "./services/workflow-engine";
import { insertWorkflowSchema, insertWorkflowExecutionSchema } from "@shared/schema";
import { requireAuth, optionalAuth, type AuthRequest } from "./middleware/auth";
import { registerAuthRoutes } from "./routes/auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);
  
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
