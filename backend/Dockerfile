# Use the official Node.js runtime as a parent image
FROM node:20-alpine

# Ensure we are explicitly running as root for system setup commands
USER root

# Install the Docker CLI package using Alpine's package manager
RUN apk update && apk add --no-cache docker-cli && rm -rf /var/cache/apk/*

# --- User Management (Requires root privileges) ---


# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Command to run the application
CMD [ "npm", "start" ]