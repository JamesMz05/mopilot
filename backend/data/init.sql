-- MoPilot Database Initialization
-- Tables are auto-created by SQLAlchemy on startup
-- This file is for any extensions or manual setup

-- Enable UUID extension (if needed later)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search (for future knowledge base search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
