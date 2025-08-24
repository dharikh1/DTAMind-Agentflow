import { type WorkflowNode, type WorkflowEdge, type WorkflowExecution } from "@shared/schema";
import { openaiService } from "./openai-service";
import { llmService } from "./llm-service";
import { langChainService } from "./langchain-service";
import { getStorage } from "../config/storage";

export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface WorkflowContext {
  executionId: string;
  variables: Record<string, any>;
  previousResults: Record<string, any>;
}

export class WorkflowEngine {
  async executeWorkflow(
    workflowId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    input?: any
  ): Promise<WorkflowExecution> {
    console.log(`Starting workflow execution: ${workflowId}`);
    
    // Create execution record
    const storage = await getStorage();
    const execution = await storage.createWorkflowExecution({
      workflowId,
      input: input || {},
    });

    try {
      const context: WorkflowContext = {
        executionId: execution.id,
        variables: input || {},
        previousResults: {},
      };

      // Find start node (no incoming edges)
      const startNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );

      if (startNodes.length === 0) {
        throw new Error("No start node found in workflow");
      }

      // Execute workflow starting from start node
      const result = await this.executeFromNode(startNodes[0], nodes, edges, context);

      // Update execution with results
      await storage.updateWorkflowExecution(execution.id, {
        status: 'completed',
        output: result.data,
        completedAt: new Date(),
      });

      return await storage.getWorkflowExecution(execution.id) || execution;
    } catch (error) {
      // Update execution with error
      await storage.updateWorkflowExecution(execution.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      });

