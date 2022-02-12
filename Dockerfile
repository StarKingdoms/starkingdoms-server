FROM node:17-alpine

WORKDIR /usr/src/starkingdoms
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8443

CMD ["node", "."]
