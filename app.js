var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("view engine", "ejs");
app.use(express.static("public"));

var players = [];
var votes = [];
var roomList = [];
var roomTable = [];

function selectChar(room){
    if(players.length != 0){
        for(var i=0; i<players.length; i++){
            if(players[i].room == room){
                if(players[i].char == 'O'){
                    console.log('X');
                    return 'X';
                } else {
                    console.log('O');
                    return 'O';
                }
            }
        }
    }
    console.log('O');
    return 'O'; 
}

function playerCount(room){
    let count = 0;
    if(players.length != 0){
        for(var i=0; i<players.length; i++){
            if(players[i].room == room){
                count++;
            }
        }
    }
    return count;
}

app.get("/", function(req, res){
    res.render("index");
});

io.on('connection', function(socket){
    function makeVote(){
        var vote = {
           room: socket.player.room,
           char: socket.player.char,        
        };
        votes.push(vote);
    }
    
    function playAgain(){
        if(votes.length != 0){
            for(var i=0; i<votes.length; i++){
                if(votes[i].room == socket.player.room){
                    if(votes[i].char != socket.player.char){
                        makeVote();
                        return true;
                    }
                }
            }
            return false;
        } else if(playerCount(socket.player.room) === 1){
            makeVote();
            return true;
        } else {
            makeVote();
        }
        return false;
    }
    console.log(roomTable);    

    socket.on('join room', function(room){

        socket.join(room, () => {
            let rooms = Object.keys(socket.rooms);
            if(roomList.includes(rooms[1]) == false){
                roomTable[rooms[1]] = [];
                roomList.push(rooms[1]);
            }
            let player = {
                room: rooms[1],
                char: selectChar(rooms[1]),
            };
            socket.player = player;
            players.push(player);
            socket.emit('player init', socket.player);
            if(roomTable[room].length != 0){
                socket.emit('load table', roomTable[room]);
            }
            io.to(socket.player.room).emit('user connect', playerCount(socket.player.room));
        });
    });

    socket.on('reset table', function(){
        roomTable[socket.player.room] = [];
    });
    socket.on('disconnect', function(){
        if(socket.player){
            players = players.filter(function(player){
                return socket.player != player;
            });
            io.to(socket.player.room).emit('user disconnect', playerCount(socket.player.room));
        }
    });

    socket.on('move', function(move){
        let room = Object.keys(socket.rooms)[1];
        switch(move.move){
            case 'again':
                if(playAgain()){
                    io.in(room).emit('playAgain');
                    votes = [];
                } else {
                    io.in(room).emit('voting');
                }
                break;
            case 'button':
                socket.in(room).broadcast.emit('player move', move);
                roomTable[room].push(move.id+socket.player.char);
                console.log(roomTable);
                break;
        } 
    });
});

http.listen(3000, function () {
	console.log("Server started on *:3000");
});
