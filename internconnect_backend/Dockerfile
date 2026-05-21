FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src
COPY uploads ./uploads

RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
