#!/bin/sh
# Dumps the database once a day and deletes dumps older than BACKUP_KEEP_DAYS.
# Restore with: gunzip -c backups/<file>.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U "$CLOUD_PG_USER" -d "$CLOUD_PG_DB"
set -e
while true; do
  file="/backups/hydrate-$(date +%Y%m%d-%H%M%S).sql.gz"
  if pg_dump --no-owner | gzip > "$file.tmp"; then
    mv "$file.tmp" "$file"
    echo "Backup written to $file"
  else
    rm -f "$file.tmp"
    echo "Backup FAILED" >&2
  fi
  find /backups -name 'hydrate-*.sql.gz' -mtime +"${BACKUP_KEEP_DAYS:-14}" -delete
  sleep 86400
done
