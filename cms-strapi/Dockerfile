FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN npm install --global npm@11.4.2
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG STRAPI_PUBLIC_URL
ENV NODE_ENV=production
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
COPY --from=build --chown=node:node /app .
USER node
CMD ["npm", "start"]
