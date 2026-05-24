FROM node:20-alpine

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start the frontend Vite development server
CMD ["npm", "run", "dev"]
