# 1. Use official Node image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app
COPY . .

# 6. Build the app
RUN npm run dev

# 7. Expose the app port
EXPOSE 3000

# 8. Start the app
CMD ["npm", "run", "dev"]
