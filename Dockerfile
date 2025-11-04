# ESTÁGIO 1: Builder (está faltando esta parte)
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ESTÁGIO 2: Produção (a parte que você mostrou)
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar arquivos buildados do Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]