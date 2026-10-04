FROM node:20-slim

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
