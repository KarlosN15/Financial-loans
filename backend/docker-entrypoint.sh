#!/bin/sh

echo "En espera de que la base de datos esté lista..."

MAX_RETRIES=10
RETRY_COUNT=0

until npx prisma db push --accept-data-loss; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Error: No se pudo conectar a la base de datos después de $MAX_RETRIES intentos."
    exit 1
  fi
  echo "La base de datos aún no responde. Reintentando en 6 segundos... (Intento $RETRY_COUNT/$MAX_RETRIES)"
  sleep 6
done

# Ejecutar seed para asegurar el acceso ADMIN inicial
echo "Ejecutando prisma db seed..."
npx prisma db seed

echo "Iniciando servidor de producción..."
exec "$@"
