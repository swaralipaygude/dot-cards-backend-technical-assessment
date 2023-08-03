FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=db_proxy

FROM node:14

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]