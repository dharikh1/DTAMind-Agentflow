import { checkDatabaseConnection } from '../database';
import { DatabaseStorage } from '../services/database-storage';
import { MemStorage } from '../storage';
import type { IStorage } from '../storage';

let storageInstance: IStorage | null = null;

export async function initializeStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  // Check if database is available
  const dbStatus = await checkDatabaseConnection();
  
  if (dbStatus.status === 'connected') {
    console.log('✅ Database connected - Using PostgreSQL storage');
    storageInstance = new DatabaseStorage();
  } else {
    console.log('⚠️  Database not available - Using in-memory storage');
    console.log('   Configure DATABASE_URL to enable PostgreSQL storage');
    storageInstance = new MemStorage();
  }

  return storageInstance;
}

export async function getStorage(): Promise<IStorage> {
  if (!storageInstance) {
    return await initializeStorage();
  }
  return storageInstance;
}