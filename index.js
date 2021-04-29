const express = require('express');
const socketio = require('socket.io')
const app = express();
const https = require('https');
const http = require('http').Server(app);
const planck = require('planck-js')
const fs = require("fs");
const child_process = require("child_process");
const logging = require("./logging.js");
child_process.execSync("eval \"$(ssh-agent -s)\""); // Start ssh-server
child_process.execSync("ssh-add /root/.ssh/id_ed25519"); // Load ssh key
let server = https.createServer({
	cert: fs.readFileSync("/etc/apache2/cert.pem"),
	key: fs.readFileSync("/etc/apache2/key.pem")
}, app);
let io = socketio(server, {
	secure: true,
	cors: {
		origin: "https://starkingdoms.tk",
		methods: ["GET", "POST"]
	},
});
server.listen(8443);

let players = {};
let playerVitals = {};
let usernames = {};
let modules = []; // lets readd modules wcgw

tick();

const SCALE = 30;
let world;

world = planck.World({
	gravity: planck.Vec2(0, 0)
});
let earthPos = {
	x: 0,
	y: 0
}
let earthBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(earthPos.x / SCALE, earthPos.y / SCALE)
})
let earthCircle = planck.Circle(1250 / SCALE);
let earthFixture = {
	shape: earthCircle,
	density: 200
}

let moonPos = {
	x: 3500,
	y: -1600
}
let moonBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(moonPos.x / SCALE, moonPos.y / SCALE)
})
let moonCircle = planck.Circle(200 / SCALE);
let moonFixture = {
	shape: moonCircle,
	density: 150
}

earthBody.createFixture(earthFixture);
moonBody.createFixture(moonFixture);

function wkey(socket) {
  var f = players[socket.id].getWorldVector(planck.Vec2(0.0, -0.2));
  var p = players[socket.id].getWorldPoint(planck.Vec2(0.0, 0.2));
  players[socket.id].applyLinearImpulse(f, p, true);
}

function skey(socket) {
  var f = players[socket.id].getWorldVector(planck.Vec2(0.0, 0.2));
  var p = players[socket.id].getWorldPoint(planck.Vec2(0.0, -0.2));
  players[socket.id].applyLinearImpulse(f, p, true);
}

function akey(socket) {
	if(players[socket.id].getAngularVelocity() < 1 &&
		players[socket.id].getAngularVelocity() > -1) {
		players[socket.id].applyAngularImpulse(-0.10, true);
	} else {
		players[socket.id].applyAngularImpulse(-0.06, true);
	}
}

function dkey(socket) {
	if(players[socket.id].getAngularVelocity() < 1 &&
		players[socket.id].getAngularVelocity() > -1) {
		players[socket.id].applyAngularImpulse(0.10, true);
	} else {
		players[socket.id].applyAngularImpulse(0.06, true);
	}
}


io.sockets.on('connection', (socket) => {
	console.log('Someone connected');

	/*let body = world.createBody({
		type: "dynamic",
		position: planck.Vec2(0 / SCALE, 0 / SCALE),
		linearDamping: 0.1,
		angularDamping: 0.5
  });
  
  let body2 = world.createBody({
		type: "dynamic",
		position: planck.Vec2(0 / SCALE, 0 / SCALE),
		linearDamping: 0.05,
		angularDamping: 0.1
  });*/
	let boxBody = world.createBody({
		type: "dynamic",
		position: planck.Vec2(0 / SCALE, 0 / SCALE)
	});

	let boxBox = planck.Box(25.0 / SCALE, 25.0 / SCALE);
	let fixtureDef = {
		shape: boxBox,
		density: 1.0,
		friction: 0.8,
		restitution: 0.2,
		angularDamping: 0.1,
		linearDamping: 0
	}
	boxBody.createFixture(fixtureDef)
	players[socket.id] = boxBody;
	
	/*body.createFixture(fixtureDef);
	console.log(body.getMass())
	console.log(earthBody.getMass())
	players[socket.id] = body;

  body2.createFixture(fixtureDef);
	console.log(body2.getMass())
	console.log(moonBody.getMass())
	players[socket.id] = body2;*/

	socket.on('join', (username) => {
		usernames[socket.id] = username;
		io.emit('message', username + " joined the game", "Server")
	})

	socket.on('disconnect', () => {
		console.log('Someone disconnected');
		io.emit('message', usernames[socket.id] + " left the game", "Server");
		world.destroyBody(players[socket.id])
		delete players[socket.id]
		delete playerVitals[socket.id]
		delete usernames[socket.id]
	});
	socket.on('message', (text, username) => {
		io.emit('message', text, username);
	})
	socket.on('input', (keys) => {
		if (keys.s) {
			//players[socket.id].applyForceToCenter(planck.Vec2(0, 40 / SCALE), true)
      skey(socket);
		}
		if (keys.w) {
			//players[socket.id].applyForceToCenter(planck.Vec2(0, -40 / SCALE), true)
      wkey(socket);
		}
		if (keys.a) {
			akey(socket);
		}
    if (keys.d) {
			dkey(socket);
		}
	})
})

var planets = {};
var moduleVitals = [];

