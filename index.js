const startup_time = Date.now();
/*
 * +----------+
 * | Includes |
 * +----------+
 */

const Matter = require('matter-js');
const logging = require("./logging.js");
logging.setup(true); // Setup logging with debug set to true
logging.info("Welcome to StarKingdoms! Version 0.3.1.1.");
const core_server_util = require("./core_server_util.js");

const banList = require('./bans.json');
const account_bans = banList.account;
const ip_bans = banList.ip;
logging.info("Loaded banlist");
var crypto = require('crypto');

/*
 * +----------------+
 * | Variable Setup |
 * +----------------+
 */

logging.info("Creating server io object.");
// Set up socket.io
// This func automatically returns the correct socket.io setup for the mode specified in SERVER_OPTIONS.js
let io = core_server_util.get_io();
logging.info("Server io object created. Server now listening for packets.");

logging.debug("Creating engine variables");
// Matter.js variable setup
var Engine = Matter.Engine;
var Runner = Matter.Runner;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;

// Game object setup
let Game = new Object();

let timeouts = {};
let players = {};
let playerVitals = {};
let usernames = {};
let joinedPlayers = {};

logging.info("Engine variables created.");

// Just for clean access if needed
Game.timeouts = timeouts;
Game.players = players;
Game.playerVitals = playerVitals;
Game.usernames = usernames;

let modules = [];

logging.debug("Starting game loop");
startGameLoop(); // Does exactly what it says. Starts the game loop.
logging.info("Game loop started.");
/*
 * +----------------------+
 * | Physics Engine Setup |
 * +----------------------+
 */

const SCALE = 30;
logging.debug("Starting physics setup");

var engine = Engine.create({  //
	gravity: {x: 0, y: 0} // Create engine with gravity at 0, 0 (Completley unused as custom gravity is used)
});                           //

let earthPos = {
	x: 0, //
	y: 0  // Create var for earth position
}

var earthBody = Bodies.circle(
	earthPos.x,             // Create earth
	earthPos.y,
	1250,
	{
		friction: .0007
	},
	50
);

let moonDistance = 5000;
var moonLocation = {
    x: Math.random() * 2 - 1, // Get random location for moon
    y: Math.random() * 2 - 1
}

var magnitude = Math.sqrt(moonLocation.x * moonLocation.x + moonLocation.y * moonLocation.y);
moonLocation.x /= magnitude;
moonLocation.y /= magnitude;

moonLocation.x *= moonDistance;
moonLocation.y *= moonDistance;

var moonBody = Bodies.circle(
	moonLocation.x,
	moonLocation.y,
	300,
	{}
);


Composite.add(engine.world, [earthBody, moonBody]);
logging.info("Created bodies.");

var runner = Runner.create();
logging.info("Created runner.");

function wkey(socket) {
	var force = { x: 0, y: -.001 };
	force = Matter.Vector.rotate(force, players[socket.id].angle);
	Matter.Body.applyForce(players[socket.id], players[socket.id].position, force);
}

function skey(socket) {
	var force = { x: 0, y: .001 };
	force = Matter.Vector.rotate(force, players[socket.id].angle);
	Matter.Body.applyForce(players[socket.id], players[socket.id].position, force);
}

function akey(socket) {
	if (players[socket.id].angularVelocity < -0.21041200776958874) {
		return;
	}
	Matter.Body.setAngularVelocity(players[socket.id], players[socket.id].angularVelocity + -.0025);
}

function dkey(socket) {
	if (players[socket.id].angularVelocity > 0.21041200776958874) {
		return;
	}
	Matter.Body.setAngularVelocity(players[socket.id], players[socket.id].angularVelocity + .0025);
}

logging.debug("Created input functions.");

io.sockets.on('connection', (socket) => {
	let addresshash = socket.handshake.address.address;
	console.dir(socket);
	logging.info(`Player connection recieved from ${addresshash}. Checking for IP ban...`);
	if (ip_bans.includes(addresshash)) {
		logging.warn("This player has been banned! Canceling connection.");
		socket.emit('disallowed_ban');
		socket.disconnect();
	}
	
	joinedPlayers[socket.id] = false;

	timeouts[socket.id] = setTimeout(function(){socket.disconnect();},5000);
	logging.debug("Waiting for player join event.");
	
	socket.on('join', (username) => {
		if (joinedPlayers[socket.id]) return;
		joinedPlayers[socket.id] = true;
		var boxBody = Bodies.rectangle(1500, 100, 50, 50, {
			friction: .001,
			restitution: 0.2,
			frictionAir: 0,
		});
		
		Composite.add(engine.world, [boxBody]);
		logging.debug("Created player body.");
		
		players[socket.id] = boxBody;
		usernames[socket.id] = username;
		clearTimeout(timeouts[socket.id]);
		logging.info(`PlayerJoinEvent finished execution for player ${usernames[socket.id]}.`);
		socket.emit('ready');
		logging.debug("Sent ServerReady message.");
		io.emit('message', username + " joined the game", "Server");
	});

	socket.on('disconnect', () => {
		logging.info("PlayerDisconnectEvent triggered. Removing player...");
		io.emit('message', usernames[socket.id] + " left the game", "Server");

		Composite.remove(engine.world, [players[socket.id]]);
		delete players[socket.id];
		delete playerVitals[socket.id];
		logging.info(`PlayerDisconnectEvent finished for player ${usernames[socket.id]}`);
		delete usernames[socket.id];
	});

	socket.on('message', (text, username) => {
		logging.info(`PlayerChatEvent recieved: ${username} said ${text}`);
		io.emit('message', text, username);
		logging.debug(`Resent PlayerChatEvent to all players.`);
	});

	socket.on('input', (keys) => {
		if (keys == undefined) {
			logging.warn(`PlayerInputRejectedEvent: Player ${usernames[socket.id]} sent an invalid input packet: undefined. Ignoring.`);
			return;
		}

		if (keys.s) {
			skey(socket);
		}
		if (keys.w) {
			wkey(socket);
		}
		if (keys.a) {
			akey(socket);
		}
		if (keys.d) {
			dkey(socket);
		}
	});
});

