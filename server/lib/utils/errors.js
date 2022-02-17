'use strict';

class ErrorHandler extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

class InternalServerError extends ErrorHandler {
	constructor(message) {
		super(message);
		this.code = 500;
	}
}

class InvalidArgumentError extends ErrorHandler {
	constructor(message) {
		super(message);
		this.code = 400;
	}
}

class NotFoundError extends ErrorHandler {
	constructor(message) {
		super(message);
		this.code = 404;
	}
}

module.exports = {
	InternalServerError,
	NotFoundError,
	InvalidArgumentError
};
