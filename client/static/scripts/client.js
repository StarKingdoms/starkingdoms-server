var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

function getParameterByName( name ){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if(results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	} }
let vid = "";

console.log("%cWelcome to StarKingdoms! Version: v0.3.1.2", "color:blue");

var username = getParameterByName('username');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

if(username == undefined || username == "" || username == " ") {
	username = "Unnamed";
}

function setServerMsg(msg) {
	document.getElementById("content").innerHTML = msg;
}

function util_gethost() {
	if (window.location.protocol.includes("file")) {
		return "http://localhost:8443";
	} else {
		return window.location.protocol + "//" + window.location.hostname + ":8443";
	}
}

setServerMsg("Connecting...");

socket = new WebSocket(util_gethost());
socket.emit("join", username);

socket.on('reconnecting', (tries) => {
	console.log("CONNECTION FAILED: " + tries + " failed connections so far");
	setServerMsg("Having trouble connecting to server.");
	if (tries == 3) {
		setServerMsg("Server offline, connection aborted");
		socket.disconnect();
	}
});

var players = {};
var player = {
	x: 0,
	y: 0,
	rotation: 90,
	velX: 0,
	velY: 0
};
var socketId;

var keys = {};
var usernames = {};
var planets = {};
var modules = [];
var mousePos = {
    x: 0,
    y: 0
};
var buttons = [];

const SCALE = 30;

function chatMsg(value) {
	socket.emit("message", value, username);
	console.log("%cSent chat message to server.", "color:green");
}

function mkInlineImg(src) {
	var img = new Image();
	img.src = src;

	img.style = `  
	display: inline-block;
	width: 250px;
	height: auto;
	vertical-align: top;
	border: 3px solid #888;
	border-radius: 5px;`;

	return img;
}

function checkForImgUrl(url) {
	return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

socket.on("disallowed_ban", function(message){
	setServerMsg("Connection failed: You have been banned from StarKingdoms. Reason: " + message);
	var id = window.setTimeout(function() {}, 0);

while (id--) {
    window.clearTimeout(id); // will do nothing if no timeout with id is present
}
});

socket.on("data", function(data){
	players = data.players.allPlayers,
	player.x = data.players.thisPlayer.x;
	player.y = data.players.thisPlayer.y;
	player.rotation = data.players.thisPlayer.rotation;
	player.username = data.players.usernames[socketId];
	player.velX = data.players.thisPlayer.velX;
	player.velY = data.players.thisPlayer.velY;
	usernames = data.players.usernames;
    planets = data.planets;
    modules = data.modules;
});

let chat = document.getElementById("chat");

socket.on("message", (text, username) => {
	if (checkForImgUrl(text)) {
		let img = mkInlineImg(text);
		chat.innerHTML += '<b>' + username + "</b>: ";
		chat.appendChild(img);
	} else {
		chat.innerHTML += marked.parse(`**${username}**: ${text}`);
		chat.scrollTop = chat.scrollHeight;
	}
	console.log("%cRevieved chat message from server.", "color:green");
});

socket.on("ready", (id) => {
	//clearTimeout(failConn);
	//clearTimeout(waitConn);
    socketId = id;
	setServerMsg("Connected!");
	setTimeout(function(){document.getElementById("srvmsg").style.display="hidden";},2000);
    draw();
});

var earth = new Image;
earth.src = "static/img/earth.png"

var moon = new Image;
moon.src = "static/img/moon.png"

var hearty = new Image;
hearty.src = "static/img/hearty.png"

var cargo = new Image;
cargo.src = "static/img/cargo.png"

var xPos = 0;
var yPos = 0;
var vel = 0;

var canvasStr = '0px 0px';

var newXPos = 0;
var newYPos = 0;
var newVel = 0;
var newCanvasStr = '0px 0px';

var rewritePos = false;
var rewriteVel = false;
var rewriteCanvasStr = false;

var position = document.getElementById("position");
var velocity = document.getElementById("velocity");

function recalculatePositioning() {
	rewritePos = false;
	rewriteVel = false;
	rewriteCanvasStr = false;
	var newXPos = Math.round(player.x / 50);
	var newYPos = Math.round(player.y / 50);
	var newVel = Math.round(Math.sqrt(player.velX * player.velX + player.velY * player.velY));

	var newCanvasStr = `${Math.trunc(-player.x / 10)}px ${Math.trunc(-player.y / 10)}px`;

	if (newXPos != xPos) {
		rewritePos = true;
		xPos = newXPos;
	}
	if (newYPos != yPos) {
		rewritePos = true;
		yPos = newYPos;
	}
	if (newVel != vel) {
		rewriteVel = true;
		vel = newVel;
	}
	if (rewritePos) {
		position.innerHTML = `Position: ${xPos}, ${yPos}`;
	}
	if (rewriteVel) {
		velocity.innerHTML = `Vel: ${vel}`;
	}
	canvas.style.backgroundPosition = newCanvasStr;
}

var camX = 0;
var camY = 0;

function draw() {
	let intervalId = setInterval(() => {

		recalculatePositioning();

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		camX = -player.x + canvas.width / 2
		camY = -player.y + canvas.height / 2
		ctx.translate(camX, camY);

		if (planets.earth == null) {
			return;
		}

		ctx.drawImage(earth, -1250 + planets.earth.x, -1250 + planets.earth.y, 2500, 2500)

		ctx.drawImage(moon, -300 + planets.moon.x, -300 + planets.moon.y, 600, 600);

		ctx.beginPath();
		ctx.strokeStyle = "gray";
		ctx.lineWidth = 5;
		ctx.moveTo(player.x, player.y);
		ctx.lineTo(planets.moon.x, planets.moon.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = "limegreen";
		ctx.lineWidth = 5;
		ctx.moveTo(player.x, player.y);
		ctx.lineTo(planets.earth.x, planets.earth.y)
		ctx.stroke();

		for(var key of Object.keys(players)) {
			ctx.save();
			ctx.translate(players[key].x,
                players[key].y);

			ctx.textAlign = "center";
			ctx.font = '30px Segoe UI';
			ctx.fillStyle = "white";
			ctx.fillText(usernames[key], 0, -35);

			ctx.rotate(players[key].rotation);
			ctx.drawImage(hearty, -25, -25, 50, 50);
			ctx.restore();
		}

		for(let i = 0; i < modules.length; i++) {
			ctx.save();
			ctx.translate(modules[i].x, modules[i].y)
			ctx.rotate(modules[i].rotation);
			ctx.drawImage(cargo, -25, -25, 50, 50) 
			ctx.restore();
		}
		socket.emit("input", keys, {
            x:mousePos.x + player.x - canvas.width / 2,
            y:mousePos.y + player.y - canvas.height / 2
        }, buttons);
	}, 1000/60);
}


document.onmousedown = (e) => {
    buttons = e.buttons
}
document.onmouseup = (e) => {
    buttons = e.buttons
}

document.onmousemove = (e) => {
    mousePos = {
        x: e.pageX,
        y: e.pageY 
    }
}

document.onkeydown = (e) => {
	if(document.activeElement != document.getElementById('msg')) {
		keys[e.key] = true
	}
}

document.onkeyup = (e) => {
	keys[e.key] = false;
};
