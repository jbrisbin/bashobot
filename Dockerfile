FROM alpine
MAINTAINER Jon Brisbin <jbrisbin@basho.com>
RUN apk add --no-cache nodejs
RUN npm install -g botkit mustache
RUN mkdir -p /usr/lib/bashobot

COPY *.js* /usr/lib/bashobot/
COPY templates /usr/lib/bashobot/templates/

WORKDIR /usr/lib/bashobot
CMD ["node", "bots.js"]
