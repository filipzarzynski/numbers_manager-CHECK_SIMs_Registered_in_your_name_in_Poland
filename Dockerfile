# --- Etap 1: Budowanie i Testy ---
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiowanie definicji zależności
COPY package.json tsconfig.json ./

# Instalacja zależności
RUN npm install --no-audit --no-fund

# Kopiowanie kodu źródłowego i konfiguracji
COPY vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src/ ./src/
COPY tests/ ./tests/

# Uruchomienie autentycznych testów jednostkowych (w tym testów PESEL i EML)
RUN npm test

# Budowanie wersji produkcyjnej
RUN npm run build

# --- Etap 2: Serwowanie statyczne przez Nginx Alpine ---
FROM nginx:1.27-alpine AS runner

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiowanie skompilowanej aplikacji z etapu budowy
COPY --from=builder /app/dist /usr/share/nginx/html

# Port nasłuchu
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
