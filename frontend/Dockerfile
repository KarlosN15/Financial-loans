# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Asegurarse de que el backend apunta a la dirección de docker o la que el usuario defina
ENV VITE_API_URL=http://localhost:3000
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copiar la build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx para SPA (opcional pero recomendado)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
