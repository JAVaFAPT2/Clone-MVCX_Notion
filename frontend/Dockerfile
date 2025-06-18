FROM node:22-alpine

# Install bash for convenience (optional but useful for debugging)
RUN apk add --no-cache bash

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies (production + dev) exactly as locked
RUN npm ci --legacy-peer-deps

# Copy the rest of the application source
COPY . .

# Angular dev server will run on port 4200
EXPOSE 4200

# Default command: start Angular dev server accessible outside the container
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"] 