#!/bin/sh

# Salir si algo falla
set -e

echo "En espera de que la base de datos esté lista..."

# Ejecutar migraciones pendientes
echo "Ejecutando prisma db push..."
npx prisma db push --accept-data-loss # En producción se recomienda usar migrate deploy

# Ejecutar seed para asegurar el acceso ADMIN inicial
echo "Ejecutando prisma db seed..."
npx prisma db seed

echo "Iniciando servidor de producción..."
exec "$@"
