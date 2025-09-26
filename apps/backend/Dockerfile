FROM node:18 AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./tsconfig.json
COPY prisma ./prisma
COPY src ./src

# Build the application
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:18
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY prisma ./prisma

CMD ["node", "dist/src/main.js"]