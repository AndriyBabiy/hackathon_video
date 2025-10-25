# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies for building
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy TypeScript configs first
COPY tsconfig*.json ./
COPY apps/client/tsconfig*.json ./apps/client/
COPY apps/server/tsconfig.json ./apps/server/
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy source code
COPY apps/client/src ./apps/client/src
COPY apps/server/src ./apps/server/src
COPY packages/shared/src ./packages/shared/src

# Copy other necessary files
COPY apps/client/index.html ./apps/client/
COPY apps/client/vite.config.ts ./apps/client/
COPY apps/server/story-config.json ./apps/server/
COPY apps/server/public ./apps/server/public
COPY .npmrc ./
COPY Procfile ./
COPY railway.json ./

# Build in correct order: shared first, then client and server
RUN npm run build:shared && npm run build:server && npm run build:client

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/client/dist ./apps/client/dist
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/public ./apps/server/public
COPY --from=base /app/apps/server/story-config.json ./apps/server/
COPY --from=base /app/packages/shared/dist ./packages/shared/dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/apps/server/package*.json ./apps/server/

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
