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

# Screenshot storage when no S3 bucket is configured. Created here so the
# volume docker-compose.prod.yml mounts over it is writable by the node user.
RUN mkdir -p /app/uploads && chown node:node /app/uploads

# Run as non-root user
USER node

EXPOSE 5000

# Run the production backend
CMD ["npm", "start"]
