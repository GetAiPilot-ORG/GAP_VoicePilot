-- Migration: 0011_add_workspace_connectors_unique.sql
-- Enforce uniqueness of connector per workspace to prevent race conditions and duplicate bindings

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'workspace_connectors'
    ) THEN
        -- Add unique constraint if not already present
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'uq_workspace_connectors_workspace_connector'
        ) THEN
            ALTER TABLE public.workspace_connectors
            ADD CONSTRAINT uq_workspace_connectors_workspace_connector 
            UNIQUE (workspace_id, connector_id);
        END IF;
    END IF;
END $$;
