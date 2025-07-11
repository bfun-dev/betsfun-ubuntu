#!/usr/bin/env node

// Namecheap Production Server Starter
// This file ensures proper environment setup for Namecheap hosting

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = 'production';

// Use Namecheap provided port or default to 3000
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT;

// Ensure required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'WEB3AUTH_CLIENT_ID', 
  'SESSION_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file or hosting environment variables');
  process.exit(1);
}

// Start the application
console.log(`Starting Bets.Fun server on port ${PORT}...`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Database connected: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);

// Import and start the main application
import('./dist/index.js').catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});