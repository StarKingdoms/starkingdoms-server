const express = require('express');
const socketio = require('socket.io')
const app = express();
const https = require('https');
const http = require('http').Server(app);
const Matter = require('matter-js')
const fs = require("fs");
const child_process = require("child_process");
const logging = require("./logging.js");

//let server = https.createServer({
//	cert: fs.readFileSync("/etc/apache2/cert.pem"),
//	key: fs.readFileSync("/etc/apache2/key.pem")
//}, app);
let io = socketio(http, {
	secure: false,
	cors: {
		origin: "http://localhost",
		methods: ["GET", "POST"]
	},
});
http.listen(8443);

var Engine = Matter.Engine,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite;

let players = {};
let playerVitals = {};
let usernames = {};
let modules = []; // lets readd modules wcgw

tick();

const SCALE = 30;

var engine = Engine.create({
	gravity: {x: 0, y: 0}
});

/*world = planck.World({
	gravity: planck.Vec2(0, 0)
});*/
let earthPos = {
	x: 0,
	y: 0
}
/*let earthBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(earthPos.x / SCALE, earthPos.y / SCALE)
})
let earthCircle = planck.Circle(1250 / SCALE);
let earthFixture = {
	shape: earthCircle,
	density: 200
}*/

var earthBody = Bodies.circle(earthPos.x, earthPos.y, 1250, {
	//isStatic: true,
    density: 10
});

let moonPos = {
	x: 3500,
	y: -1600
}
/*let moonBody = world.createBody({
	type: "dynamic",
	position: planck.Vec2(moonPos.x / SCALE, moonPos.y / SCALE)
})
let moonCircle = planck.Circle(200 / SCALE);
let moonFixture = {
	shape: moonCircle,
	density: 150
}*/
var moonBody = Bodies.circle(moonPos.x, moonPos.y, 200, {
	isStatic: true,
});

/*earthBody.createFixture(earthFixture);
moonBody.createFixture(moonFixture);*/
Composite.add(engine.world, [earthBody, moonBody]);

var runner = Runner.create();

function wkey(socket) {
  /*var f = players[socket.id].getWorldVector(planck.Vec2(0.0, -0.2));
  var p = players[socket.id].getWorldPoint(planck.Vec2(0.0, 0.2));
  players[socket.id].applyLinearImpulse(f, p, true);*/
	var force = { x: 0, y: -.8 };
    force = Matter.Vector.rotate(force, players[socket.id].angle);
	//force.x = force.x * Math.cos(players[socket.id].angle) - force.y * Math.sin(players[socket.id].angle);
	//force.y = force.x * Math.sin(players[socket.id].angle) + force.y * Math.cos(players[socket.id].angle);

	Matter.Body.applyForce(players[socket.id], players[socket.id].position, force);
}

function skey(socket) {
  /*var f = players[socket.id].getWorldVector(planck.Vec2(0.0, 0.2));
  var p = players[socket.id].getWorldPoint(planck.Vec2(0.0, -0.2));
  players[socket.id].applyLinearImpulse(f, p, true);*/
	var force = { x: 0, y: .8 };
    force = Matter.Vector.rotate(force, players[socket.id].angle);
	//force.x = force.x * Math.cos(players[socket.id].angle) - force.y * Math.sin(players[socket.id].angle);
	//force.y = force.x * Math.sin(players[socket.id].angle) + force.y * Math.cos(players[socket.id].angle);

	Matter.Body.applyForce(players[socket.id], players[socket.id].position, force);
}

function akey(socket) {
	/*if(players[socket.id].getAngularVelocity() < 1 &&
		players[socket.id].getAngularVelocity() > -1) {
		players[socket.id].applyAngularImpulse(-0.10, true);
	} else {
		players[socket.id].applyAngularImpulse(-0.06, true);
	}*/
	if (players[socket.id].angularVelocity < -0.21041200776958874) {
		return;
	}
    Matter.Body.setAngularVelocity(players[socket.id], players[socket.id].angularVelocity + -.0025);
}

