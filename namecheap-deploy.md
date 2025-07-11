# Bets.Fun - Namecheap Deployment Guide

## Prerequisites
- Namecheap VPS or Node.js hosting plan
- Your Neon PostgreSQL database URL
- Web3Auth Client ID
- Admin Solana private key

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Upload Files to Namecheap
Upload these folders/files to your hosting directory:
- `dist/` (built application)
- `node_modules/` (dependencies)
- `package.json`
- `.env` (environment variables - see below)

### 3. Environment Variables (.env file)
Create a `.env` file in your hosting root with:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_neon_postgresql_url_here
WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
ADMIN_SOLANA_PRIVATE_KEY=your_admin_private_key_here
SESSION_SECRET=your_secure_session_secret_here
REPLIT_DOMAINS=yourdomain.com
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id_here
```

### 4. Start the Application
```bash
NODE_ENV=production PORT=3000 node dist/index.js
```

## Important Notes
- Make sure your Namecheap plan supports Node.js
- The app will serve on the PORT specified in environment variables
- Database migrations will run automatically on startup
- Static files are served from the dist directory

## Troubleshooting
- Ensure all environment variables are set correctly
- Check that your Neon database is accessible from Namecheap
- Verify Node.js version compatibility (requires Node 18+)