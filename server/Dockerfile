# --- STAGE 1: Dependency Builder [V8 C++] ---
FROM node:20-alpine AS builder

# Add fundamental C++ compilation tools for native bindings (like bcrypt/canvas)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency manifests first to leverage Docker Layer Caching aggressively
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the actual application code
COPY . .

# --- STAGE 2: Micro-Production Container ---
FROM node:20-alpine

# Set to strict production environment
ENV NODE_ENV=production

WORKDIR /app

# Install PM2 globally for native V8 Node Cluster Management
RUN npm install pm2 -g

# Copy ONLY the heavily compiled node_modules from the Builder stage (dropping the heavy C++ build tools)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose mapping ports
EXPOSE 4000

# Advanced Boot Sequence: Use PM2 to run the server in horizontal cluster mode based on available CPU threads
# The --no-daemon flag prevents the docker container from spontaneously exiting
CMD ["pm2-runtime", "server.js", "-i", "max", "--time"]
