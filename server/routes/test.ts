import type { Express, Request, Response } from "express";
import { llmService } from "../services/llm-service";
import { langChainService } from "../services/langchain-service";

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

  // Test LangChain services
  app.post("/api/test/langchain", async (req: Request, res: Response) => {
    try {
      console.log("🧪 Testing LangChain services...");
      
      // Test basic LangChain functionality
      const testResults = {
        openai: null as any,
        memory: null as any,
        search: null as any,
        code: null as any
      };

      try {
        // Test OpenAI chat
        testResults.openai = await langChainService.chatWithOpenAI([
          { role: 'user', content: 'Hello, this is a LangChain test!' }
        ], 'gpt-4o', 0.7, 100);
      } catch (error) {
        testResults.openai = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      try {
        // Test conversation memory
        testResults.memory = await langChainService.createConversationMemory('test-memory', 1000);
      } catch (error) {
        testResults.memory = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      try {
        // Test web search
        testResults.search = await langChainService.webSearch('test query', 'google', 3);
      } catch (error) {
        testResults.search = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      try {
        // Test code execution
        testResults.code = await langChainService.executeCode('print("Hello World")', 'python', 10);
      } catch (error) {
        testResults.code = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      console.log("✅ LangChain services test completed:", testResults);
      res.json({ success: true, results: testResults });
    } catch (error) {
      console.error("❌ LangChain services test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to test LangChain services" 
      });
    }
  });
}