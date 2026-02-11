#!/bin/sh
# Script de inicio para producción

echo "🔄 Generando Prisma Client..."
npx prisma generate

echo "🔄 Creando tablas en la base de datos..."
npx prisma db push --accept-data-loss --skip-generate

echo "🚀 Iniciando servidor..."
node src/index.js
