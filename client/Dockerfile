FROM node:alpine

# FIXME: Magic setting that prevents the React webapp from immediately shutting down after starting up. 
# i.e. letting it start and run in "daemon mode".
ENV CI=true

WORKDIR /var/app

COPY package.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "start"]