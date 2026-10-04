FROM node:20-alpine

# Install build dependencies for native modules (bcrypt) and openssl for Prisma
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

# Copy dependency manifests and Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose port (default NestJS port in main.ts is 3001)
EXPOSE 3001

# Run production build
CMD ["npm", "run", "start:prod"]
