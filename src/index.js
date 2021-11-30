const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const core_server_util = require("./core_server_util.js");

let io = core_server_util.get_io();

io.sockets.on('connection', (socket) => {
    console.log(socket.id);
});
