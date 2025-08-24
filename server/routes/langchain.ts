import type { Express, Request, Response } from "express";
import { z } from "zod";
import { langChainService } from "../services/langchain-service";

// Validation schemas
const pdfProcessingSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  pages: z.string().optional(),
});

const csvProcessingSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  delimiter: z.string().optional(),
});

const urlScrapingSchema = z.object({
  url: z.string().url("Valid URL is required"),
  selector: z.string().optional(),
});

const pineconeStoreSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  environment: z.string().min(1, "Environment is required"),
  indexName: z.string().min(1, "Index name is required"),
});

const weaviateStoreSchema = z.object({
  url: z.string().url("Valid URL is required"),
  className: z.string().min(1, "Class name is required"),
});

const openaiChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1, "Message content is required"),
  })),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

const anthropicChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1, "Message content is required"),
  })),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
});

const memorySchema = z.object({
  memoryKey: z.string().min(1, "Memory key is required"),
  maxTokens: z.number().positive().optional(),
});

const webSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  searchEngine: z.enum(["google", "bing", "duckduckgo"]).optional(),
  maxResults: z.number().positive().optional(),
});

const codeExecutionSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.enum(["python", "javascript"]).optional(),
  timeout: z.number().positive().optional(),
});

const ragWorkflowSchema = z.object({
  documents: z.array(z.string()).min(1, "At least one document is required"),
  question: z.string().min(1, "Question is required"),
  vectorStoreId: z.string().min(1, "Vector store ID is required"),
});