var planets = {};
var moduleVitals = [];

function startGameLoop() {
	const intervalId = setInterval(() => {
		Engine.update(engine, 1000/60);
		Matter.Body.setPosition(earthBody, earthPos);
		Matter.Body.setPosition(moonBody, moonLocation);

		for (let key of Object.keys(players)) {
			playerVitals[key] = {
				x: players[key].position.x,
				y: players[key].position.y,
				rotation: players[key].angle,
				velX: players[key].velocity.x,
				velY: players[key].velocity.y
			};
		}

		for(let i = 0;  i < modules.length; i++) {
			moduleVitals[i] = {
				x: modules[i].position.x,
				y: modules[i].position.y,
				rotation: modules[i].angle
			};

			var distance = Math.sqrt(
				((moduleVitals[i].x - earthBody.position.x / SCALE) *
					(moduleVitals[i].x - earthBody.position.x / SCALE)) +
				((moduleVitals[i].y - earthBody.position.y / SCALE) *
					(moduleVitals[i].y - earthBody.position.y / SCALE)));

      			var distance2 = Math.sqrt(
				((moduleVitals[i].x - moonBody.position.x / SCALE) *
					(moduleVitals[i].x - moonBody.position.x / SCALE)) +
				((moduleVitals[i].y - moonBody.position.y / SCALE) *
					(moduleVitals[i].y - moonBody.position.y / SCALE)))
			var G = .05;

			var strength = G * (earthBody.mass * modules[i].mass) / (distance * distance);
      			var strength2 = G * (moonBody.mass * modules[i].mass) / (distance2 * distance2);

			var force = {
				x: (earthBody.position.x) - moduleVitals[i].x,
				y: (earthBody.position.y) - moduleVitals[i].y,
			};

			var force2 = {
				x:  (moonBody.position.x) - moduleVitals[i].x,
				y:  (moonBody.position.y) - moduleVitals[i].y,
			};

			force.x /= distance;
			force.y /= distance;
			force.x *= strength;
			force.y *= strength;

  		    	force2.x /= distance2;
			force2.y /= distance2;
			force2.x *= strength2;
			force2.y *= strength2;
			Matter.Body.applyForce(modules[i], Matter.Vector.create(moduleVitals[i].x, moduleVitals[i].y), Matter.Vector.create(force.x + force2.x, force.y + force2.y));
		}

		planets = {
			earth: {
				x: earthBody.position.x,
				y: earthBody.position.y
			},

			moon: {
				x: moonBody.position.x,
				y: moonBody.position.y
			}
		}

		for (let key of Object.keys(playerVitals)) {
			var distance = Math.sqrt(
				((playerVitals[key].x - earthBody.position.x) * (playerVitals[key].x - earthBody.position.x)) +
				((playerVitals[key].y - earthBody.position.y) * (playerVitals[key].y - earthBody.position.y)));

			var distance2 = Math.sqrt(
				((playerVitals[key].x - moonBody.position.x) * (playerVitals[key].x - moonBody.position.x)) +
				((playerVitals[key].y - moonBody.position.y) * (playerVitals[key].y - moonBody.position.y)));

			var G = .05;
		   	var G2 = 0.1;

			var strength = G * (earthBody.mass * players[key].mass) / (distance * distance);
			var strength2 = G * (moonBody.mass * players[key].mass) / (distance2 * distance2);

			var force = {
				x: earthBody.position.x - playerVitals[key].x,
				y: earthBody.position.y - playerVitals[key].y
			};

			var force2 = {
				x: moonBody.position.x - playerVitals[key].x,
				y: moonBody.position.y - playerVitals[key].y
			};

			force.x /= distance;
			force.y /= distance;
			force.x *= strength;
			force.y *= strength;

			force2.x /= distance2;
			force2.y /= distance2;
			force2.x *= strength2;
			force2.y *= strength2;
            
			Matter.Body.applyForce(players[key], players[key].position, {x: force.x + force2.x, y: force.y + force2.y});

			for(let key1 of Object.keys(playerVitals)){
					io.to(key).emit('client-pos', playerVitals, playerVitals[key], usernames);
			}

			io.to(key).emit('planet-pos', planets);
			io.to(key).emit('module-pos', moduleVitals);
		}

	}, 1000 / 60);

	var intervalId2 = setInterval(() => {
		if(modules.length < 30) {
			var location = {
				x: Math.random() * 2 - 1,
				y: Math.random() * 2 - 1
			}

			var magnitude = Math.sqrt(location.x * location.x + location.y * location.y);
			location.x /= magnitude;
			location.y /= magnitude;

			location.x *= 1500;
			location.y *= 1500;

			var moduleBody = Bodies.rectangle(location.x, location.y, 50, 50);

			Composite.add(engine.world, moduleBody);
			modules.push(moduleBody);
		}
	}, 2000);
	logging.info("Initial game loop started.");
}
logging.info("Game fully initialized and ready for players.");
var startupTime = Date.now() - startup_time;
logging.info(`Server startup completed in ${startupTime / 1000} seconds.`);
