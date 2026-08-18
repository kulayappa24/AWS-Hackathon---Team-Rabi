-- Initial initialization script for Docker PostgreSQL container
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- The JPA layer will manage tables with update mode or schema.sql can be executed directly.
