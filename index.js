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

tick();

const SCALE = 30;
let world;

world = planck.World({
  gravity: planck.Vec2(0, 0)
});

let earthBody = world.createBody({
  position: planck.Vec2(0 / SCALE, 0 / SCALE)
})
let earthCircle = planck.Circle(100 / SCALE);
earthBody.createFixture(earthCircle, 0.0);

io.on('connection', (socket) => {
  console.log('Someone connected');

  let body = world.createBody({
    type: "dynamic",
    position: planck.Vec2(100 / SCALE, 100 / SCALE),
    linearDamping: 0.5
  });
  let boxBox = planck.Box(10.0 / SCALE, 10.0 / SCALE);
  let fixtureDef = {
    shape: boxBox,
    density: 1.0,
    friction: 0.3,
    restitution: 0.8
  }
  body.createFixture(fixtureDef);
  players[socket.id] = body;

  socket.on('disconnect', () => {
    console.log('Someone disconnected');
    delete players[socket.id]
  });
  socket.on('message', (text, username) => {
    io.emit('message', text, username);
  })
  socket.on('input', (keys) => {
    if(keys.a){
      players[socket.id].applyForceToCenter(planck.Vec2(-20 / SCALE, 0), true)
    }
    if(keys.d){
      players[socket.id].applyForceToCenter(planck.Vec2(20 / SCALE, 0), true)
    }
    if(keys.w){
      players[socket.id].applyForceToCenter(planck.Vec2(0, -20 / SCALE), true)
    }
    if(keys.s){
      players[socket.id].applyForceToCenter(planck.Vec2(0, 20 / SCALE), true)
    }
  })
})

function tick() {
  const intervalId = setInterval(() => {
    world.step(1/30, 10, 10);
    let playerVitals = {};
    for(let key of Object.keys(players)) {
      playerVitals[key] = {
        x: players[key].getPosition().x * SCALE,
        y: players[key].getPosition().y * SCALE,
        rotation: players[key].getAngle()
      }
    }
    for(let key of Object.keys(playerVitals)) {
      io.to(key).emit('client-pos', playerVitals, playerVitals[key]);
    }
  }, 1000 / 60)
}

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(3000, () => {
  console.log("Server Started on 3000")
})