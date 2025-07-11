#!/usr/bin/env node

// Production startup script for Bets.Fun
// This script loads the proper environment configuration for the built app

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load production environment variables
try {
  const envPath = join(__dirname, '.env.production');
  const envFile = readFileSync(envPath, 'utf8');
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  
  console.log('✅ Loaded production environment variables');
} catch (error) {
  console.log('⚠️  No .env.production file found, using system environment');
}

// Set required production environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

// Ensure session secret exists
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'production-session-secret-' + Math.random().toString(36).substring(2, 15);
  console.log('⚠️  Generated temporary session secret. Set SESSION_SECRET environment variable for production.');
}

// Ensure database URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log('🚀 Starting Bets.Fun in production mode...');
console.log(`📡 Server will run on port ${process.env.PORT}`);

// Import and start the main application
import('./dist/index.js').catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});