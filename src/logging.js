// Logging format:
// [2022-02-12T01:35:56] [LoggerName/LEVEL]: Message
// debug: \e[1;30m
function getTimestamp() {
    return new Date().toISOString();
}

class Logger {
    constructor(name) {
	this.name = name;
    }

    debug(message) {
	console.log(`\x1b[38;5;243m[${getTimestamp()}] [${this.name}/DEBUG]: ${message}\x1b[0m`);
    }

    info(message) {
	console.log(`[${getTimestamp()}] [${this.name}/INFO]: ${message}`);
    }

    warn(message) {
	console.log(`\x1b[38;5;11m[${getTimestamp()}] [${this.name}/WARN]: ${message}\x1b[0m`);
    }

    error(message) {
        console.log(`\x1b[38;5;9m[${getTimestamp()}] [${this.name}/ERROR]: ${message}\x1b[0m`);
    }

    fatal(message) {
        console.log(`\x1b[38;5;9m\x1b[1m[${getTimestamp()}] [${this.name}/FATAL]: ${message}\x1b[0m`);
    }
}

module.exports = { Logger };
