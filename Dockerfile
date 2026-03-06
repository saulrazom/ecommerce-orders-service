# Usamos la última versión LTS (Long Term Support)
FROM node:22-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos solo dependencias de producción para mantener la imagen ligera
RUN npm install --omit=dev

# Copiamos el resto del código fuente
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando para arrancar
CMD ["npm", "start"]