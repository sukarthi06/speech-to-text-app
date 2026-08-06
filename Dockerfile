# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG CONFIGURATION=development
RUN npm run build -- --configuration $CONFIGURATION

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist/voice-text-app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]