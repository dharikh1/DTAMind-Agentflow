import { type User, type InsertUser, type Workflow, type InsertWorkflow, type WorkflowExecution, type InsertWorkflowExecution } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workflow methods
  getWorkflows(userId?: string): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;
  
  // Workflow execution methods
  getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]>;
  getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined>;
  createWorkflowExecution(execution: InsertWorkflowExecution): Promise<WorkflowExecution>;
  updateWorkflowExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workflows: Map<string, Workflow>;
  private workflowExecutions: Map<string, WorkflowExecution>;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.workflowExecutions = new Map();
    
    // Create default user
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo123"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWorkflows(userId?: string): Promise<Workflow[]> {
    const workflows = Array.from(this.workflows.values());
    return userId ? workflows.filter(w => w.userId === userId) : workflows;
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = randomUUID();
    const now = new Date();
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      userId: "default-user", // Default to demo user
      description: insertWorkflow.description || null,
      nodes: insertWorkflow.nodes || [],
      edges: insertWorkflow.edges || [],
      settings: insertWorkflow.settings || {},
      isActive: insertWorkflow.isActive || false,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    const updatedWorkflow: Workflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    return Array.from(this.workflowExecutions.values())
      .filter(execution => execution.workflowId === workflowId)
      .sort((a, b) => new Date(b.executionTime).getTime() - new Date(a.executionTime).getTime());
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    return this.workflowExecutions.get(id);
  }

  async createWorkflowExecution(insertExecution: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const id = randomUUID();
    const execution: WorkflowExecution = {
      ...insertExecution,
      id,
      input: insertExecution.input || {},
      output: null,
      status: 'running',
      error: null,
      executionTime: new Date(),
      completedAt: null,
    };
    this.workflowExecutions.set(id, execution);
    return execution;
  }

  async updateWorkflowExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution | undefined> {
    const execution = this.workflowExecutions.get(id);
    if (!execution) return undefined;

    const updatedExecution: WorkflowExecution = {
      ...execution,
      ...updates,
    };
    this.workflowExecutions.set(id, updatedExecution);
    return updatedExecution;
  }
}

export const storage = new MemStorage();
