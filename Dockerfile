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

# Copy source code
COPY . .

# Build the application
RUN npm run build

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
