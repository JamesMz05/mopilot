-- MoPilot Multi-Database Initialization
-- Nur bei Erstinstallation relevant (bestehende Volumes haben die DBs bereits)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Zusätzliche Datenbanken (die Default-DB 'mopilot' wird von POSTGRES_DB erstellt)
SELECT 'CREATE DATABASE mopilot_ideen OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mopilot_ideen')\gexec

SELECT 'CREATE DATABASE cc_fuhrpark OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cc_fuhrpark')\gexec

SELECT 'CREATE DATABASE vianova_verwaltung OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vianova_verwaltung')\gexec
