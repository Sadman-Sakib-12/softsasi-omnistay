#!/usr/bin/env bash
# ==============================================================================
# Softsasi OmniStay 360 - PostgreSQL 16 WAL Archiving & Daily Encrypted S3 PITR
# Chapter 21.3 DevOps & Disaster Recovery Architecture
# ==============================================================================

set -euo pipefail

# Configuration
PG_HOST="${PGHOST:-localhost}"
PG_PORT="${PGPORT:-5432}"
PG_USER="${PGUSER:-omnistay_admin}"
PG_DB="${PGDATABASE:-omnistay_production}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/omnistay/postgres}"
S3_BUCKET="${S3_BACKUP_BUCKET:-s3://softsasi-omnistay-pitr-backups/production}"
ENCRYPTION_KEY_ID="${AWS_KMS_KEY_ID:-alias/omnistay-backup-kms}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_ARCHIVE="${BACKUP_DIR}/omnistay_backup_${TIMESTAMP}.dump.enc"

echo "[$(date)] Starting OmniStay PostgreSQL 16 automated WAL & PITR snapshot..."

mkdir -p "${BACKUP_DIR}/wal_archive"

# 1. Trigger PostgreSQL WAL checkpoint and base backup
echo "[$(date)] Running pg_basebackup with WAL inclusion..."
pg_basebackup \
  -h "${PG_HOST}" \
  -p "${PG_PORT}" \
  -U "${PG_USER}" \
  -D "${BACKUP_DIR}/base_${TIMESTAMP}" \
  -Ft \
  -z \
  -X stream \
  -P

# 2. Encrypt Base Backup with AES-256 via OpenSSL / AWS KMS
echo "[$(date)] Encrypting backup archive..."
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in "${BACKUP_DIR}/base_${TIMESTAMP}/base.tar.gz" \
  -out "${BACKUP_ARCHIVE}" \
  -pass "pass:${ENCRYPTION_SECRET:-DefaultSecureOmnyStayArchive2026}"

# 3. Off-Site S3 Upload with Server-Side Encryption (KMS)
echo "[$(date)] Uploading encrypted snapshot to off-site multi-region S3 bucket: ${S3_BUCKET}..."
aws s3 cp "${BACKUP_ARCHIVE}" "${S3_BUCKET}/daily-snapshots/" \
  --sse aws:kms \
  --sse-kms-key-id "${ENCRYPTION_KEY_ID}" \
  --storage-class STANDARD_IA

# 4. Continuous WAL Archive Sync
echo "[$(date)] Syncing active WAL archive segment logs for Point-in-Time Recovery (PITR)..."
aws s3 sync "${BACKUP_DIR}/wal_archive/" "${S3_BUCKET}/wal-logs/" \
  --sse aws:kms \
  --sse-kms-key-id "${ENCRYPTION_KEY_ID}" \
  --delete

# 5. Retention Pruning (Retain 30 days locally)
echo "[$(date)] Pruning local backups older than 30 days..."
find "${BACKUP_DIR}" -name "omnistay_backup_*.dump.enc" -mtime +30 -delete
rm -rf "${BACKUP_DIR}/base_${TIMESTAMP}"

echo "[$(date)] OmniStay PITR snapshot successfully completed and encrypted."
