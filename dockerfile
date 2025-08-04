FROM node:22
WORKDIR /src
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]