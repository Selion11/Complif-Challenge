# Usa una imagen liviana de Node.js
FROM node:20-alpine

# Instala curl para que el healthcheck de docker-compose funcione
RUN apk add --no-cache curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto que configuramos
EXPOSE 8080

# Comando para arrancar la app
CMD ["npm", "start"]