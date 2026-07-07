#!/bin/bash

# =========================
# CONFIG
# =========================
FTP_HOST="valokichu.com"
FTP_USER="admin_valokichu"
FTP_PASS="admin_valokichu"
REMOTE_PATH="/home/valokichu.com/public_html/frontend/"
DOMAIN="valokichu.com"

echo "=============================="
echo "🚀 Deploying to VPS via FTP (Docker Ready)"
echo "Domain: $DOMAIN"
echo "=============================="

# =========================
# FTP UPLOAD
# =========================
echo "📡 Uploading files via FTP (excluding node_modules)..."

# Using lftp to mirror the current directory to the server
# -R: Reverse mirror (upload)
# --delete: Remove files on the server that don't exist locally
# -x: Exclude patterns
lftp -u "$FTP_USER","$FTP_PASS" $FTP_HOST <<EOF
set ftp:ssl-allow no
mirror -R --delete --verbose \
  --exclude node_modules/ \
  --exclude .git/ \
  --exclude .next/ \
  --exclude out/ \
  ./ $REMOTE_PATH
bye
EOF

# =========================
# DONE
# =========================
echo "=============================="
echo "✅ UPLOAD COMPLETE!"
echo "Next step: Login to your VPS and run:"
echo "cd $REMOTE_PATH"
echo "chmod +x deploy-vps.sh"
echo "./deploy-vps.sh"
echo "=============================="