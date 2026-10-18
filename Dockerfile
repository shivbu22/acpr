FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev || true

COPY . .

EXPOSE 3333

CMD ["node", "serve.js"]
