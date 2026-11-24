-- Rollback of Phase 4. Run: sqlite3 <db> < scripts/rollback-auth-tokens.sql
-- Also disable the endpoints: FF_AUTH_RECOVERY=false
DROP TABLE IF EXISTS auth_tokens;
