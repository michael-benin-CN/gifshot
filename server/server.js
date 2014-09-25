// server.js (Express 4.0)
var express = require('express'),
  app = express();

// SERVER CONFIGURATION
app.use(express.static(__dirname + '/../')); // set the static files location /public/img will be /img for users

app.listen(8001);

console.log('To preview gifshot, go to localhost:8001');