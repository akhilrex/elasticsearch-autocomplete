FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

RUN npm install pm2 -g

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
COPY . .

CMD [ "pm2-runtime", "ecosystem.config.js" ]