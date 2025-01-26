# Stage 1: Build
FROM gradle:7.5.1-jdk17 AS build
WORKDIR /app
COPY . /app
RUN gradle clean build -x test -p meeple_back

# Stage 2: Run
FROM openjdk:17-jdk-slim
WORKDIR /app

# 환경 변수 설정 (필요 시)
ENV SPRING_PROFILES_ACTIVE=prod

# 빌드 스테이지에서 복사한 JAR 파일 및 application.yml 파일 복사
COPY --from=build /app/meeple_back/build/libs/*.jar app.jar
COPY meeple_back/src/main/resources/application.yml /app/src/main/resources/application.yml

EXPOSE 8090
ENTRYPOINT ["java","-jar","app.jar"]