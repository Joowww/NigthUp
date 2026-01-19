# --- ETAPA 1: Construcción (Builder) ---
FROM node:20-alpine3.18 AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias (incluyendo devDependencies para poder compilar TS)
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación (Genera la carpeta /dist)
RUN npm run build

# --- ETAPA 2: Producción ---
FROM node:20-alpine3.18
WORKDIR /app

# Copiamos solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads

# Exponemos el puerto del backend
EXPOSE 3000

# Arrancamos la aplicación
CMD ["node", "dist/index.js"]
