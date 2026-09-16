# Stage 1: Build the application
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Ensure the uploads directory exists since local file storage is used (ephemeral on Render)
RUN mkdir -p uploads/resumes

# Set the entry point to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
