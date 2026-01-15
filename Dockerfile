# Build stage
FROM node:24.12.0-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./

FROM base AS builder
RUN yarn install --immutable
COPY . .
RUN yarn build

# Production stage
FROM base AS production
RUN yarn workspaces focus --production
COPY --from=builder /app/dist ./dist
CMD ["yarn", "start"]
