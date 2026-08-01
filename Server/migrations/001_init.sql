-- migrations/001_init.sql
--
-- WHY RAW SQL MIGRATIONS INSTEAD OF AN ORM (e.g. Prisma/Sequelize):
-- For a resume/interview project, raw SQL demonstrates that you actually
-- understand relational design (keys, constraints, indexes) rather than
-- letting an ORM generate it for you. It's also zero extra dependencies
-- and zero "magic" — anyone reviewing this repo can read exactly what the
-- database looks like from this one file. In a larger team/production
-- setting you'd likely reach for a migration tool (Knex, Prisma, node-pg-migrate)
-- for versioned rollback support — worth mentioning in an interview as a
-- known tradeoff, but overkill for this project's scope.
--
-- DATA MODEL OVERVIEW:
-- users            -> who owns documents (auth itself is out of scope for
--                     now; a default demo user is seeded below so the rest
--                     of the app has something to reference)
-- documents        -> one row per uploaded PDF
-- document_chunks  -> one row per text chunk extracted from a document.
--                     Chunk CONTENT + metadata live here in Postgres;
--                     the actual VECTOR EMBEDDING lives in ChromaDB.
--                     chroma_vector_id is the join key between the two.
--                     (Why split like this? ChromaDB is optimized for
--                     similarity search over vectors, not for relational
--                     queries/filters/joins. Postgres is the opposite.
--                     Using each for what it's good at is a deliberate
--                     polyglot-persistence choice, and a great thing to
--                     explain in an interview.)
-- chat_sessions    -> one conversation thread, scoped to a document
-- chat_messages    -> individual turns in a chat session (conversation memory)

-- Use UUIDs for primary keys instead of auto-increment integers:
-- they're safe to generate client-side, don't leak row counts/order,
-- and avoid collisions if we ever shard/merge databases later.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    original_filename VARCHAR(512) NOT NULL,
    storage_path VARCHAR(1024) NOT NULL,
    -- status tracks the document through its processing pipeline:
    -- uploaded -> parsing -> embedding -> ready  (or -> failed at any stage)
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'parsing', 'embedding', 'ready', 'failed')),
    page_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    -- Foreign "key" into ChromaDB (a different database entirely, so this
    -- is just a string reference, not a real FK constraint).
    chroma_vector_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on foreign keys used in frequent lookups (Postgres does NOT
-- auto-index foreign key columns, unlike primary keys).
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_document_id ON chat_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Seed a default demo user so documents have something to reference
-- until a real auth module is built.
INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@ai-document-assistant.local')
ON CONFLICT (email) DO NOTHING;
