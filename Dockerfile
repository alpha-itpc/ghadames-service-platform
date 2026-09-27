# Multi-stage build for Ghadames Service Platform

# Stage 1: Build Frontend & Install Dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend assets
RUN npm run build

# Stage 2: Production Execution Environment
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server directory
COPY --from=builder /app/server ./server

# Expose server port
EXPOSE 5000

# Run database seed (optional on first boot) and start node server
CMD ["node", "server/index.js"]
