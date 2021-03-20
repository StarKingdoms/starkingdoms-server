var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.onresize = function() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

var socket = io()

var username = prompt('Username:')

var players = {};
var player = {
  x: 0,
  y: 0,
  rotation: 0
};
var keys = {};
const SCALE = 30;

function chatMsg(value) {
  socket.emit("message", value, username);
}

socket.on("client-pos", function(msg, thisPlayer){
  players = msg;
  player.x = thisPlayer.x;
  player.y = thisPlayer.y;
  player.rotation = thisPlayer.rotation;
});

let chat = document.getElementById("chat");
socket.on("message", (text, username) => {
  chat.innerHTML += username + ": " + text + '<br>';
});

function draw() {
  requestAnimationFrame(draw);

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.fillStyle = '#FFF';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var camX = -player.x + canvas.width/2;
  var camY = -player.y + canvas.height/2;


  ctx.translate(camX, camY);

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, 2 * Math.PI);
  ctx.fill();

  for(var key of Object.keys(players)) {
    ctx.save()
    ctx.translate(players[key].x, players[key].y)
    ctx.rotate(players[key].rotation)
    ctx.fillRect(-10, -10, 20, 20);
    ctx.restore()
  }
  socket.emit('input', keys)
}
requestAnimationFrame(draw);

document.onkeydown = (e) => {
  if(document.activeElement != document.getElementById('msg')) {
    keys[e.key] = true
  }
};
document.onkeyup = (e) => {
  keys[e.key] = false;
};