import type { Express, Request, Response } from "express";
import { z } from "zod";

const apiKeysSchema = z.record(z.string());

export function registerSettingsRoutes(app: Express): void {
  // Save API keys
  app.post("/api/settings/api-keys", async (req: Request, res: Response) => {
    try {
      const validatedData = apiKeysSchema.parse(req.body);
      
      // Set environment variables for the current process
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value && value.trim()) {
          process.env[key] = value.trim();
        }
      });

      res.json({
        success: true,
        message: "API keys saved successfully",
        savedKeys: Object.keys(validatedData),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Failed to save API keys:", error);
      res.status(500).json({ error: "Failed to save API keys" });
    }
  });

  // Get current API key status
  app.get("/api/settings/api-keys/status", async (req: Request, res: Response) => {
    try {
      const status = {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        pinecone: !!process.env.PINECONE_API_KEY,
        weaviate: !!process.env.WEAVIATE_API_KEY,
        cohere: !!process.env.COHERE_API_KEY,
        mistral: !!process.env.MISTRAL_API_KEY,
        timestamp: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      console.error("Failed to get API key status:", error);
      res.status(500).json({ error: "Failed to get API key status" });
    }
  });

  // Health check for settings
  app.get("/api/settings/health", async (req: Request, res: Response) => {
    try {
      res.json({
        status: "healthy",
        service: "AgentFlow Settings",
        timestamp: new Date().toISOString(),
        features: {
          apiKeyManagement: true,
          dynamicConfiguration: true,
          secureStorage: true
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Settings health check failed" });
    }
  });
}
