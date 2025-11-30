FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
# Necesario para compilar
COPY tsconfig.json ./

# Instalar todas las dependencias
# NOTA: Si tienes package-lock.json usa 'npm ci', si no, usa 'npm install'
RUN npm install

# Copiar código fuente
COPY src ./src
# Copiamos carpetas estáticas si tienen contenido inicial
COPY uploads ./uploads
COPY public ./public

# Compilar TypeScript (genera carpeta /dist)
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar SOLO dependencias de producción (Ahorra espacio y memoria)
RUN npm install --omit=dev

# Copiar código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist
# Copiar assets estáticos
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/public ./public

# Crear directorios necesarios (por seguridad, por si no se copiaron)
RUN mkdir -p /app/uploads /app/public

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar
CMD ["node", "dist/index.js"]