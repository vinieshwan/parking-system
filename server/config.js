'use strict';

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const {
	PORT,

	DB_NAME,
	DB_USER,
	DB_PASSWORD,

	HOSTNAME,
	HOSTPORT
} = process.env;

module.exports = {
	port: parseInt(PORT, 10) || 4000,
	mongodb: {
		connectionUrl: `mongodb://${DB_USER}:${DB_PASSWORD}@${HOSTNAME}:${HOSTPORT}/?authSource=${DB_NAME}`,
		database: DB_NAME
	}
};
