# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma y node-gyp si fuera necesario
RUN apk add --no-cache libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar solo dependencias necesarias para compilar
RUN npm ci

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar los artefactos generados desde el stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto del API
EXPOSE 3000

# Script de inicio para correr migraciones y el comando seed
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
