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
world.maxPositionIterations = 8;
world.maxVelocityIterations = 8;
let players = {};
let mouses = {};
let mousePos = {};
let usernames = {};
let moduleDetectors = {};
let modules = [];
let moduleGrab = [];
const SCALE = 10;

let earthDesc = rapier.RigidBodyDesc.newStatic()
    .setTranslation(0.0, 0.0);
let earthColliderDesc = new rapier.ColliderDesc(new rapier.Ball(1250 / SCALE))
let earth = world.createRigidBody(earthDesc);
let earthCollider = world.createCollider(earthColliderDesc, earth.handle);

let angle = 2 * Math.random() * Math.PI;
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
    player.applyForce(rotateVector({x:0,y:100},player.rotation())
        , false);
}
function pressed_w(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyForce(rotateVector({x:0.0,y:-100},player.rotation())
        , false);
}
function pressed_a(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyTorque(-100, true);
}
function pressed_d(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyTorque(100, true);
}

io.sockets.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.emit('ready', socket.id);
        let angle = 2 * Math.random() * Math.PI;
        let pos = {
            x: Math.cos(angle) * 1300 / SCALE,
            y: Math.sin(angle) * 1300 / SCALE
        };
        let playerBodyDesc = rapier.RigidBodyDesc.newDynamic()
            .setTranslation(pos.x, pos.y);
        let colliderDesc = rapier.ColliderDesc.cuboid(25/SCALE, 25/SCALE);
        let player = world.createRigidBody(playerBodyDesc);
        let collider = world.createCollider(colliderDesc, player.handle);
        let mouseDesc = rapier.ColliderDesc.cuboid(0.1, 0.1)
            .setTranslation(0, 0)
            .setSensor(true);
        let mouse = world.createCollider(mouseDesc)
        let moduleDetector = new rapier.Ball(40/SCALE);
        
        mouse.module = 0
        mouse.button = 0
        players[socket.id] = player;
        mouses[socket.id] = mouse;

        usernames[socket.id] = username;
        moduleDetectors[socket.id] = moduleDetector;
    });
    socket.on('message', (text, username) => {
        io.emit('message', text, username);
    });
    socket.on('input', (keys, mouse={x:0,y:0},buttons) => {
        if (keys == undefined) return;
        if (keys.s===true) pressed_s(socket);
        if (keys.w===true) pressed_w(socket);
        if (keys.a===true) pressed_a(socket);
        if (keys.d===true) pressed_d(socket);
        if (mouses[socket.id] == undefined) return;
        console.log(mouses[socket.id])
        mouses[socket.id].setTranslation(mouse.x/SCALE,mouse.y/SCALE)
        console.log(mouses[socket.id].translation())
        mouses[socket.id].module = mouses[socket.id].module
        mouses[socket.id].button = buttons;
    });
    socket.on('disconnect', () => {
        io.emit('message', usernames[socket.id] + "left the game", "Server");
        if(players[socket.id] == null) {
            console.log("Player already disconnected");
            return;
        }
        world.removeRigidBody(players[socket.id]);
        delete mouses[socket.id]
        delete mousePos[socket.id];
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

        for(let key of Object.keys(mouses)) {
            world.intersectionsWith(mouses[key].handle, (handle) => {
                    for(let i=0; i < modules.length; i++) {
                        if(handle === modules[i].handle && mouses[key].module == 0 &&
                            mouses[key].button == 1) {
                            //modules[i].setDominanceGroup(-127);
                            moduleGrab[i].grabbed = 1;
                            moduleGrab[i].mouse = key;
                            mouses[key].module = 1;
                            return false;
                        }
                    }
                    return true;
            });
            if(mouses[key].button == 0) {
                mouses[key].module = 0;
                for(let i=0; i < modules.length; i++) {
                    if(moduleGrab[i].mouse == key) {
                        /*modules[i].setDominanceGroup(0);
                        modules[i].wakeUp();
                        modules[i].setLinvel({x:0,y:0}, true);
                        modules[i].setAngvel(0, true);*/
                        moduleGrab[i].grabbed = 0;
                        moduleGrab[i].mouse = 0;
                    }
                }
            }
        }

        for(let key of Object.keys(moduleDetectors)) {
            world.intersectionsWithShape(players[key].translation(), 0,
                moduleDetectors[key], 0xFFFFFFFF, (handle) => {
                for(let i=0; i < modules.length; i++) {
                    if(handle === modules[i].handle && moduleGrab[i].grabbed != 0) {
                        let offset = {x:0, y: 5};
                        offset = rotateVector(offset, players[key].rotation());
                        let newPos = {
                            x: players[key].translation().x+offset.x,
                            y: players[key].translation().y+offset.y,
                        }
                        modules[i].wakeUp();
                        modules[i].setTranslation(newPos, true);
                    }
                }
            });
        }

        
        playerVitals = {};
        for (let key of Object.keys(players)) {
            if(players[key].rotation() > 1000 || players[key].rotation() < -1000) {
                players[key].setRotation(0);
            }
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
        moduleVitals = [];
        for(let i = 0; i < modules.length; i++) {
            if(moduleGrab[i].grabbed == 1) {
                let thisMousePos = {
                    x: mousePos[moduleGrab[i].mouse].x,
                    y: mousePos[moduleGrab[i].mouse].y
                };
                let vel = {
                    x: thisMousePos.x - modules[i].translation().x,
                    y: thisMousePos.y - modules[i].translation().y
                };
                modules[i].wakeUp();
                modules[i].setLinvel(vel, true);
            }
            moduleVitals[i] = {
                x: modules[i].translation().x * SCALE,
                y: modules[i].translation().y * SCALE,
                rotation: modules[i].rotation(),
                mass: modules[i].mass * SCALE
            };
            let earthForce = util.calcGravity(1/60, moduleVitals[i], planets.earth, SCALE);
            let moonForce = util.calcGravity(1/60, moduleVitals[i], planets.moon, SCALE);
            let force = {
                x:earthForce.x+moonForce.x,
                y:earthForce.y+moonForce.y
            }
            modules[i].wakeUp();
            modules[i].applyForce(force, true);
        }
        for (let key of Object.keys(players)) {

            io.to(key).emit('planet-pos', planets);
            io.to(key).emit('client-pos', playerVitals, playerVitals[key], usernames);
            io.to(key).emit('module-pos', moduleVitals);
        }
    }, 1000/240);
    const intervalId2 = setInterval(() => {
        if(modules.length < 30) {
            let angle = 2 * Math.random() * Math.PI;
            let pos = {
                x: Math.cos(angle) * 1500 / SCALE,
                y: Math.sin(angle) * 1500 / SCALE
            };
            let moduleDesc = rapier.RigidBodyDesc.newDynamic()
                .setTranslation(pos.x, pos.y);
            let moduleColliderDesc = rapier.ColliderDesc.cuboid(25/SCALE, 25/SCALE);
            let module = world.createRigidBody(moduleDesc)
            let moduleCollider = world.createCollider(moduleColliderDesc, module.handle);
            modules.push(module);
            moduleGrab.push({grabbed:0,mouse:null});
        }
    }, 2000);
}

process.on('SIGTERM', () => {
    io.sockets.disconnect()
    process.exit(0)
})