export function registerLangChainRoutes(app: Express): void {
  // Document Processing Routes
  app.post("/api/langchain/pdf", async (req: Request, res: Response) => {
    try {
      const validatedData = pdfProcessingSchema.parse(req.body);
      const result = await langChainService.processPDF(
        validatedData.filePath,
        validatedData.pages
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("PDF processing error:", error);
      res.status(500).json({ error: "PDF processing failed" });
    }
  });

  app.post("/api/langchain/csv", async (req: Request, res: Response) => {
    try {
      const validatedData = csvProcessingSchema.parse(req.body);
      const result = await langChainService.processCSV(
        validatedData.filePath,
        validatedData.delimiter
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("CSV processing error:", error);
      res.status(500).json({ error: "CSV processing failed" });
    }
  });

  app.post("/api/langchain/scrape", async (req: Request, res: Response) => {
    try {
      const validatedData = urlScrapingSchema.parse(req.body);
      const result = await langChainService.scrapeURL(
        validatedData.url,
        validatedData.selector
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("URL scraping error:", error);
      res.status(500).json({ error: "URL scraping failed" });
    }
  });

  // Vector Store Routes
  app.post("/api/langchain/pinecone", async (req: Request, res: Response) => {
    try {
      const validatedData = pineconeStoreSchema.parse(req.body);
      const result = await langChainService.createPineconeStore(
        validatedData.apiKey,
        validatedData.environment,
        validatedData.indexName
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Pinecone store creation error:", error);
      res.status(500).json({ error: "Pinecone store creation failed" });
    }
  });

  app.post("/api/langchain/weaviate", async (req: Request, res: Response) => {
    try {
      const validatedData = weaviateStoreSchema.parse(req.body);
      const result = await langChainService.createWeaviateStore(
        validatedData.url,
        validatedData.className
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Weaviate store creation error:", error);
      res.status(500).json({ error: "Weaviate store creation failed" });
    }
  });

  app.post("/api/langchain/vectors", async (req: Request, res: Response) => {
    try {
      const { content, vectorStoreId, metadata } = req.body;
      
      if (!content || !vectorStoreId) {
        return res.status(400).json({ error: "Content and vector store ID are required" });
      }
      
      const result = await langChainService.storeVectors(content, vectorStoreId, metadata);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Vector storage error:", error);
      res.status(500).json({ error: "Vector storage failed" });
    }
  });

  // LLM Routes
  app.post("/api/langchain/openai", async (req: Request, res: Response) => {
    try {
      const validatedData = openaiChatSchema.parse(req.body);
      const result = await langChainService.chatWithOpenAI(
        validatedData.messages,
        validatedData.model,
        validatedData.temperature,
        validatedData.maxTokens
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("OpenAI chat error:", error);
      res.status(500).json({ error: "OpenAI chat failed" });
    }
  });

  app.post("/api/langchain/anthropic", async (req: Request, res: Response) => {
    try {
      const validatedData = anthropicChatSchema.parse(req.body);
      const result = await langChainService.chatWithAnthropic(
        validatedData.messages,
        validatedData.model,
        validatedData.temperature
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Anthropic chat error:", error);
      res.status(500).json({ error: "Anthropic chat failed" });
    }
  });

  // Memory Routes
  app.post("/api/langchain/memory", async (req: Request, res: Response) => {
    try {
      const validatedData = memorySchema.parse(req.body);
      const result = await langChainService.createConversationMemory(
        validatedData.memoryKey,
        validatedData.maxTokens
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Memory creation error:", error);
      res.status(500).json({ error: "Memory creation failed" });
    }
  });

  // Tool Routes
  app.post("/api/langchain/search", async (req: Request, res: Response) => {
    try {
      const validatedData = webSearchSchema.parse(req.body);
      const result = await langChainService.webSearch(
        validatedData.query,
        validatedData.searchEngine,
        validatedData.maxResults
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Web search error:", error);
      res.status(500).json({ error: "Web search failed" });
    }
  });

  app.post("/api/langchain/execute", async (req: Request, res: Response) => {
    try {
      const validatedData = codeExecutionSchema.parse(req.body);
      const result = await langChainService.executeCode(
        validatedData.code,
        validatedData.language,
        validatedData.timeout
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Code execution error:", error);
      res.status(500).json({ error: "Code execution failed" });
    }
  });

  // RAG Workflow Route
  app.post("/api/langchain/rag", async (req: Request, res: Response) => {
    try {
      const validatedData = ragWorkflowSchema.parse(req.body);
      const result = await langChainService.createRAGWorkflow(
        validatedData.documents,
        validatedData.question,
        validatedData.vectorStoreId
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("RAG workflow error:", error);
      res.status(500).json({ error: "RAG workflow failed" });
    }
  });

  // Health check for LangChain services
  app.get("/api/langchain/health", async (req: Request, res: Response) => {
    try {
      res.json({
        status: "healthy",
        services: {
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          documentProcessing: true,
          vectorStores: true,
          memory: true,
          tools: true,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Health check failed" });
    }
  });

  // Comprehensive test endpoint for all LangChain functionality
  app.post("/api/langchain/test-all", async (req: Request, res: Response) => {
    try {
      const results: {
        timestamp: string;
        tests: Record<string, any>;
        summary?: {
          totalTests: number;
          successfulTests: number;
          failedTests: number;
          successRate: string;
          overallStatus: string;
        };
      } = {
        timestamp: new Date().toISOString(),
        tests: {}
      };

      // Test document processing
      try {
        const pdfResult = await langChainService.processPDF('/test/path.pdf', '1-3');
        results.tests.pdfProcessing = {
          success: pdfResult.success,
          error: pdfResult.error || null
        };
      } catch (error) {
        results.tests.pdfProcessing = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test vector stores
      try {
        const pineconeResult = await langChainService.createPineconeStore('test-key', 'test-env', 'test-index');
        results.tests.pineconeStore = {
          success: pineconeResult.success,
          error: pineconeResult.error || null
        };
      } catch (error) {
        results.tests.pineconeStore = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test LLM services
      try {
        const openaiResult = await langChainService.chatWithOpenAI([
          { role: 'user', content: 'Hello, this is a test message.' }
        ], 'gpt-4o', 0.7, 100);
        results.tests.openaiChat = {
          success: openaiResult.success,
          error: openaiResult.error || null
        };
      } catch (error) {
        results.tests.openaiChat = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test memory
      try {
        const memoryResult = await langChainService.createConversationMemory('test-memory', 1000);
        results.tests.conversationMemory = {
          success: memoryResult.success,
          error: memoryResult.error || null
        };
      } catch (error) {
        results.tests.conversationMemory = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test tools
      try {
        const searchResult = await langChainService.webSearch('test query', 'google', 3);
        results.tests.webSearch = {
          success: searchResult.success,
          error: searchResult.error || null
        };
      } catch (error) {
        results.tests.webSearch = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test code execution
      try {
        const codeResult = await langChainService.executeCode('print("Hello World")', 'python', 10);
        results.tests.codeExecution = {
          success: codeResult.success,
          error: codeResult.error || null
        };
      } catch (error) {
        results.tests.codeExecution = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test RAG workflow
      try {
        const ragResult = await langChainService.createRAGWorkflow(
          ['This is a test document about AI and machine learning.'],
          'What is AI?',
          'test-vector-store'
        );
        results.tests.ragWorkflow = {
          success: ragResult.success,
          error: ragResult.error || null
        };
      } catch (error) {
        results.tests.ragWorkflow = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Calculate overall success rate
      const testCount = Object.keys(results.tests).length;
      const successCount = Object.values(results.tests).filter((test: any) => test.success).length;
      const successRate = (successCount / testCount) * 100;

      results.summary = {
        totalTests: testCount,
        successfulTests: successCount,
        failedTests: testCount - successCount,
        successRate: `${successRate.toFixed(1)}%`,
        overallStatus: successRate >= 80 ? 'healthy' : successRate >= 60 ? 'degraded' : 'unhealthy'
      };

      res.json(results);
    } catch (error) {
      res.status(500).json({ 
        error: "Comprehensive test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
