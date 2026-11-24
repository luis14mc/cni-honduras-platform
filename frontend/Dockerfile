FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_MEDIA_HOSTNAME
ARG NEXT_PUBLIC_CMS_ENV
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL
ARG STRAPI_ORIGIN
RUN NEXT_STANDALONE=1 pnpm build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
CMD ["node", "server.js"]
