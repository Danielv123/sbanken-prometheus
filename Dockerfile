FROM node:alpine
MAINTAINER danielv@live.no
RUN apk add --no-cache git
RUN git init && \
git remote add origin https://github.com/Danielv123/sbanken-prometheus.git && \
git fetch --all --prune && \
git checkout master
ENTRYPOINT git pull && npm install && node index.js
