FROM node:14
WORKDIR /usr/src/app
COPY package.json ./
RUN npm i fsevents@latest -f --save-optional
COPY . .
CMD [ "npm", "start" ]
