# /frontend/Dockerfile
# Actualizamos de 18-alpine a 20-alpine para cumplir con los requisitos de Next.js
FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Iniciamos en modo desarrollo
CMD ["npm", "run", "dev"]