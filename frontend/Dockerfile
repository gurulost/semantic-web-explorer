
FROM node:18-alpine

WORKDIR /app

# Add build argument for VITE_API_BASE_URL
ARG VITE_API_BASE_URL=http://backend:8000

# Set the environment variable using the build argument
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
