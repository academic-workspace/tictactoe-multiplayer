var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("index");
});

io.on('connection', function(socket){
    console.log("User connected");    
});

http.listen(3000, function () {
	console.log("Server started on *:3000");
});
