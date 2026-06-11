# Stage 1: Build the Angular app
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy custom nginx config with API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/fifa-poll-ui/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
