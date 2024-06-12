# ビルドステージ
FROM node:20.12.2 AS build

WORKDIR /app
COPY package*.json ./

RUN npm install -g npm@latest
COPY . .

RUN npm run build

# 配信ステージ
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]