'use strict';

/** Executes a specific method according to the command provided  */
class Command {
	constructor() {}
	/** Executes a command
	 * @param {string} command - Should be an enum ['park','unpark', 'getSlot']
	 * @param {arguments} args - Child nodes/params
	 */
	execute(command, ...args) {
		return command.execute(...args);
	}
}

module.exports = Command;
