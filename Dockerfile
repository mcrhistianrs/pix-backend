FROM node:latest
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start:dev"]