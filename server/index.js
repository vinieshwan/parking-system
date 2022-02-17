'use strict';

const config = require('@config');
const Server = require('@lib/server');

const server = new Server(config);

server.start();
