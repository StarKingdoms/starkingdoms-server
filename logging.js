const colors = require('colors');

let debugEnabled = false;

exports.debug = function(message) {
	        if (!debugEnabled) return;
	        let string = "[" + new Date().toISOString() + "/DEBUG] " + message;
	        console.log(string.gray);
}

exports.info = function(message) {
	        let string = "[" + new Date().toISOString() + "/INFO] " + message;
	        console.log(string);
}

exports.warn = function(message) {
	        let string = "[" + new Date().toISOString() + "/WARN] " + message;
	        console.log(string.yellow);
}

exports.error = function(message) {
	        let string = "[" + new Date().toISOString() + "/ERROR] " + message;
	        console.log(string.red);
}

exports.fatal = function(message) {
	        let string = "[" + new Date().toISOString() + "/FATAL] " + message;
	        console.log(string.red.bold);
}

exports.setup = function(debug) {
	        debugEnabled = debug;
}
