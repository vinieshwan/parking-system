'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const { CommandController } = require('@lib/controllers');

describe('/lib/controllers/command.js', () => {
	let command;

	class SampleCommand {
		execute(word) {
			return `Hello ${word}!`;
		}
	}

	class NoExecuteCommand {
		print() {
			return 'Hello World!';
		}
	}

	const sandbox = sinon.createSandbox();

	describe('#execute', () => {
		beforeEach(function () {
			command = new CommandController();
		});

		it('should execute a command', () => {
			const process = command.execute(new SampleCommand(), 'World');

			expect(process).to.equal('Hello World!');
		});

		it('should should throw if class has no execute method', () => {
			expect(function () {
				command.execute(new NoExecuteCommand(), 'World');
			}).to.throw();
		});

		it('should should throw if there was a problem during the execution of command', () => {
			sandbox
				.stub(SampleCommand.prototype, 'execute')
				.throws(new Error('error'));

			let error;

			try {
				command.execute(new SampleCommand(), 'World');
			} catch (err) {
				error = err;
			}

			expect(error).to.be.an('error');
		});
	});
});
