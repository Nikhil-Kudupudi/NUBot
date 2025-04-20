# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application (if needed)
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]