FROM node:20-alpine

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start the application in development mode with hot-reloading
CMD ["npm", "run", "dev"]
