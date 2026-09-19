FROM node:22-alpine

# Apply security updates
RUN apk update && apk upgrade --no-cache libssl3 libcrypto3

WORKDIR /app

# Install dependencies (retaining optional dependencies for tsx/esbuild platform binary)
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Ensure uploads directory exists and is writable by non-root user
RUN mkdir -p /app/uploads/campaigns && chown -R node:node /app/uploads

# Run as non-root user
USER node

EXPOSE 5000

# Run the production backend
CMD ["npm", "start"]
