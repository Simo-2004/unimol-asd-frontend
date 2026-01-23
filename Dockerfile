FROM node:20-alpine

WORKDIR /app

# Installa pnpm globalmente
RUN npm install -g pnpm

# Copia file di dipendenze
COPY package.json pnpm-lock.yaml* ./

# Installa dipendenze con pnpm
RUN pnpm install --frozen-lockfile

# Copia il resto del codice
COPY . .

# Disabilita telemetria
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

# Avvia in modalità SVILUPPO con hot-reload
CMD ["pnpm", "dev"]
