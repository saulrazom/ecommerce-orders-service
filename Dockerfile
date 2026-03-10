# Usamos la última versión LTS (Long Term Support)
FROM public.ecr.aws/lambda/nodejs:22

# Directorio de trabajo
WORKDIR /var/task

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos solo dependencias de producción para mantener la imagen ligera
RUN npm install --omit=dev

# Copiamos el resto del código fuente
COPY . .

# Comando que ejecutará Lambda (Archivo.FunciónExportada)
CMD [ "src/index.handler" ]