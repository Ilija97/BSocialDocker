# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm config set registry https://registry.npmjs.org/
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run your app
CMD ["npm", "start"]
