const options = require("./SERVER_OPTIONS.js");

const express = require('express');
const app = express();
const socketio = require('socket.io');
const { Logger } = require('./logging.js');

logger = new Logger('IOManager');
logger.info('IOManager ready');

function get_io() {
	if (fs.existsSync(options.PROD_OVERRIDE)) {
		logger.info('Production override found, ignoring server_options and disabling development mode');
		options.DEVELOPMENT_MODE = false;
	}
	if (options.DEVELOPMENT_MODE) {
		logger.info('Creating IOContextDev');
		const http = require('http').Server(app);
		// enable insecure server on localhost
		let io = socketio(http, {
			secure: false,
			cors: {
				methods: ["GET", "POST"],
				origin: "*"
			}
		});

		http.listen(options.PORT);
		logger.info('Created IOContextDev');
		return io;
	} else {
		logger.info('Creating IOContextSSL');
		const https = require('https');
		const fs = require('fs');
		// enable prod secure server on starkingdoms.tk

		let server = https.createServer({
			cert: fs.readFileSync(options.CERT_CERT),
			key: fs.readFileSync(options.CERT_PRIVATE),
		}, app);

		let io = socketio(server, {
			secure: true,
			cors: {
				origin: "https://starkingdoms.tk",
				methods: ["GET", "POST"]
			}
		});

		server.listen(options.PORT);
		logger.info('Created IOContextSSL');
		return io;
	}
}

exports.get_io = get_io;