function dkey(socket) {
	/*if(players[socket.id].getAngularVelocity() < 1 &&
		players[socket.id].getAngularVelocity() > -1) {
		players[socket.id].applyAngularImpulse(0.10, true);
	} else {
		players[socket.id].applyAngularImpulse(0.06, true);
	}*/
	if (players[socket.id].angularVelocity > 0.21041200776958874) {
		                return;
		        }
    Matter.Body.setAngularVelocity(players[socket.id], players[socket.id].angularVelocity + .0025);
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
	/*let boxBody = world.createBody({
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
	players[socket.id] = boxBody;*/
	var boxBody = Bodies.rectangle(1500, 100, 50, 50, {
		density: 1.0,
		friction: 0.8,
		restitution: 0.2,
        frictionAir: 0,
	});
	Composite.add(engine.world, [boxBody]);
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
		//world.destroyBody(players[socket.id])
		Composite.remove(engine.world, [players[socket.id]]);
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
		/*world.step(1 / 30, 10, 10);
		earthBody.setTransform(planck.Vec2(earthPos.x, earthPos.y), 0);
		moonBody.setTransform(planck.Vec2(moonPos.x, moonPos.y), 0);*/
		Engine.update(engine, 1000/60, 1);
        Matter.Body.setPosition(earthBody, earthPos);

		for (let key of Object.keys(players)) {
			playerVitals[key] = {
				/*x: players[key].getPosition().x * SCALE,
				y: players[key].getPosition().y * SCALE,
				rotation: players[key].getAngle(),
				velX: players[key].getLinearVelocity().x,
				velY: players[key].getLinearVelocity().y*/
				x: players[key].position.x,
				y: players[key].position.y,
				rotation: players[key].angle,
				velX: players[key].velocity.x,
				velY: players[key].velocity.y
			}
		}
		for(let i = 0;  i < modules.length; i++) {
			moduleVitals[i] = {
				/*x: modules[i].getPosition().x * SCALE,
				y: modules[i].getPosition().y * SCALE,
				rotation: modules[i].getAngle()*/
				x: modules[i].position.x,
				y: modules[i].position.y,
				rotation: modules[i].angle
			};
			var distance = Math.sqrt(((moduleVitals[i].x - earthBody.position.x * SCALE) *
			(moduleVitals[i].x - earthBody.position.x * SCALE)) +
			((moduleVitals[i].y - earthBody.position.y * SCALE) *
			(moduleVitals[i].y - earthBody.position.y * SCALE)))
      			var distance2 = Math.sqrt(((moduleVitals[i].x - moonBody.position.x * SCALE) *
			  (moduleVitals[i].x - moonBody.position.x * SCALE)) +
			  ((moduleVitals[i].y - moonBody.position.y * SCALE) *
			  (moduleVitals[i].y - moonBody.position.y * SCALE)))
			var G = 2;
      			var G2 = 0.1;
			var strength = G * (earthBody.mass * modules[i].mass) / (distance * distance);
      			var strength2 = G * (moonBody.mass * modules[i].mass) / (distance2 * distance2);
			var force = {
				//x:  (earthBody.getPosition().x * SCALE) - moduleVitals[i].x,
				//y:  (earthBody.getPosition().y * SCALE) - moduleVitals[i].y,
				x: (earthBody.position.x) - moduleVitals[i].x,
				y: (earthBody.position.y) - moduleVitals[i].y,
			};

			var force2 = {
				//x:  (moonBody.getPosition().x * SCALE) - moduleVitals[i].x,
				//y:  (moonBody.getPosition().y * SCALE) - moduleVitals[i].y,
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
				//x: earthBody.getPosition().x * SCALE,
				//y: earthBody.getPosition().y * SCALE
				x: earthBody.position.x,
				y: earthBody.position.y
			},
			moon: {
				//x: moonBody.getPosition().x * SCALE,
				//y: moonBody.getPosition().y * SCALE
				x: moonBody.position.x,
				y: moonBody.position.y
			}
		}
		for (let key of Object.keys(playerVitals)) {
			var distance = Math.sqrt(((playerVitals[key].x - earthBody.position.x) * (playerVitals[key].x - earthBody.position.x)) + ((playerVitals[key].y - earthBody.position.y) * (playerVitals[key].y - earthBody.position.y)));
            //var distance2 = Math.sqrt(((playerVitals[key].x - moonBody.getPosition().x * SCALE) * (playerVitals[key].x - moonBody.getPosition().x * SCALE)) + ((playerVitals[key].y - moonBody.getPosition().y * SCALE) * (playerVitals[key].y - moonBody.getPosition().y * SCALE)))
			var G = .00001;
		   	var G2 = 0.2
			var strength = G * (earthBody.mass * players[key].mass) / (distance * distance);
            //var strength2 = G * (moonBody.getMass() * players[key].getMass()) / (distance2 * distance2);
			var force = {
				//x:  (earthBody.getPosition().x * SCALE) - playerVitals[key].x,
				//y:  (earthBody.getPosition().y * SCALE) - playerVitals[key].y,
				x: earthBody.position.x - playerVitals[key].x,
				y: earthBody.position.y - playerVitals[key].y
			};

			var force2 = {
				//x:  (moonBody.getPosition().x * SCALE) - playerVitals[key].x,
				//y:  (moonBody.getPosition().y * SCALE) - playerVitals[key].y,
			};


			force.x /= distance;
			force.y /= distance;
			force.x *= strength;
			force.y *= strength;

      			/*force2.x /= distance2;
			force2.y /= distance2;
			force2.x *= strength2;
			force2.y *= strength2;*/
			//players[key].applyForceToCenter(planck.Vec2(force.x + force2.x, force.y + force2.y), false);
			Matter.Body.applyForce(players[key], {x: playerVitals[key].x, y: playerVitals[key].y}, {x: force.x, y: force.y});
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

			/*var moduleBody = world.createBody({
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

			modules.push(moduleBody);*/
            var moduleBody = Bodies.rectangle(location.x, location.y, 25, 25);
            modules.push(moduleBody);
    }

	}, 2000)
}
