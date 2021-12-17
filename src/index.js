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
let players = [];

let earthDesc = rapier.RigidBodyDesc.newStatic();
let earthColliderDesc = new rapier.ColliderDesc(new rapier.Ball(125))
    .setTranslation(0.0, 0.0);
let earth = world.createRigidBody(earthDesc);
let earthCollider = world.createCollider(earthColliderDesc, earth.handle);

console.log(world.timestep);
io.sockets.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.emit('ready');
        let playerBodyDesc = rapier.RigidBodyDesc.newDynamic();
        let player = world.createRigidBody(playerBodyDesc);
        players[socket.id] = playerBody.handle;
        io.emit('message', username + " joined the game", "Server");
    });
    socket.on('message', (text, username) => {
        io.emit('message', text, username);
    });
});

function gameLoop() {
    const intervalId = setInterval(() => {
        world.step();
        
        planets = {
            earth: {
                x: earth.translation.x,
                y: earth.translation.y
            },

        }
        
        for (let key of Object.keys(players)) {
            io.to(key).emit('planet-pos', planets);
        }
    });
}
