import { type WorkflowNode, type WorkflowEdge, type WorkflowExecution } from "@shared/schema";
import { openaiService } from "./openai-service";
import { storage } from "../storage";

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
    // Create execution record
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
      const { prompt } = node.data;
      const interpolatedPrompt = this.interpolateTemplate(prompt || "", context);
      
      const response = await openaiService.generateResponse(interpolatedPrompt, context.previousResults);

      return {
        success: true,
        data: { response, context: context.previousResults },
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
}

export const workflowEngine = new WorkflowEngine();
