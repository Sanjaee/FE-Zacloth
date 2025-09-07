# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# copy and install deps
COPY package*.json ./
RUN npm install --frozen-lockfile

# copy source & build
COPY . .
RUN npm run build

# Stage 2: Run minimal standalone
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
