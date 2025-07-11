# Bets.Fun - Prediction Markets Platform

## Overview
Bets.Fun is a modern prediction markets platform that allows users to trade on the outcomes of future events. Built with a full-stack TypeScript architecture, the platform integrates blockchain wallets, real-time pricing, and gamification features to create an engaging prediction trading experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with Shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Theme System**: Light/dark mode support with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OIDC + Web3Auth integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
- **Users**: Stores user profiles, wallet addresses, balances, and avatars
- **Markets**: Prediction markets with categories, pricing, and resolution data
- **Bets**: User positions with amounts, sides, and outcomes
- **Categories**: Market categorization system
- **Badges**: Gamification system with achievement tracking
- **Sessions**: Secure session storage for authentication

## Key Components

### Authentication System
- **Replit Auth**: Primary authentication via OIDC
- **Web3Auth**: Blockchain wallet integration (Ethereum/Solana) with social logins
- **Wallet Integration**: Phantom and MetaMask wallet support with proper logout/account selection
- **Session Management**: Secure cookie-based sessions with comprehensive logout
- **User Onboarding**: Tutorial system for new users

### Trading Engine
- **Market Creation**: User-generated prediction markets
- **Betting System**: Yes/No position taking with dynamic pricing
- **Portfolio Management**: Position tracking and P&L calculation
- **Price Discovery**: Automated market making simulation

### Gamification Features
- **Badge System**: Achievement tracking based on accuracy, volume, and experience
- **Leaderboards**: Ranking users by various metrics
- **Avatar System**: Customizable user avatars with SVG generation
- **Statistics**: Comprehensive user performance tracking

### Blockchain Integration
- **Multi-Chain Support**: Ethereum and Solana wallet connections
- **Token Pricing**: Real-time crypto price feeds via CoinGecko
- **Wallet Management**: Balance tracking and transaction history
- **Auto-Swap Service**: Automated token conversion system

## Data Flow

### User Journey
1. **Authentication**: Users sign in via Replit Auth or Web3 wallets
2. **Onboarding**: New users complete tutorial and set usernames
3. **Market Discovery**: Browse and filter prediction markets
4. **Position Taking**: Place bets on market outcomes
5. **Portfolio Management**: Track positions and claim winnings
6. **Achievement Progress**: Earn badges and climb leaderboards

### Market Lifecycle
1. **Creation**: Users create markets with resolution criteria
2. **Trading**: Active betting with dynamic price updates
3. **Resolution**: Markets resolve based on real-world outcomes
4. **Settlement**: Winning positions receive payouts

### Data Synchronization
- **Real-time Updates**: Live price and volume updates
- **Cache Strategy**: TanStack Query with 5-minute stale times
- **Background Sync**: Automated wallet balance monitoring
- **Error Handling**: Graceful fallbacks and retry mechanisms

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: OIDC authentication provider
- **Web3Auth**: Blockchain wallet integration
- **CoinGecko API**: Cryptocurrency price feeds

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for enhanced UX

### Development Tools
- **TypeScript**: Type safety across the stack
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundling
- **PostCSS**: CSS processing and optimization

## Deployment Strategy

### Development Environment
- **Replit Platform**: Integrated development environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Direct connection to Neon PostgreSQL
- **Environment Variables**: Secure credential management

### Production Build
- **Build Process**: Vite frontend build + ESBuild server bundle
- **Static Assets**: Optimized and fingerprinted assets
- **Server Bundle**: Single file deployment with external packages
- **Database Migrations**: Automated schema deployment

### Infrastructure
- **Hosting**: Replit autoscale deployment
- **Database**: Neon serverless PostgreSQL
- **CDN**: Built-in asset optimization
- **Monitoring**: Application logs and error tracking

## Changelog
- July 1, 2025: Completed comprehensive withdraw functionality - users can now withdraw funds from application wallet to personal ETH/SOL addresses with full validation, balance checking, and transaction processing
- June 30, 2025: Created parallel Web3Auth wallet section in navigation for testing - implemented complete Web3Auth wallet interface with fiat on-ramp, token swap, portfolio management, and professional features alongside existing wallet functionality
- June 30, 2025: Implemented hybrid wallet approach integrating Web3Auth's professional wallet services - added embedded fiat on-ramp, token swap, and advanced wallet UI while maintaining custom prediction market features
- June 26, 2025: Successfully implemented Phantom wallet forced account selection on login after logout - enhanced logout process with wallet_revokePermissions API and improved login flow to always trigger account selection popup when user logs out and logs back in
- June 25, 2025: Successfully resolved Phantom and MetaMask wallet auto-login issue - wallets now show account selection dialog after logout instead of auto-connecting to the same account. Implemented using wallet_revokePermissions and wallet_requestPermissions APIs for proper permission management.
- June 17, 2025: Manually granted AI Insights Pro subscription to eclubventures@gmail.com user for testing and demonstration purposes
- June 16, 2025: Implemented complete subscription purchase system with wallet balance payment - users can now buy subscriptions directly using platform balance
- June 16, 2025: Added subscription purchase buttons to all subscription plans including Ultimate Bundle option with real-time validation
- June 16, 2025: Removed avatar generator functionality completely from profile and platform - simplified to generic user icon display
- June 16, 2025: Implemented subscription-based AI insights with premium access control - non-subscribers see golden upgrade prompt directing to purchase $4.99/month AI Insights package
- June 16, 2025: Added real-time AI-powered market analysis using Anthropic Claude API for sentiment analysis, trend predictions, and risk assessments
- June 16, 2025: Moved subscription statistics above packages in admin panel for improved UX and visibility
- June 16, 2025: Implemented real-time subscription management system with persistent data store - admin changes now immediately reflect in user-facing components
- June 16, 2025: Added subscription management to admin panel with full pricing control and feature editing capabilities
- June 16, 2025: Updated premium subscription pricing - Market Creator Pro: $19.99/month, AI Insights Pro: $4.99/month, Ultimate Bundle: $21.99/month
- June 15, 2025: Added premium subscription system with two tiers and bundle options to profile and portfolio pages
- June 15, 2025: Created complete Namecheap hosting deployment package with fixed PostgreSQL schema (removed uuid-ossp dependency)
- June 14, 2025: Fixed SOL balance display precision and admin wallet calculation accuracy
- June 14, 2025: Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.