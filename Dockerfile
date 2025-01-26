# Stage 1: Build
FROM gradle:7.5.1-jdk17 AS build
WORKDIR /app
COPY . /app
RUN gradle clean build -x test -p meeple_back
# Stage 2: Run
FROM openjdk:17-jdk-slim
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=build /app/build/libs/*.jar app.jar
COPY back/src/main/resources/application.yml /app/src/main/resources/application.yml

COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java","-jar","app.jar"]