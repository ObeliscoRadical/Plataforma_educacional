-- Rollback of Phase 2. Run: sqlite3 <db> < scripts/rollback-enrollments.sql
-- Also disable the guard: FF_ENROLLMENT_GUARD=false
DROP TABLE IF EXISTS access_codes;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS preview_lessons;
