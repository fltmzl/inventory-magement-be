FROM node:20-slim

# Install OpenSSL yang dibutuhkan oleh Prisma engine di Linux
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests and Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies dan kunci Prisma ke versi 5
RUN npm install
RUN npm install prisma@5.9.1
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose port (default NestJS port in main.ts is 3001)
EXPOSE 3001

# Run production build
CMD ["npm", "run", "start:prod"]
