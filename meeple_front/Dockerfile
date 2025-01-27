# Meeple Frontend Dockerfile

# 빌드 단계
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm build

# 배포 단계
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 복사 (필요 시)
COPY ../nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]