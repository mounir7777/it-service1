FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY public/ /usr/share/nginx/html/
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1 || exit 1
EXPOSE 80
