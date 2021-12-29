const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const core_server_util = require("./core_server_util.js");
const rapier = require('rapier2d-node');
const util = require('./util.js');

let io = core_server_util.get_io();

gameLoop();

// start game code
let world = new rapier.World({x:0.0,y:0.0});
let players = {};
let usernames = {};
const SCALE = 10;

let earthDesc = rapier.RigidBodyDesc.newStatic()
    .setTranslation(0.0, 0.0);
let earthColliderDesc = new rapier.ColliderDesc(new rapier.Ball(1250 / SCALE))
let earth = world.createRigidBody(earthDesc);
let earthCollider = world.createCollider(earthColliderDesc, earth.handle);

let angle = Math.random() * Math.PI;
let pos = {
    x: Math.cos(angle) * 5000 / SCALE,
    y: Math.sin(angle) * 5000 / SCALE
};
let moonDesc = rapier.RigidBodyDesc.newStatic()
    .setTranslation(pos.x, pos.y);
let moonColliderDesc = new rapier.ColliderDesc(new rapier.Ball(300 / SCALE))
    .setDensity(3);
let moon = world.createRigidBody(moonDesc)
let moonCollider = world.createCollider(moonColliderDesc, moon.handle);

console.log(world.timestep);

function rotateVector(v, angle) {
    let newVector = { x: v.x*Math.cos(angle) - v.y*Math.sin(angle),
        y: v.x*Math.sin(angle) + v.y*Math.cos(angle)};
    return newVector;
}

function pressed_s(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyForce(rotateVector({x:0,y:20},player.rotation())
        , false);
}
function pressed_w(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyForce(rotateVector({x:0.0,y:-20},player.rotation())
        , false);
}
function pressed_a(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyTorque(-20, true);
}
function pressed_d(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyTorque(20, true);
}

io.sockets.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.emit('ready', socket.id);
        let angle = Math.random() * Math.PI;
        let pos = {
            x: Math.cos(angle) * 1300 / SCALE,
            y: Math.sin(angle) * 1300 / SCALE
        };
        let playerBodyDesc = rapier.RigidBodyDesc.newDynamic()
            .setTranslation(pos.x, pos.y);
        let colliderDesc = rapier.ColliderDesc.cuboid(25/SCALE, 25/SCALE);
        let player = world.createRigidBody(playerBodyDesc);
        let collider = world.createCollider(colliderDesc, player.handle);
        players[socket.id] = player;
        usernames[socket.id] = username;
    });
    socket.on('message', (text, username) => {
        io.emit('message', text, username);
    });
    socket.on('input', (keys) => {
        if (keys == undefined) return;
        if (keys.s===true) pressed_s(socket);
        if (keys.w===true) pressed_w(socket);
        if (keys.a===true) pressed_a(socket);
        if (keys.d===true) pressed_d(socket);
    });
    socket.on('disconnect', () => {
        io.emit('message', usernames[socket.id] + "left the game", "Server");
        if(players[socket.id] == null) {
            console.log("Player already disconnected");
            return;
        }
        world.removeRigidBody(players[socket.id]);
        delete players[socket.id];
        delete usernames[socket.id];
    });
});

function gameLoop() {
    const intervalId = setInterval(() => {
        world.step();

        let Earth = world.getRigidBody(earth.handle);
        let Moon= world.getRigidBody(moon.handle);
        planets = {
            earth: {
                x: Earth.translation().x * SCALE,
                y: Earth.translation().y * SCALE,
                mass: Earth.mass() * SCALE
            },
            moon: {
                x: Moon.translation().x * SCALE,
                y: Moon.translation().y * SCALE,
                mass: Moon.mass() * SCALE
            }
        }

        
        playerVitals = {};
        for (let key of Object.keys(players)) {
            playerVitals[key] = {
                x: players[key].translation().x * SCALE,
                y: players[key].translation().y * SCALE,
                velX: players[key].linvel().x * SCALE,
                velY: players[key].linvel().y * SCALE,
                rotation: players[key].rotation(),
                mass: players[key].mass() * SCALE
            };
            let earthForce = util.calcGravity(1/60, playerVitals[key], planets.earth, SCALE);
            let moonForce = util.calcGravity(1/60, playerVitals[key], planets.moon, SCALE);
            let force = {
                x:earthForce.x+moonForce.x,
                y:earthForce.y+moonForce.y,
            }
            players[key].wakeUp();
            players[key].applyForce(force, true);
        }
        for (let key of Object.keys(players)) {

            io.to(key).emit('planet-pos', planets);
            io.to(key).emit('client-pos', playerVitals, playerVitals[key], usernames);
        }
    });
}
