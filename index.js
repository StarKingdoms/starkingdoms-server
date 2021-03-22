const express = require('express');
const socketio = require('socket.io')
const http = require('http')
const planck = require('planck-js')

const app = express();
const clientPath = `${__dirname}/`

let server = http.createServer(app);

app.use(express.static(clientPath));

let io = socketio(server);

let players = {};
let playerVitals = {};
let usernames = {};
//let modules = [];

tick();

const SCALE = 30;
let world;

world = planck.World({
	gravity: planck.Vec2(0, 0)
});

let earthBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(0 / SCALE, 0 / SCALE)
})
let earthCircle = planck.Circle(1250 / SCALE);
let earthFixture = {
	shape: earthCircle,
	density: 200
}

let moonBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(3500 / SCALE, -1600 / SCALE)
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
  players[socket.id].applyAngularImpulse(-0.06, true);
}

function dkey(socket) {
  players[socket.id].applyAngularImpulse(0.06, true);
}


io.on('connection', (socket) => {
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
		angularDamping: 0.1
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
//var moduleVitals = [];

function tick() {
	const intervalId = setInterval(() => {
		world.step(1 / 30, 10, 10);
		
		for (let key of Object.keys(players)) {
			playerVitals[key] = {
				x: players[key].getPosition().x * SCALE,
				y: players[key].getPosition().y * SCALE,
				rotation: players[key].getAngle(),
				velX: players[key].getLinearVelocity().x,
				velY: players[key].getLinearVelocity().y
			}
		}
		/*for(let i = 0;  i < modules.length; i++) {
			moduleVitals.push({
				x: modules[i].getPosition().x * SCALE,
				y: modules[i].getPosition().y * SCALE,
				rotation: modules[i].getAngle()
			});
    }*/
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
			//io.to(key).emit('module-pos', moduleVitals);
		}
	}, 1000 / 60)
	var intervalId2 = setInterval(() => {
		/*if(modules.length < 30) {
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
			var moduleBox = planck.Box(15, 15);
			var moduleFixture = {
				shape: moduleBox,
				density: 1,
				friction: 0.8,
				restitution: 0.3,
				angularVelocity: 0.1
			}
			moduleBody.createFixture(moduleFixture)

			modules.push(moduleBody);
    }*/

	}, 2000)
}

server.on('error', (err) => {
	console.error('Server error:', err);
});

server.listen(3000, () => {
	console.log("Server Started on 3000")
})