      throw error;
    }
  }

  private async executeFromNode(
    node: WorkflowNode,
    allNodes: WorkflowNode[],
    edges: WorkflowEdge[],
    context: WorkflowContext
  ): Promise<NodeExecutionResult> {
    console.log(`Executing node: ${node.id} (${node.type})`);

    try {
      // Execute the current node
      const result = await this.executeNode(node, context);
      
      if (!result.success) {
        return result;
      }

      // Store result in context
      context.previousResults[node.id] = result.data;

      // Find next nodes
      const nextEdges = edges.filter(edge => edge.source === node.id);
      
      if (nextEdges.length === 0) {
        // End of workflow
        return result;
      }

      // Execute next nodes
      for (const edge of nextEdges) {
        const nextNode = allNodes.find(n => n.id === edge.target);
        if (nextNode) {
          const nextResult = await this.executeFromNode(nextNode, allNodes, edges, context);
          if (!nextResult.success) {
            return nextResult;
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeNode(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    // Check if this is a LangChain node type
    if (this.isLangChainNode(node)) {
      return this.executeLangChainNode(node, context);
    }

    switch (node.type) {
      case 'manual':
        return this.executeManualTrigger(node, context);
      
      case 'webhook':
        return this.executeWebhook(node, context);
      
      case 'schedule':
        return this.executeSchedule(node, context);
      
      case 'openai':
        return this.executeOpenAI(node, context);
      
      case 'agent':
        return this.executeAgent(node, context);
      
      case 'vector':
        return this.executeVectorSearch(node, context);
      
      case 'code':
        return this.executeCode(node, context);
      
      case 'condition':
        return this.executeCondition(node, context);
      
      case 'merge':
        return this.executeMerge(node, context);
      
      case 'email':
        return this.executeEmail(node, context);
      
      case 'webhook-response':
        return this.executeWebhookResponse(node, context);
      
      default:
        return {
          success: false,
          error: `Unknown node type: ${node.type}`,
        };
    }
  }

  private async executeManualTrigger(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: context.variables,
    };
  }

  private async executeWebhook(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: context.variables,
    };
  }

  private async executeSchedule(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: { timestamp: new Date().toISOString() },
    };
  }

  private async executeOpenAI(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    try {
      const { systemPrompt, model, temperature, maxTokens, userMessage } = node.data;
      
      const messages = [];
      if (userMessage) {
        messages.push({
          role: 'user' as const,
          content: this.interpolateTemplate(userMessage, context),
        });
      }

      const response = await openaiService.chat({
        model: model || "gpt-4o",
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 150,
        systemPrompt: this.interpolateTemplate(systemPrompt || "", context),
        messages,
      });

      return {
        success: true,
        data: { response, rawOutput: response },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI execution failed',
      };
    }
  }

  private async executeAgent(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    try {
      const { prompt, provider = 'openai', model = 'gpt-4o', temperature = 0.7, maxTokens = 500 } = node.data;
      const interpolatedPrompt = this.interpolateTemplate(prompt || "", context);
      
      const response = await llmService.generateResponse(
        provider,
        model,
        interpolatedPrompt,
        context.previousResults
      );

      return {
        success: true,
        data: { response, context: context.previousResults, provider, model },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Agent execution failed',
      };
    }
  }

  private async executeVectorSearch(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    // Placeholder for vector search implementation
    return {
      success: true,
      data: { results: [], query: node.data.query },
    };
  }

  private async executeCode(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    try {
      const { code, language } = node.data;
      
      if (language === 'javascript') {
        // Simple JavaScript execution (be careful with security in production)
        const func = new Function('context', 'previousResults', code);
        const result = func(context.variables, context.previousResults);
        
        return {
          success: true,
          data: result,
        };
      }
      
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Code execution failed',
      };
    }
  }

  private async executeCondition(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    try {
      const { condition } = node.data;
      
      // Simple condition evaluation
      const func = new Function('context', 'previousResults', `return ${condition}`);
      const result = func(context.variables, context.previousResults);
      
      return {
        success: true,
        data: { condition: result, originalCondition: condition },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Condition evaluation failed',
      };
    }
  }

  private async executeMerge(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: { merged: context.previousResults },
    };
  }

  private async executeEmail(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const { to, subject, body } = node.data;
    
    // Simulate email sending
    console.log('Sending email:', {
      to: this.interpolateTemplate(to || "", context),
      subject: this.interpolateTemplate(subject || "", context),
      body: this.interpolateTemplate(body || "", context),
    });

    return {
      success: true,
      data: { sent: true, to, subject },
    };
  }

  private async executeWebhookResponse(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const { responseData } = node.data;
    
    return {
      success: true,
      data: this.interpolateTemplate(responseData || "{}", context),
    };
  }

  private interpolateTemplate(template: string, context: WorkflowContext): string {
    if (!template) return "";
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context.variables[key] || context.previousResults[key] || match;
    });
  }

  // LangChain Node Support
  private isLangChainNode(node: WorkflowNode): boolean {
    const langChainNodeTypes = [
      'pdf-loader', 'csv-loader', 'url-scraper', 'pinecone-store', 'weaviate-store',
      'openai-chat', 'anthropic-chat', 'conversation-memory', 'web-search', 'code-executor'
    ];
    return langChainNodeTypes.includes(node.data.type);
  }

  private async executeLangChainNode(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    try {
      const nodeType = node.data.type;
      const config = node.data.config || {};

      switch (nodeType) {
        case 'pdf-loader':
          return await this.executePDFLoader(node, context, config);
        
        case 'csv-loader':
          return await this.executeCSVLoader(node, context, config);
        
        case 'url-scraper':
          return await this.executeURLScraper(node, context, config);
        
        case 'pinecone-store':
          return await this.executePineconeStore(node, context, config);
        
        case 'weaviate-store':
          return await this.executeWeaviateStore(node, context, config);
        
        case 'openai-chat':
          return await this.executeOpenAIChat(node, context, config);
        
        case 'anthropic-chat':
          return await this.executeAnthropicChat(node, context, config);
        
        case 'conversation-memory':
          return await this.executeConversationMemory(node, context, config);
        
        case 'web-search':
          return await this.executeWebSearch(node, context, config);
        
        case 'code-executor':
          return await this.executeCodeExecutor(node, context, config);
        
        default:
          return {
            success: false,
            error: `Unsupported LangChain node type: ${nodeType}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'LangChain node execution failed',
      };
    }
  }

  private async executePDFLoader(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const filePath = this.interpolateTemplate(config.filePath || '', context);
      const pages = config.pages;
      
      const result = await langChainService.processPDF(filePath, pages);
      
      if (result.success) {
        return {
          success: true,
          data: {
            content: result.content,
            metadata: result.metadata,
            nodeType: 'pdf-loader'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF loader execution failed',
      };
    }
  }

  private async executeCSVLoader(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const filePath = this.interpolateTemplate(config.filePath || '', context);
      const delimiter = config.delimiter || ',';
      
      const result = await langChainService.processCSV(filePath, delimiter);
      
      if (result.success) {
        return {
          success: true,
          data: {
            content: result.content,
            metadata: result.metadata,
            nodeType: 'csv-loader'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CSV loader execution failed',
      };
    }
  }

  private async executeURLScraper(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const url = this.interpolateTemplate(config.url || '', context);
      const selector = config.selector;
      
      const result = await langChainService.scrapeURL(url, selector);
      
      if (result.success) {
        return {
          success: true,
          data: {
            content: result.content,
            metadata: result.metadata,
            nodeType: 'url-scraper'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL scraper execution failed',
      };
    }
  }

  private async executePineconeStore(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const apiKey = this.interpolateTemplate(config.apiKey || '', context);
      const environment = this.interpolateTemplate(config.environment || '', context);
      const indexName = this.interpolateTemplate(config.indexName || '', context);
      
      const result = await langChainService.createPineconeStore(apiKey, environment, indexName);
      
      if (result.success) {
        return {
          success: true,
          data: {
            vectorStoreId: result.vectorId,
            nodeType: 'pinecone-store'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pinecone store execution failed',
      };
    }
  }

  private async executeWeaviateStore(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const url = this.interpolateTemplate(config.url || '', context);
      const className = this.interpolateTemplate(config.className || '', context);
      
      const result = await langChainService.createWeaviateStore(url, className);
      
      if (result.success) {
        return {
          success: true,
          data: {
            vectorStoreId: result.vectorId,
            nodeType: 'weaviate-store'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Weaviate store execution failed',
      };
    }
  }

  private async executeOpenAIChat(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const messages = config.messages || [];
      const model = config.model || 'gpt-4o';
      const temperature = config.temperature || 0.7;
      const maxTokens = config.maxTokens || 1000;
      
      // Interpolate message content
      const interpolatedMessages = messages.map((msg: any) => ({
        ...msg,
        content: this.interpolateTemplate(msg.content || '', context)
      }));
      
      const result = await langChainService.chatWithOpenAI(interpolatedMessages, model, temperature, maxTokens);
      
      if (result.success) {
        return {
          success: true,
          data: {
            response: result.response,
            nodeType: 'openai-chat'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI chat execution failed',
      };
    }
  }

  private async executeAnthropicChat(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const messages = config.messages || [];
      const model = config.model || 'claude-3-5-sonnet-20241022';
      const temperature = config.temperature || 0.7;
      
      // Interpolate message content
      const interpolatedMessages = messages.map((msg: any) => ({
        ...msg,
        content: this.interpolateTemplate(msg.content || '', context)
      }));
      
      const result = await langChainService.chatWithAnthropic(interpolatedMessages, model, temperature);
      
      if (result.success) {
        return {
          success: true,
          data: {
            response: result.response,
            nodeType: 'anthropic-chat'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anthropic chat execution failed',
      };
    }
  }

  private async executeConversationMemory(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const memoryKey = this.interpolateTemplate(config.memoryKey || 'conversation', context);
      const maxTokens = config.maxTokens || 2000;
      
      const result = await langChainService.createConversationMemory(memoryKey, maxTokens);
      
      if (result.success) {
        return {
          success: true,
          data: {
            memoryId: result.memoryId,
            nodeType: 'conversation-memory'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversation memory execution failed',
      };
    }
  }

  private async executeWebSearch(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const query = this.interpolateTemplate(config.query || '', context);
      const searchEngine = config.searchEngine || 'google';
      const maxResults = config.maxResults || 5;
      
      const result = await langChainService.webSearch(query, searchEngine, maxResults);
      
      if (result.success) {
        return {
          success: true,
          data: {
            results: result.results,
            query,
            searchEngine,
            nodeType: 'web-search'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search execution failed',
      };
    }
  }

  private async executeCodeExecutor(node: WorkflowNode, context: WorkflowContext, config: any): Promise<NodeExecutionResult> {
    try {
      const code = this.interpolateTemplate(config.code || '', context);
      const language = config.language || 'python';
      const timeout = config.timeout || 30;
      
      const result = await langChainService.executeCode(code, language, timeout);
      
      if (result.success) {
        return {
          success: true,
          data: {
            result: result.result,
            language,
            nodeType: 'code-executor'
          }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Code executor execution failed',
      };
    }
  }
}

export const workflowEngine = new WorkflowEngine();
