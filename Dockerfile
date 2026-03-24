# Dockerfile for VITAM React Client

# Build Stage
FROM node:18-alpine as build
WORKDIR /app

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy application files and build
COPY client/ .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy the built assets from the build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default nginx config to support React Router SPA routing
RUN rm /etc/nginx/conf.d/default.conf
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
