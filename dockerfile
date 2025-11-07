FROM node:22
COPY . .
RUN npm install
EXPOSE 8080
RUN npm run build
# Use the production build for serving
CMD ["npm", "run", "preview"]