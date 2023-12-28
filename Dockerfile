# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle the app source
COPY . .

# Expose the necessary ports
EXPOSE 3000
EXPOSE 50051

# Start the app
CMD ["npm", "start"]
