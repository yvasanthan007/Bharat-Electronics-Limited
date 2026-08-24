# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