function tick() {
	const intervalId = setInterval(() => {
		world.step(1 / 30, 10, 10);
		earthBody.setTransform(planck.Vec2(earthPos.x, earthPos.y), 0);
		moonBody.setTransform(planck.Vec2(moonPos.x, moonPos.y), 0);

		for (let key of Object.keys(players)) {
			playerVitals[key] = {
				x: players[key].getPosition().x * SCALE,
				y: players[key].getPosition().y * SCALE,
				rotation: players[key].getAngle(),
				velX: players[key].getLinearVelocity().x,
				velY: players[key].getLinearVelocity().y
			}
		}
		for(let i = 0;  i < modules.length; i++) {
			moduleVitals[i] = {
				x: modules[i].getPosition().x * SCALE,
				y: modules[i].getPosition().y * SCALE,
				rotation: modules[i].getAngle()
			};
			var distance = Math.sqrt(((moduleVitals[i].x - earthBody.getPosition().x * SCALE) *
			(moduleVitals[i].x - earthBody.getPosition().x * SCALE)) +
			((moduleVitals[i].y - earthBody.getPosition().y * SCALE) *
			(moduleVitals[i].y - earthBody.getPosition().y * SCALE)))
      		var distance2 = Math.sqrt(((moduleVitals[i].x - moonBody.getPosition().x * SCALE) *
			  (moduleVitals[i].x - moonBody.getPosition().x * SCALE)) +
			  ((moduleVitals[i].y - moonBody.getPosition().y * SCALE) *
			  (moduleVitals[i].y - moonBody.getPosition().y * SCALE)))
			var G = 1;
      		var G2 = 0.2
			var strength = G * (earthBody.getMass() * modules[i].getMass()) / (distance * distance);
      		var strength2 = G * (moonBody.getMass() * modules[i].getMass()) / (distance2 * distance2);
			var force = {
				x:  (earthBody.getPosition().x * SCALE) - moduleVitals[i].x,
				y:  (earthBody.getPosition().y * SCALE) - moduleVitals[i].y,
			};

			var force2 = {
				x:  (moonBody.getPosition().x * SCALE) - moduleVitals[i].x,
				y:  (moonBody.getPosition().y * SCALE) - moduleVitals[i].y,
			};

			force.x /= distance;
			force.y /= distance;
			force.x *= strength;
			force.y *= strength;

  		    force2.x /= distance2;
			force2.y /= distance2;
			force2.x *= strength2;
			force2.y *= strength2;
			modules[i].applyForceToCenter(planck.Vec2(force.x + force2.x, force.y + force2.y), false);
		}
		planets = {
			earth: {
				x: earthBody.getPosition().x * SCALE,
				y: earthBody.getPosition().y * SCALE
			},
			moon: {
				x: moonBody.getPosition().x * SCALE,
				y: moonBody.getPosition().y * SCALE
			}
		}
		for (let key of Object.keys(playerVitals)) {
			var distance = Math.sqrt(((playerVitals[key].x - earthBody.getPosition().x * SCALE) * (playerVitals[key].x - earthBody.getPosition().x * SCALE)) + ((playerVitals[key].y - earthBody.getPosition().y * SCALE) * (playerVitals[key].y - earthBody.getPosition().y * SCALE)))
      var distance2 = Math.sqrt(((playerVitals[key].x - moonBody.getPosition().x * SCALE) * (playerVitals[key].x - moonBody.getPosition().x * SCALE)) + ((playerVitals[key].y - moonBody.getPosition().y * SCALE) * (playerVitals[key].y - moonBody.getPosition().y * SCALE)))
			var G = 1;
      var G2 = 0.2
			var strength = G * (earthBody.getMass() * players[key].getMass()) / (distance * distance);
      var strength2 = G * (moonBody.getMass() * players[key].getMass()) / (distance2 * distance2);
			var force = {
				x:  (earthBody.getPosition().x * SCALE) - playerVitals[key].x,
				y:  (earthBody.getPosition().y * SCALE) - playerVitals[key].y,
			};

			var force2 = {
				x:  (moonBody.getPosition().x * SCALE) - playerVitals[key].x,
				y:  (moonBody.getPosition().y * SCALE) - playerVitals[key].y,
			};


			force.x /= distance;
			force.y /= distance;
			force.x *= strength;
			force.y *= strength;

      force2.x /= distance2;
			force2.y /= distance2;
			force2.x *= strength2;
			force2.y *= strength2;
			players[key].applyForceToCenter(planck.Vec2(force.x + force2.x, force.y + force2.y), false);
			io.to(key).emit('client-pos', playerVitals, playerVitals[key], usernames);
			io.to(key).emit('planet-pos', planets);
			io.to(key).emit('module-pos', moduleVitals);
		}
	}, 1000 / 60)
	var intervalId2 = setInterval(() => {
		console.log(modules.length);
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

			location.x /= 30;
			location.y /= 30;

			var moduleBody = world.createBody({
				type: "dynamic",
				position: planck.Vec2(location.x, location.y)
			});
			var moduleBox = planck.Box(25 / SCALE, 25 / SCALE); 
			var moduleFixture = {
				shape: moduleBox,
				density: 1,
				friction: 0.8,
				restitution: 0.3,
				angularVelocity: 0.1
			}
			moduleBody.createFixture(moduleFixture)

			modules.push(moduleBody);
    }

	}, 2000)
}
