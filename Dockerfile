FROM node:12.16.1-alpine as builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM openresty/openresty:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/nginx/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

COPY --from=builder /app/build .

COPY --from=builder /app/scripts/env.sh .

RUN chmod +x env.sh

EXPOSE 3030

# Start Nginx server
ENTRYPOINT ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh > /usr/share/nginx/html/env.js && nginx -g\"daemon off;\""]
