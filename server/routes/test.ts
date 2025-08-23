import type { Express, Request, Response } from "express";
import { llmService } from "../services/llm-service";

export function registerTestRoutes(app: Express): void {
  // Test OpenAI integration endpoint
  app.post("/api/test/openai", async (req: Request, res: Response) => {
    try {
      const { message = "Hello, can you respond to test the connection?" } = req.body;
      
      console.log("🧪 Testing OpenAI connection...");
      
      const response = await llmService.generateResponse(
        'openai',
        'gpt-4o',
        message,
        { test: true }
      );
      
      console.log("✅ OpenAI API test successful!");
      
      res.json({
        success: true,
        message: "OpenAI API test successful!",
        input: message,
        response: response,
        provider: 'openai',
        model: 'gpt-4o',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ OpenAI API test failed:", error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI test failed',
        details: 'Check if OPENAI_API_KEY environment variable is set correctly'
      });
    }
  });
  
  // Test other providers
  app.post("/api/test/llm/:provider", async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const { message = "Hello, can you respond to test the connection?", model } = req.body;
      
      console.log(`🧪 Testing ${provider} connection...`);
      
      const response = await llmService.generateResponse(
        provider,
        model || 'gpt-4o',
        message,
        { test: true }
      );
      
      console.log(`✅ ${provider} API test successful!`);
      
      res.json({
        success: true,
        message: `${provider} API test successful!`,
        input: message,
        response: response,
        provider,
        model: model || 'default',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ ${provider} API test failed:`, error);
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : `${provider} test failed`,
        details: `Check if ${provider.toUpperCase()}_API_KEY environment variable is set correctly`
      });
    }
  });
}