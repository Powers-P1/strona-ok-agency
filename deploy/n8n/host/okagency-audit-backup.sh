#!/bin/sh
set -eu

backup_dir=/var/backups/okagency-audit
container=okagency-site-audit-postgres-1
stamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$backup_dir/n8n-postgres-$stamp.dump"
temporary="$target.tmp"

umask 077
install -d -m 0700 -o root -g root "$backup_dir"
trap 'rm -f "$temporary"' EXIT

docker exec "$container" pg_dump -U n8n -d n8n --format=custom > "$temporary"
test -s "$temporary"
mv "$temporary" "$target"
docker exec -i "$container" pg_restore --list < "$target" > /dev/null
find "$backup_dir" -xdev -type f -name 'n8n-postgres-*.dump' -mtime +7 -delete

