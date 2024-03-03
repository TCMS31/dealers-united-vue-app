# syntax=docker/dockerfile:1

###############################################################################
# 1. Dependencies — cached independently of the source tree.
###############################################################################
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

###############################################################################
# 2. Build — produces the static bundle in /app/dist.
#
# `VITE_*` values are inlined by Vite at build time, so the API URL is a build
# argument rather than a runtime environment variable.
###############################################################################
FROM node:22-alpine AS build

ARG VITE_API_BASE_URL=http://localhost/api/v1/
ARG VITE_DEMO=false
ARG VITE_PAGE_SIZE=8

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_DEMO=$VITE_DEMO \
    VITE_PAGE_SIZE=$VITE_PAGE_SIZE

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
