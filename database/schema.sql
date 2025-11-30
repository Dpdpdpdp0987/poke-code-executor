-- Supabase Database Schema for Code Executor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Executions table: stores all code executions
CREATE TABLE executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'javascript')),
    output TEXT,
    error JSONB,
    execution_time INTEGER, -- in milliseconds
    ip_address VARCHAR(45), -- supports both IPv4 and IPv6
    user_id UUID, -- optional: link to users table if you add authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_executions_language ON executions(language);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_user_id ON executions(user_id) WHERE user_id IS NOT NULL;

-- Snippets table: stores saved code snippets
CREATE TABLE snippets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'javascript')),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    user_id UUID, -- optional: link to users table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for snippets
CREATE INDEX idx_snippets_language ON snippets(language);
CREATE INDEX idx_snippets_is_public ON snippets(is_public);
CREATE INDEX idx_snippets_user_id ON snippets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_snippets_tags ON snippets USING GIN(tags);

-- Rate limit tracking table
CREATE TABLE rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address, endpoint, window_start)
);

-- Create index for rate limiting
CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint, window_start);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at BEFORE UPDATE ON snippets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public snippets
CREATE POLICY "Public snippets are viewable by everyone"
    ON snippets FOR SELECT
    USING (is_public = true);

-- Service role can do everything (for API use)
CREATE POLICY "Service role has full access to executions"
    ON executions FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Service role has full access to snippets"
    ON snippets FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Service role has full access to rate_limits"
    ON rate_limits FOR ALL
    TO service_role
    USING (true);

-- Clean up old executions (optional: run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_executions()
RETURNS void AS $$
BEGIN
    DELETE FROM executions
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;