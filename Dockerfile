# Gunakan image Node.js resmi
FROM node:20-alpine

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json dulu (biar cache efisien)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy semua file project ke container
COPY . .

# Expose port Express (biasanya 3000)
EXPOSE 3000

# Jalankan perintah start
CMD ["npm", "start"]
