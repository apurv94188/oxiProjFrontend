# Use an official Node.js image
FROM node:14

# Set working directory in container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port from .env
EXPOSE 9444

# Run the React app
CMD ["npm", "start"]
