FROM node:20-alpine

WORKDIR /app

# Copy only package.json first for caching
COPY package*.json ./

# Install only once unless dependencies change
RUN npm install

# Copy app source files
COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
