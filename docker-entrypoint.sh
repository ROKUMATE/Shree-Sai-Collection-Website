#!/bin/sh
set -e

echo "Applying database migrations..."
node /tools/node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma

echo "Bootstrapping (admin user + categories if missing)..."
node scripts/bootstrap.mjs

echo "Starting server..."
exec node server.js
