FROM node:22.19.0-alpine
RUN corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY . .
CMD ["yarn", "start"]