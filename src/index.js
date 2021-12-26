const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const core_server_util = require("./core_server_util.js");
const rapier = require('rapier2d-node');

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
console.log(earth.mass());

console.log(world.timestep);
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
        let colliderDesc = rapier.ColliderDesc.cuboid(50/SCALE, 50/SCALE);
        let player = world.createRigidBody(playerBodyDesc);
        let collider = world.createCollider(colliderDesc, player.handle);
        players[socket.id] = player;
        usernames[socket.id] = username;
    });
    socket.on('message', (text, username) => {
        io.emit('message', text, username);
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
        planets = {
            earth: {
                x: Earth.translation().x * SCALE,
                y: Earth.translation().y * SCALE
            },
            moon: {
                x: 100000,
                y: 100000
            }
        }

        
        playerVitals = [];
        for (let key of Object.keys(players)) {
            playerVitals[key] = {
                x: players[key].translation().x * SCALE,
                y: players[key].translation().y * SCALE,
                velX: players[key].linvel().x * SCALE,
                velY: players[key].linvel().y * SCALE,
                rotation: players[key].rotation()
            };
        }
        for (let key of Object.keys(players)) {

            io.to(key).emit('planet-pos', planets);
            io.to(key).emit('client-pos', playerVitals, playerVitals[key], usernames);
        }
    });
}
