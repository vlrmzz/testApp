# Multi-stage build
FROM node:18 AS client-builder

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18 AS server

# Set working directory
WORKDIR /app

# Copy server package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install server dependencies
RUN npm install --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy built client from previous stage
COPY --from=client-builder /app/client/build ./client/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the server
CMD ["npm", "start"]