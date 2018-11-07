# Build the typescript
FROM node:8 as build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm install

# Copy everything in, 
# excludes everything in dockerignore
COPY . .

# Build the server
RUN npm run build

# Copy build into production environemnt
FROM node:8
WORKDIR /snapstock

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install

COPY --from=build /build/build build

ENTRYPOINT [ "node", "/snapstock/build/server.js" ]
