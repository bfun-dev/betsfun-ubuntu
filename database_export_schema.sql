-- Bets.Fun Database Schema Export
-- Generated for migration to new Neon account
-- Compatible with standard PostgreSQL (no extensions required)

-- Create tables

-- Sessions table (for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX "IDX_session_expire" ON sessions(expire);

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    balance NUMERIC DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    avatar_svg TEXT,
    avatar_config JSONB,
    wallet_address VARCHAR,
    username VARCHAR,
    has_seen_tutorial BOOLEAN DEFAULT FALSE,
    unclaimed_winnings NUMERIC DEFAULT 0.00
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Markets table
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    creator_id VARCHAR REFERENCES users(id),
    end_date TIMESTAMP NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    outcome BOOLEAN,
    total_volume NUMERIC DEFAULT 0.0000,
    yes_price NUMERIC DEFAULT 0.5000,
    no_price NUMERIC DEFAULT 0.5000,
    participant_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    image_url TEXT,
    resolver_url TEXT,
    yes_pool NUMERIC DEFAULT 1000.0000,
    no_pool NUMERIC DEFAULT 1000.0000
);

-- Bets table
CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    market_id INTEGER REFERENCES markets(id),
    amount NUMERIC NOT NULL,
    side BOOLEAN NOT NULL,
    price NUMERIC NOT NULL,
    shares NUMERIC NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    payout NUMERIC,
    created_at TIMESTAMP DEFAULT NOW(),
    claimed BOOLEAN DEFAULT FALSE
);

-- Badges table
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    threshold NUMERIC,
    color VARCHAR DEFAULT '#3B82F6',
    rarity VARCHAR DEFAULT 'common',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    badge_id INTEGER NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    progress NUMERIC DEFAULT 0,
    UNIQUE(user_id, badge_id)
);

-- Wallet data table
CREATE TABLE wallet_data (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    solana_address VARCHAR,
    ethereum_address VARCHAR,
    solana_balance VARCHAR DEFAULT '0',
    ethereum_balance VARCHAR DEFAULT '0',
    total_usd_value VARCHAR DEFAULT '0',
    tokens JSONB DEFAULT '[]',
    last_refreshed TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_market_id ON bets(market_id);
CREATE INDEX idx_markets_category_id ON markets(category_id);
CREATE INDEX idx_markets_featured ON markets(featured);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_wallet_data_user_id ON wallet_data(user_id);