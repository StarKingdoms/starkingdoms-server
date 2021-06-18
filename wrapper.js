const fs = require('fs');
const spawn = require('child_process').spawn();

var writeHandle = fs.createWriteStream('./starkingdoms.log', {flags: 'w'});

var child = spawn('node', ['./index.js']);

child.stdout.pipe(writeHandle);
child.stderr.pipe(writeHandle);

child.on('close', (code) => {
  console.log("Child exited with code " + code);
  process.exit(0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
