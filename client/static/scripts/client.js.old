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
	}
}

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

setServerMsg("Connecting...");

var socket = io(window.location.protocol + "//" + window.location.host + ":8443");
const fpPromise = FingerprintJS.load({token: 'eY9P56O5Kymn7GZ7Fuyy', endpoint: 'https://auth.coresdev.ml'})

    // Get the visitor identifier when you need it.
    fpPromise
      .then(fp => fp.get())
      .then(result => {
        // This is the visitor identifier:
        vid = result.visitorId;
	socket.emit("join", username, vid);
        console.log("%cLogging in with fingerprint " + vid, "color: yellow");
      });

var failConn = setTimeout(function() {
        socket.disconnect();
	var id = window.setTimeout(function() {}, 0);

while (id--) {
    window.clearTimeout(id); // will do nothing if no timeout with id is present
}
	console.log("Connection aborted after 10 seconds");
	setServerMsg("Connection aborted: timeout");
}, 10000);

var waitConn = setTimeout(function() {
	socket.emit("join", username);
	setServerMsg("Having trouble connecting to server. Aborting in 8...");
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 7...");socket.emit("join", username, vid);},1000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 6...");socket.emit("join", username, vid);},2000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 5...");socket.emit("join", username, vid);},3000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 4...");socket.emit("join", username, vid);},4000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 3...");socket.emit("join", username, vid);},5000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 2...");socket.emit("join", username, vid);},6000);
	setTimeout(function(){setServerMsg("Having trouble connecting to server. Aborting in 1...");socket.emit("join", username, vid);},7000);
}, 2000);

var players = {};
var player = {
	x: 0,
	y: 0,
	rotation: 90,
	velX: 0,
	velY: 0
};

var keys = {};
var usernames = {};
var planets = {};
var modules = [];

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

socket.on("client-pos", function(msg, thisPlayer, usernamesInfo){
	players = msg;
	player.x = thisPlayer.x;
	player.y = thisPlayer.y;
	player.rotation = thisPlayer.rotation;
	player.username = thisPlayer.username;
	player.velX = thisPlayer.velX;
	player.velY = thisPlayer.velY;
	usernames = usernamesInfo;
});

socket.on("planet-pos", (planetInfo) => {
	planets = planetInfo;
})

socket.on("module-pos", (moduleInfo) => {
	modules = moduleInfo;
});

let chat = document.getElementById("chat");

socket.on("message", (text, username) => {
	if (checkForImgUrl(text)) {
		let img = mkInlineImg(text);
		chat.innerHTML += '<b>' + username + "</b>: ";
		chat.appendChild(img);
	} else {
		chat.innerHTML += marked(`**${username}**: ${text}`);
		chat.scrollTop = chat.scrollHeight;
	}
	console.log("%cRevieved chat message from server.", "color:green");
});

socket.on("ready", () => {
	clearTimeout(failConn);
	clearTimeout(waitConn);
	setServerMsg("Connected!");
	setTimeout(function(){document.getElementById("srvmsg").style.display="hidden";},2000);
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

function draw() {
	let intervalId = setInterval(() => {

		recalculatePositioning();

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var camX = -player.x + canvas.width / 2
		var camY = -player.y + canvas.height / 2
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
			ctx.translate(players[key].x, players[key].y);

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

		socket.emit("input", keys);
	}, 1000/60);
}

draw();

document.onkeydown = (e) => {
	if(document.activeElement != document.getElementById('msg')) {
		keys[e.key] = true
	}
};
document.onkeyup = (e) => {
	keys[e.key] = false;
};
