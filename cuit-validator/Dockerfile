# Usamos una imagen liviana de Node.js [cite: 96]
FROM node:18-alpine

# Creamos el directorio de trabajo
WORKDIR /app

RUN apk add --no-cache curl

# Copiamos solo los archivos de dependencias para aprovechar el cache de Docker
COPY package*.json ./

# Instalamos solo las dependencias necesarias para producción
RUN npm install --only=production

# Copiamos el resto del código del microservicio (el index.js que hicimos)
COPY . .

# El microservicio corre en el puerto 3001 
EXPOSE 3001

# Comando para arrancar el mock
CMD ["node", "index.js"]