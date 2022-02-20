/***********/
/* Imports */
/***********/
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const core_server_util = require("./core_server_util.js");
const util = require('./util.js');
const { modifyHub } = require('./modules.js');
const rapier = require('@c0repwn3r/rapier2d-node');
const { Logger } = require("./logging.js");

const STKVERSION = 'alpha-1.0.0';

/*
 * Logger setup
 */

logger = new Logger("ServerThread");
logger.info(`Welcome to StarKingdoms! Version ${STKVERSION}.`);

start_time = Date.now() / 1000;

logger.info('Initializing server io');
let io = core_server_util.get_io();
logger.info('Server is now listening for packets');

// start game code
logger.debug('Creating engine variables');
/*
 * Variable setup
 */
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
logger.info('Engine variables setup');

gameLoop();

logger.info('Started gameloop');

logger.debug('Creating callback functions');

function rotateVector(v, angle) {
    let newVector = { x: v.x*Math.cos(angle) - v.y*Math.sin(angle),
        y: v.x*Math.sin(angle) + v.y*Math.cos(angle)};
    return newVector;
}

function pressed_s(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyForce(rotateVector({x:0,y:100}, player.rotation()), false);
}
function pressed_w(socket) {
    let player = world.getRigidBody(players[socket.id].handle);
    player.wakeUp();
    player.applyForce(rotateVector({x:0.0,y:-100}, player.rotation()), false);
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
logger.info('Created callback functions')

io.sockets.on('connection', (socket) => {
    logger.info('Player connection recieved')
    plogger = new Logger('Player-' + socket.id)
    plogger.debug('Player-specific logger created')
    plogger.debug('Waiting for player join event')
    socket.on('join', (username) => {
        plogger.info('Join request with username ' + username);

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
        let mouse = world.createCollider(mouseDesc);
        plogger.debug('Created player object in world');

        mouse.module = 0
        mouse.button = 0
        players[socket.id] = player;
        mouses[socket.id] = mouse;
        players[socket.id].up = {exists:true,joint:null,hasModule:false};
        players[socket.id].down = {exists:true,joint:null,hasModule:false};
        players[socket.id].right = {exists:true,joint:null,hasModule:false};
        players[socket.id].left = {exists:true,joint:null,hasModule:false};

        usernames[socket.id] = username;
        plogger.debug('Player registered');

        plogger.info('PlayerJoinEvent finished for player ' + socket.id);
        socket.emit('ready', socket.id);
        plogger.debug('Sent ServerReady message');
    });
    socket.on('message', (text, username) => {
        plogger.info('PlayerChatMessage recieved: ' + username + ': ' + text);
        io.emit('message', text, username);
        plogger.debug('Broadcasted message');
    });
    socket.on('input', (keys, mouse={x:0,y:0},buttons) => {
        if (keys == undefined) return;
        if (keys.s===true) pressed_s(socket);
        if (keys.w===true) pressed_w(socket);
        if (keys.a===true) pressed_a(socket);
        if (keys.d===true) pressed_d(socket);
        if (mouses[socket.id] == undefined) return;
        mouses[socket.id].setTranslation({x:mouse.x/SCALE,y:mouse.y/SCALE})
        mouses[socket.id].module = mouses[socket.id].module
        mouses[socket.id].button = buttons;
    });
    socket.on('disconnect', () => {
        plogger.info('PlayerDisconnectevent triggered. Removing player...')
        io.emit('message', usernames[socket.id] + "left the game", "Server");
        plogger.debug('Sent player left chat message');
        if(players[socket.id] == null) {
            plogger.warn('Player already disconnected');
            return;
        }
        world.removeRigidBody(players[socket.id]);
        delete mouses[socket.id]
        delete mousePos[socket.id];
        delete players[socket.id];
        delete usernames[socket.id];
        plogger.info('PlayerDisconnectEvent finished for player');
        delete plogger;
    });
});
logger.info('Created main callback')

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
            world.intersectionsWith(mouses[key].handle, (collider_handle) => {
                handle = world.getCollider(collider_handle).parent()
                for(let i=0; i < modules.length; i++) {
                    if(handle === modules[i].handle && mouses[key].module == 0 &&
                        mouses[key].button == 1) {
                        modules[i].setDominanceGroup(-127);
                        moduleGrab[i].grabbed = 1;
                        moduleGrab[i].mouse = key;
                        mouses[key].module = 1;
                        if(players[key].down.joint != null) {
                            var joint = players[key].down.joint;
                            if(joint.bodyHandle2() === handle) {
                                world.removeJoint(joint, true);
                                players[key].down.joint = null;
                            }
                            modules[i].base.hasModule = false;
                            players[key].down.exists = true;
                        }
                        if(players[key].up.joint != null) {
                            var joint = players[key].up.joint;
                            if(joint.bodyHandle2() === handle) {
                                world.removeJoint(joint, true);
                                players[key].up.joint = null;
                            }
                            modules[i].base.hasModule = false;
                            players[key].up.exists = true;
                        }
                        if(players[key].right.joint != null) {
                            var joint = players[key].right.joint;
                            if(joint.bodyHandle2() === handle) {
                                world.removeJoint(joint, true);
                                players[key].right.joint = null;
                            }
                            modules[i].base.hasModule = false;
                            players[key].right.exists = true;
                        }
                        if(players[key].left.joint != null) {
                            var joint = players[key].left.joint;
                            if(joint.bodyHandle2() === handle) {
                                world.removeJoint(joint, true);
                                players[key].left.joint = null;
                            }
                            modules[i].base.hasModule = false;
                            players[key].left.exists = true;
                        }
                        return false;
                    }
                }
                return true;
            });
            if(mouses[key].button == 0) {
                mouses[key].module = 0;
                for(let i=0; i < modules.length; i++) {
                    if(moduleGrab[i].mouse == key) {
                        modules[i].setDominanceGroup(0);
                        modules[i].wakeUp();
                        modules[i].setLinvel({x:0,y:0}, true);
                        modules[i].setAngvel(0, true);
                        moduleGrab[i].grabbed = 0;
                        moduleGrab[i].mouse = 0;
                        if(players[key].down.hasModule) {
                            let params = rapier.JointParams.fixed({x:0,y:50/SCALE},
                                0, {x:0,y:0},Math.PI);
                            let joint = world.createJoint(params,
                                players[key],modules[i]);
                            players[key].down.joint = joint;
                            players[key].down.exists = false;
                            modules[i].base.hasModule = true;
                        }
                        if(players[key].up.hasModule) {
                            let params = rapier.JointParams.fixed({x:0,y:-50/SCALE},
                                0, {x:0,y:0},0);
                            let joint = world.createJoint(params,
                                players[key],modules[i]);
                            players[key].up.joint = joint;
                            players[key].up.exists = false;
                            modules[i].base.hasModule = true;
                        }
                        if(players[key].right.hasModule) {
                            let params = rapier.JointParams.fixed({x:50/SCALE,y:0},
                                0, {x:0,y:0},-Math.PI/2);
                            let joint = world.createJoint(params,
                                players[key],modules[i]);
                            players[key].right.joint = joint;
                            players[key].right.exists = false;
                            modules[i].base.hasModule = true;
                        }
                        if(players[key].left.hasModule) {
                            let params = rapier.JointParams.fixed({x:-50/SCALE,y:0},
                                0, {x:0,y:0},Math.PI/2);
                            let joint = world.createJoint(params,
                                players[key],modules[i]);
                            players[key].left.joint = joint;
                            players[key].left.exists = false;
                            modules[i].base.hasModule = true;
                        }
                        for(let j = 0; j < modules.length; j++) {
                            console.log(modules[i].left.hasModule);
                            if(modules[i].left.hasModule){
                                console.log("bloop");
                                if(modules[j].shouldAttach == key) {
                                let params = rapier.JointParams.fixed({x:-50/SCALE,y:0},
                                    0, {x:0,y:0},Math.PI/2);
                                let joint = world.createJoint(params,
                                    modules[i],modules[j]);
                                modules[i].left.joint = joint;
                                modules[i].left.exists = false;
                                modules[j].base.hasModule = true;
                                }
                            }
                        }
                    }
                }
            }
        }


        for(let key of Object.keys(players)) {
            for(let i = 0; i < modules.length; i++) {
                if(moduleGrab[i].grabbed == true) {
                    let verified = false;
                    if(players[key].down.joint == null) {
                        let downVector = {x: 0, y: 25 / SCALE};
                        let mouseVector = {
                            x: mouses[key].translation().x - players[key].translation().x,
                            y: mouses[key].translation().y - players[key].translation().y,
                        };
                        mouseVector = rotateVector(mouseVector, -players[key].rotation());
                        let downDist = Math.abs(mouseVector.x-downVector.x)+Math.abs(mouseVector.y-downVector.y);
                        if(downDist < 2) {
                            let position = {x: 0, y: 50 / SCALE};
                            position = rotateVector(position, players[key].rotation());
                            position = {
                                x: position.x + players[key].translation().x,
                                y: position.y + players[key].translation().y
                            };
                            modules[i].setTranslation(position);
                            modules[i].setRotation(players[key].rotation() + Math.PI);
                            players[key].down.hasModule = true;
                            players[key].right.hasModule = false;
                            players[key].up.hasModule = false;
                            players[key].left.hasModule = false;
                            verified = true;
                        }
                    }
                    if(players[key].right.joint == null) {
                        let rightVector = {x: 25 / SCALE, y: 0};
                        let mouseVector = {
                            x: mouses[key].translation().x - players[key].translation().x,
                            y: mouses[key].translation().y - players[key].translation().y,
                        };
                        mouseVector = rotateVector(mouseVector, -players[key].rotation());
                        let rightDist = Math.abs(mouseVector.x-rightVector.x)+Math.abs(mouseVector.y-rightVector.y);
                        if(rightDist < 2) {
                            let position = {x: 50 / SCALE, y: 0};
                            position = rotateVector(position, players[key].rotation());
                            position = {
                                x: position.x + players[key].translation().x,
                                y: position.y + players[key].translation().y
                            };
                            modules[i].setTranslation(position);
                            modules[i].setRotation(players[key].rotation() + Math.PI / 2);
                            players[key].down.hasModule = false;
                            players[key].right.hasModule = true;
                            players[key].up.hasModule = false;
                            players[key].left.hasModule = false;
                            verified = true;
                        }
                    }
                    if(players[key].left.joint == null) {
                        let leftVector = {x: -25 / SCALE, y: 0};
                        let mouseVector = {
                            x: mouses[key].translation().x - players[key].translation().x,
                            y: mouses[key].translation().y - players[key].translation().y,
                        };
                        mouseVector = rotateVector(mouseVector, -players[key].rotation());
                        let leftDist = Math.abs(mouseVector.x-leftVector.x)+Math.abs(mouseVector.y-leftVector.y);
                        if(leftDist < 2) {
                            let position = {x: -50 / SCALE, y: 0};
                            position = rotateVector(position, players[key].rotation());
                            position = {
                                x: position.x + players[key].translation().x,
                                y: position.y + players[key].translation().y
                            };
                            modules[i].setTranslation(position);
                            modules[i].setRotation(players[key].rotation() - Math.PI / 2);
                            players[key].down.hasModule = false;
                            players[key].right.hasModule = false;
                            players[key].up.hasModule = false;
                            players[key].left.hasModule = true;
                            verified = true;
                        }
                    }
                    if(players[key].up.joint == null) {
                        let upVector = {x: 0, y: -25 / SCALE};
                        let mouseVector = {
                            x: mouses[key].translation().x - players[key].translation().x,
                            y: mouses[key].translation().y - players[key].translation().y,
                        };
                        mouseVector = rotateVector(mouseVector, -players[key].rotation());
                        let upDist = Math.abs(mouseVector.x-upVector.x)+Math.abs(mouseVector.y-upVector.y);
                        if(upDist < 2) {
                            let position = {x: 0, y: -50 / SCALE};
                            position = rotateVector(position, players[key].rotation());
                            position = {
                                x: position.x + players[key].translation().x,
                                y: position.y + players[key].translation().y
                            };
                            modules[i].setTranslation(position);
                            modules[i].setRotation(players[key].rotation());
                            players[key].down.hasModule = false;
                            players[key].right.hasModule = false;
                            players[key].up.hasModule = true;
                            players[key].left.hasModule = false;
                            verified = true;
                        }
                    }
                    if(verified == false) {
                        players[key].down.hasModule = false;
                        players[key].right.hasModule = false;
                        players[key].up.hasModule = false;
                        players[key].left.hasModule = false;
                    }
                }
                for(let j = 0; j < modules.length; j++) {
                    if(moduleGrab[j].grabbed) {
                        let verified = false;
                        if(modules[i].right.joint == null && i != j && modules[i].base.hasModule) {
                            let downVector = {x: 25 / SCALE, y: 0};
                            let mouseVector = {
                                x: mouses[key].translation().x - modules[i].translation().x,
                                y: mouses[key].translation().y - modules[i].translation().y,
                            };
                            mouseVector = rotateVector(mouseVector, -modules[i].rotation());
                            let downDist = Math.abs(mouseVector.x-downVector.x)+Math.abs(mouseVector.y-downVector.y);
                            if(downDist < 2) {
                                let position = {x: 50 / SCALE, y: 0};
                                position = rotateVector(position, modules[i].rotation());
                                position = {
                                    x: position.x + modules[i].translation().x,
                                    y: position.y + modules[i].translation().y
                                };
                                modules[j].setTranslation(position);
                                modules[j].setRotation(modules[i].rotation() + Math.PI / 2);
                                modules[i].right.hasModule = true;
                                if(modules[i].down.exists) {
                                    modules[i].down.hasModule = false;
                                }
                                if(modules[i].left.exists) {
                                    modules[i].left.hasModule = false;
                                }
                                modules[j].shouldAttach = key;
                                verified = true;
                            }
                        }
                        if(modules[i].left.joint == null && i != j && modules[i].base.hasModule) {
                            let downVector = {x: -25 / SCALE, y: 0};
                            let mouseVector = {
                                x: mouses[key].translation().x - modules[i].translation().x,
                                y: mouses[key].translation().y - modules[i].translation().y,
                            };
                            mouseVector = rotateVector(mouseVector, -modules[i].rotation());
                            let downDist = Math.abs(mouseVector.x-downVector.x)+Math.abs(mouseVector.y-downVector.y);
                            if(downDist < 2) {
                                let position = {x: -50 / SCALE, y: 0};
                                position = rotateVector(position, modules[i].rotation());
                                position = {
                                    x: position.x + modules[i].translation().x,
                                    y: position.y + modules[i].translation().y
                                };
                                modules[j].setTranslation(position);
                                modules[j].setRotation(modules[i].rotation() - Math.PI / 2);
                                if(modules[i].right.exists) {
                                    modules[i].right.hasModule = false;
                                }
                                if(modules[i].down.exists) {
                                    modules[i].down.hasModule = false;
                                }
                                modules[i].left.hasModule = true;
                                modules[j].shouldAttach = key;
                                verified = true;
                            }
                        }
                        if(modules[i].down.joint == null && i != j && modules[i].base.hasModule) {
                            let downVector = {x: 0, y: -25 / SCALE};
                            let mouseVector = {
                                x: mouses[key].translation().x - modules[i].translation().x,
                                y: mouses[key].translation().y - modules[i].translation().y,
                            };
                            mouseVector = rotateVector(mouseVector, -modules[i].rotation());
                            let downDist = Math.abs(mouseVector.x-downVector.x)+Math.abs(mouseVector.y-downVector.y);
                            if(downDist < 2) {
                                let position = {x: 0, y: -50 / SCALE};
                                position = rotateVector(position, modules[i].rotation());
                                position = {
                                    x: position.x + modules[i].translation().x,
                                    y: position.y + modules[i].translation().y
                                };
                                modules[j].setTranslation(position);
                                modules[j].setRotation(modules[i].rotation());
                                if(modules[i].right.exists) {
                                    modules[i].right.hasModule = false;
                                }
                                modules[i].down.hasModule = true;
                                if(modules[i].left.exists) {
                                    modules[i].left.hasModule = false;
                                }
                                modules[j].shouldAttach = key;
                                verified = true;
                            }
                        }
                        if(verified == false) {
                            modules[i].down.hasModule = false;
                            modules[i].right.hasModule = false;
                            modules[i].left.hasModule = false;
                            modules[j].shouldAttach = null;
                        }
                        console.log(modules[i].left.hasModule);
                    }
                }
            }
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
                    x: mouses[moduleGrab[i].mouse].translation().x,
                    y: mouses[moduleGrab[i].mouse].translation().y
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
                mass: modules[i].mass * SCALE,
                type: modules[i].type
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

            var gameFrame = {
                planets: planets,
                players: {
                    thisPlayer: playerVitals[key],
                    allPlayers: playerVitals,
                    usernames: usernames
                },
                modules: moduleVitals
            };
            io.to(key).emit('data', gameFrame);
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
            module = modifyHub(module);
            modules.push(module);
            moduleGrab.push({grabbed:0,mouse:null});
        }
    }, 2000);
}

logger.info('Server fully online and ready for players');
ready_time = Date.now() / 1000
logger.info(`Server startup completed in ${ready_time - start_time} seconds`);

process.on('SIGTERM', () => {
    logger.info('Recieved SIGTERM, gracefully exiting...');
    io.sockets.disconnect();
    logger.debug('Sent all players disconnect');
    process.exit(0);
})
