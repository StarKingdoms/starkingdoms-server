const options = require("./SERVER_OPTIONS.js");

const express = require('express');
const app = express();
const socketio = require('socket.io');

function get_io() {
	if (options.DEVELOPMENT_MODE) {
		const http = require('http').Server(app);
		// enable insecure server on localhost
		let io = socketio(http, {
			secure: false,
			cors: {
				origin: "http://localhost",
				methods: ["GET", "POST"]
			}
		});

		http.listen(options.PORT);

		return io;
	} else {
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

		return io;
	}
}

exports.get_io = get_io;
