import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../database';
import { users, workflows, workflowExecutions } from '@shared/schema';
import { 
  type User, 
  type InsertUser, 
  type Workflow, 
  type InsertWorkflow, 
  type WorkflowExecution, 
  type InsertWorkflowExecution 
} from '@shared/schema';
import type { IStorage } from '../storage';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(insertUser.password, 12);
      
      const result = await db.insert(users).values({
        ...insertUser,
        password: hashedPassword,
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;
      
      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error verifying password:', error);
      return null;
    }
  }

  // Workflow methods
  async getWorkflows(userId?: string): Promise<Workflow[]> {
    try {
      const query = db.select().from(workflows).orderBy(desc(workflows.updatedAt));
      
      if (userId) {
        const result = await query.where(eq(workflows.userId, userId));
        return result;
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting workflows:', error);
      return [];
    }
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    try {
      const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting workflow:', error);
      return undefined;
    }
  }

  async createWorkflow(insertWorkflow: InsertWorkflow & { userId: string }): Promise<Workflow> {
    try {
      const result = await db.insert(workflows).values(insertWorkflow).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  async updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    try {
      const result = await db
        .update(workflows)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(workflows.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating workflow:', error);
      return undefined;
    }
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      await db.delete(workflows).where(eq(workflows.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  // Workflow execution methods
  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    try {
      const result = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, workflowId))
        .orderBy(desc(workflowExecutions.executionTime));
      
      return result;
    } catch (error) {
      console.error('Error getting workflow executions:', error);
      return [];
    }
  }

  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    try {
      const result = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.id, id))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error('Error getting workflow execution:', error);
      return undefined;
    }
  }

  async createWorkflowExecution(insertExecution: InsertWorkflowExecution): Promise<WorkflowExecution> {
    try {
      const result = await db
        .insert(workflowExecutions)
        .values({
          ...insertExecution,
          status: 'running',
          error: null,
          output: null,
          completedAt: null,
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating workflow execution:', error);
      throw new Error('Failed to create workflow execution');
    }
  }

  async updateWorkflowExecution(
    id: string, 
    updates: Partial<WorkflowExecution>
  ): Promise<WorkflowExecution | undefined> {
    try {
      const result = await db
        .update(workflowExecutions)
        .set(updates)
        .where(eq(workflowExecutions.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating workflow execution:', error);
      return undefined;
    }
  }
}