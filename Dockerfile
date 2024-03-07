# Utilizar la imagen de Node.js versión 20
FROM node:20.11.1

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar el archivo de definición de dependencias del proyecto
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# instalar pm2

RUN npm install pm2 -g

# Copiar los archivos fuente del proyecto al contenedor
COPY . .

# Exponer el puerto en el que tu aplicación se ejecutará
EXPOSE 2527

# Comando para ejecutar la aplicación
CMD ["pm2", "start", "server.js"]
