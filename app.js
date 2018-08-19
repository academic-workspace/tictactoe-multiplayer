var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const path = require('path')
const PORT = process.env.PORT || 5000

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
                if(playerCount(room).players < 2){
                    if(players[i].char == 'O'){
                        return 'X';
                    } else {
                        return 'O';
                    }
                } else {
                    return 'spectator';
                }
            }
        }
    }
    return 'O'; 
}

function playerCount(room){
    let playingCount = 0;
    let spectatorCount = 0;
    if(players.length != 0){
        for(var i=0; i<players.length; i++){
            if(players[i].room == room){
                if(players[i].char == 'spectator'){
                    spectatorCount++;
                } else {
                    playingCount++;
                }
            }
        }
    }
    return {
        players: playingCount,
        spectators: spectatorCount
    };
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
        } else if(playerCount(socket.player.room).players === 1){
            makeVote();
            return true;
        } else {
            makeVote();
        }
        return false;
    }

    socket.on('join room', function(room){

        socket.join(room, () => {
            if(roomList.includes(room) == false){
                roomTable[room] = [];
                roomList.push(room);
            }
            let player = {
                room: room,
                char: selectChar(room),
            };
            socket.player = player;
            players.push(player);
            socket.emit('player init', socket.player);
            if(roomTable[room].length != 0){ 
                socket.emit('load table', roomTable[room]);
            }
            io.to(socket.player.room).emit('user connect', playerCount(socket.player.room));
            console.log('\n              ROOM LIST');
            console.log('--------------------------------------');
            for(var i=0; i<roomList.length; i++){
                console.log('Room: ' + roomList[i] + ' , Players: ' + playerCount(roomList[i]).players + ' , Spectators: ' + playerCount(roomList[i]).spectators);
            }
        });
    });

    socket.on('reset table', function(){
        roomTable[socket.player.room] = [];
    });
    socket.on('disconnect', function(){
        if(socket.player){
            let playerRoom = socket.player.room;
            players = players.filter(function(player){
                return socket.player != player;
            });
            io.to(socket.player.room).emit('user disconnect', playerCount(socket.player.room));
            if(playerCount(playerRoom).players == 0 && playerCount(playerRoom).spectators == 0){
                roomList = roomList.filter(function(room){
                    return socket.player.room != room;
                });
            }
        }
    });

    socket.on('move', function(move){
        let room = socket.player.room;
        switch(move.move){
            case 'again':
                if(socket.player.char != 'spectator'){
                    if(playAgain()){
                        io.in(room).emit('playAgain');
                        votes = [];
                    } else {
                        io.in(room).emit('voting');
                    }
                }
                break;
            case 'button':
                socket.in(room).broadcast.emit('player move', move);
                roomTable[room].push(move.id+socket.player.char);
                break;
        } 
    });
});

http.listen(PORT, function () {
	console.log(`Server started on ${ PORT }`);
});
