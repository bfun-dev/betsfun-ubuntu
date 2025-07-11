// Production Authentication Fix for Bets.Fun
// Run this after building the app to fix 401 Unauthorized errors

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config();

// Ensure required environment variables are set
const requiredEnvVars = {
    'SESSION_SECRET': process.env.SESSION_SECRET || 'bets-fun-session-secret-' + Date.now(),
    'NODE_ENV': 'production',
    'DATABASE_URL': process.env.DATABASE_URL
};

// Set environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (value) {
        process.env[key] = value;
    }
});

// Verify database connection
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('Add DATABASE_URL to your .env file or set it as an environment variable');
    process.exit(1);
}

console.log('✅ Environment variables configured for production');
console.log('🚀 Starting production server...');

// Set production port
const PORT = process.env.PORT || 3000;
process.env.PORT = PORT;

// Import and start the built application
try {
    await import('./dist/index.js');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
} catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you built the app first: npm run build');
    console.log('2. Check that dist/index.js exists');
    console.log('3. Verify DATABASE_URL is correct in .env file');
    process.exit(1);
}