#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Building production version with Web3Auth fix...');

// Ensure environment variable is available for Vite
process.env.VITE_WEB3AUTH_CLIENT_ID = 'BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0';

try {
  // Build frontend with Vite
  console.log('📦 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build backend with esbuild
  console.log('⚙️  Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Create production environment file
  const prodEnv = `NODE_ENV=production
SESSION_SECRET=bets-fun-production-secret-${Date.now()}
DATABASE_URL=postgresql://neondb_owner:npg_KWqraOyIds18@ep-tiny-king-a6juqsvs.us-west-2.aws.neon.tech/neondb?sslmode=require
VITE_WEB3AUTH_CLIENT_ID=BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0
WEB3AUTH_CLIENT_ID=BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0
ADMIN_EMAIL=admin@bets.fun
ADMIN_PASSWORD=admin123
JWT_SECRET=your-super-secret-admin-jwt-key
`;
  
  writeFileSync('dist/.env', prodEnv);
  
  console.log('✅ Production build complete!');
  console.log('📁 All files are in the dist/ folder');
  console.log('🚀 To run: cd dist && node index.js');
  console.log('🌐 Or use: node production-fix.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}