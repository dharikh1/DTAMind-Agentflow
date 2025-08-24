import type { Express, Request, Response } from "express";
import { z } from "zod";
import { workflowEngine } from "../services/workflow-engine";
import { getStorage } from "../config/storage";

// Validation schemas
const workflowExecutionSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
  inputs: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

const workflowCreateSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

export function registerWorkflowRoutes(app: Express): void {
  // Get all workflows
  app.get("/api/workflows", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  // Get workflow by ID
  app.get("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      const workflow = await storage.getWorkflow(id);
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      console.error("Failed to fetch workflow:", error);
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  // Create new workflow
  app.post("/api/workflows", async (req: Request, res: Response) => {
    try {
      const validatedData = workflowCreateSchema.parse(req.body);
      const storage = await getStorage();
      
      const workflow = await storage.createWorkflow({
        name: validatedData.name,
        description: validatedData.description || "",
        nodes: validatedData.nodes || [],
        edges: validatedData.edges || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Failed to create workflow:", error);
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  // Update workflow
  app.put("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = workflowCreateSchema.parse(req.body);
      const storage = await getStorage();
      
      const workflow = await storage.updateWorkflow(id, {
        name: validatedData.name,
        description: validatedData.description || "",
        nodes: validatedData.nodes || [],
        edges: validatedData.edges || [],
        updatedAt: new Date(),
      });
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Failed to update workflow:", error);
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  // Delete workflow
  app.delete("/api/workflows/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      
      const success = await storage.deleteWorkflow(id);
      
      if (!success) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      
      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Execute workflow
  app.post("/api/workflows/execute", async (req: Request, res: Response) => {
    try {
      const validatedData = workflowExecutionSchema.parse(req.body);
      const storage = await getStorage();
      
      // Get the workflow
      const workflow = await storage.getWorkflow(validatedData.workflowId);
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      console.log(`🚀 Executing workflow: ${workflow.name} (${workflow.id})`);
      console.log(`📥 Inputs:`, validatedData.inputs);

      // Execute the workflow
      const execution = await workflowEngine.executeWorkflow(
        workflow.id,
        workflow.nodes || [],
        workflow.edges || [],
        validatedData.inputs
      );

      console.log(`✅ Workflow execution completed:`, execution);

      res.json({
        success: true,
        executionId: execution.id,
        status: execution.status,
        output: execution.output,
        executionTime: execution.completedAt && execution.createdAt 
          ? new Date(execution.completedAt).getTime() - new Date(execution.createdAt).getTime()
          : null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ Workflow execution failed:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      
      res.status(500).json({ 
        success: false,
        error: "Workflow execution failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get workflow executions
  app.get("/api/workflows/:id/executions", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      
      const executions = await storage.getWorkflowExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error("Failed to fetch workflow executions:", error);
      res.status(500).json({ error: "Failed to fetch workflow executions" });
    }
  });

  // Get specific execution
  app.get("/api/executions/:executionId", async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const storage = await getStorage();
      
      const execution = await storage.getWorkflowExecution(executionId);
      
      if (!execution) {
        return res.status(404).json({ error: "Execution not found" });
      }
      
      res.json(execution);
    } catch (error) {
      console.error("Failed to fetch execution:", error);
      res.status(500).json({ error: "Failed to fetch execution" });
    }
  });

  // Health check for workflow engine
  app.get("/api/workflows/health", async (req: Request, res: Response) => {
    try {
      res.json({
        status: "healthy",
        engine: "AgentFlow Workflow Engine",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        features: {
          langchain: true,
          rag: true,
          aiModels: true,
          vectorStores: true,
          memory: true,
          tools: true
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Health check failed" });
    }
  });
}
