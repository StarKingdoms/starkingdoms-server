<!DOCTYPE html>
<html lang="en">
<head>
  <title>StarKingdoms.TK</title>
  <link rel="stylesheet" href="static/css/stylemain.css"></link>
  <link rel="favicon" href="static/img/favicon.ico"></link>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/socket.io-client@4.0.1/dist/socket.io.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-L7R4GMFST9"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-L7R4GMFST9');</script>
  <script src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs-pro@3/dist/fp.min.js"></script>
</head>
<body>
  <div id="chatbox">
    <div id="chat">
    </div>
    <input id="msg" type="text" onchange="chatMsg(this.value); this.value = '';"></input>
  </div>
	<div id="statusbar">
		<span id="position">
		</span>
		<span id="velocity">
		</span>
	</div>
	<div id="srvmsg">
		<span id="content">
		</span>
	</div>
  <canvas id="canvas"></canvas>
  <script src="static/scripts/client.js?t=<?php echo mktime();?>"></script>
</body>
</html>
