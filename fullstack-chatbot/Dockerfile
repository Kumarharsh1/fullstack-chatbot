# Backend Dockerfile
FROM node:18-alpine AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
EXPOSE 3001
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build