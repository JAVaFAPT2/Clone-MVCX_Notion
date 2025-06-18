FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /build

# Copy Maven project descriptor first for dependency caching
COPY pom.xml .

# Copy project source
COPY src ./src

# Package the Spring Boot application, skipping tests for faster build
RUN mvn -B clean package -DskipTests

# ------------------------------------------------------------
# Runtime stage: use a minimal JRE image to keep the image small
# ------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /build/target/*.jar app.jar

# Expose the port Spring Boot runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"] 