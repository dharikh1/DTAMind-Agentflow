import type { Express, Request, Response } from "express";
import { z } from "zod";
import { getStorage } from "../config/storage";
import { generateToken } from "../middleware/auth";
import { loginUserSchema, registerUserSchema, type LoginUser, type RegisterUser } from "@shared/schema";

export function registerAuthRoutes(app: Express): void {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail?.(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Create user
      const user = await storage.createUser(validatedData);
      
      // Generate token
      const token = generateToken(user);
      
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const validatedData = loginUserSchema.parse(req.body);
      
      // For database storage, use verifyPassword method
      if ('verifyPassword' in storage) {
        const user = await storage.verifyPassword(validatedData.email, validatedData.password);
        if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user);
        
        return res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          }
        });
      } else {
        // For in-memory storage, simple check (demo mode)
        const user = await storage.getUserByUsername('demo');
        if (user && validatedData.email === 'demo@example.com' && validatedData.password === 'demo123') {
          const token = generateToken(user);
          
          return res.json({
            message: "Login successful (demo mode)",
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            }
          });
        }
        
        return res.status(401).json({ error: "Invalid email or password" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      // For demo purposes, return demo user info if no database
      if (!('verifyPassword' in storage)) {
        return res.json({
          user: {
            id: "default-user",
            username: "demo",
            email: "demo@example.com",
          }
        });
      }

      // TODO: Implement proper token verification and user lookup
      res.status(401).json({ error: "Authentication required" });
    } catch (error) {
      console.error("Me endpoint error:", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Logout endpoint (client-side token removal)
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ message: "Logout successful" });
  });

  // Check database connection status
  app.get("/api/auth/status", async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      const hasDatabase = 'verifyPassword' in storage;
      const connectionString = process.env.DATABASE_URL;
      
      res.json({
        hasDatabase,
        databaseConfigured: !!connectionString,
        storageType: hasDatabase ? 'database' : 'in-memory',
        message: hasDatabase 
          ? 'Database authentication enabled' 
          : 'Using demo authentication (in-memory storage)'
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get auth status" });
    }
  });
}