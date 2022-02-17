FROM mongo:5.0

COPY ./.env .env
COPY ./setup-db.js setup-db.js

COPY ./schema/ /schema/
COPY ./seed/ /seed/
COPY ./setup-db.sh setup-db.sh

CMD sh setup-db.sh