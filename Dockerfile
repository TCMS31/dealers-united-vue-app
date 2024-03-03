# syntax=docker/dockerfile:1

###############################################################################
# 1. Dependencies — cached independently of the source tree.
###############################################################################
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

###############################################################################
# 2. Build — produces the static bundle in /app/dist.
#
# `VUE_APP_*` values are inlined by webpack at build time, so the API URL is a
# build argument rather than a runtime environment variable.
###############################################################################
FROM node:20-alpine AS build

ARG VUE_APP_API_BASE_URL=http://localhost/api/v1/
ARG VUE_APP_DEMO=false
ARG VUE_APP_PAGE_SIZE=8

ENV VUE_APP_API_BASE_URL=$VUE_APP_API_BASE_URL \
    VUE_APP_DEMO=$VUE_APP_DEMO \
    VUE_APP_PAGE_SIZE=$VUE_APP_PAGE_SIZE \
    NODE_ENV=production

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

###############################################################################
# 3. Runtime — nginx serving the bundle as an unprivileged user.
###############################################################################
FROM nginx:1.27-alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# The nginx image ships an unprivileged `nginx` user; give it the paths it needs
# and drop root for good.
RUN mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi \
    && chown -R nginx:nginx /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
