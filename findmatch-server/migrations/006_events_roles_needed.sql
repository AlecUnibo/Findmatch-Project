-- Fermiamo lo script al primo errore (utile con psql)
\set ON_ERROR_STOP on

BEGIN;

-- 1) Aggiungi la colonna JSONB per i ruoli, se manca
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS roles_needed JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2) Rendi max_players nullable (se prima era NOT NULL)
ALTER TABLE public.events
  ALTER COLUMN max_players DROP NOT NULL;

COMMIT;

-- 3) Aggiungi il vincolo SOLO se non esiste già (fuori dalla transazione sopra)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_players_or_roles_chk'
      AND conrelid = 'public.events'::regclass
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_players_or_roles_chk
      CHECK (
        (max_players IS NOT NULL AND max_players > 0)
        OR
        (roles_needed IS NOT NULL AND roles_needed <> '{}'::jsonb)
      );
  END IF;
END$$;
