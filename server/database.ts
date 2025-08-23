import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Supabase connection
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL not provided. Using in-memory storage for development.');
}

// Create postgres connection
export const connection = postgres(connectionString, { 
  prepare: false,
  ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false
});

// Create drizzle database instance
export const db = drizzle(connection, { schema });

// Health check function
export async function checkDatabaseConnection() {
  try {
    if (!connectionString) {
      return { status: 'no-connection', message: 'DATABASE_URL not configured' };
    }
    
    await connection`SELECT 1`;
    return { status: 'connected', message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}