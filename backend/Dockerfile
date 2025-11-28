FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
