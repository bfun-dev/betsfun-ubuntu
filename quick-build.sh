#!/bin/bash

echo "Building optimized production version for AWS EC2..."

# Set environment variable for build
export VITE_WEB3AUTH_CLIENT_ID=BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0

# Build frontend only (faster)
echo "Building frontend..."
npx vite build --mode production

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create production environment file
cat > dist/.env << 'EOF'
NODE_ENV=production
SESSION_SECRET=bets-fun-aws-production-secret
DATABASE_URL=postgresql://neondb_owner:npg_KWqraOyIds18@ep-tiny-king-a6juqsvs.us-west-2.aws.neon.tech/neondb?sslmode=require
VITE_WEB3AUTH_CLIENT_ID=BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0
WEB3AUTH_CLIENT_ID=BNeAuPPOLBYjVYp2018UyO7XbdXHzhYiBDs4uWkcujjnMDFLR9_rWNcK6CgChKuLEURgrkttHQbCFc9FOGpDfZ0
EOF

echo "Production build complete! Upload the dist/ folder to your AWS EC2 server."
echo "Run with: node index.js"