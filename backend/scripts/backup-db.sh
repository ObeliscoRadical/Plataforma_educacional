#!/bin/sh
# Usage: scripts/backup-db.sh [db_path]  -> writes <db>.bak-<timestamp> (safe online backup)
DB="${1:-${DB_PATH:-./developer_os.sqlite}}"
OUT="$DB.bak-$(date +%Y%m%d%H%M%S)"
sqlite3 "$DB" ".backup '$OUT'" && echo "backup: $OUT"
