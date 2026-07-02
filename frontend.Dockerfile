FROM node:18-alpine

WORKDIR /code

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Ensure dist directory has correct permissions
RUN chmod -R 755 /code/dist

# List built files for verification
RUN echo "Built files:" && ls -la /code/dist/

# The built files will be in /code/dist and mounted by nginx
