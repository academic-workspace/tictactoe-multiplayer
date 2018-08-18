$(function() { 
    var socket = io();
    var room;
    var playing = false;
    var input = $("#login input");
    var turn = 'O';
    var tiles = [];
    var user;
    var votes = 0;
    var voted = false;
    var playerCount = 1;
    $("#login input").keyup(function(evt){
        if(evt.which == 13 && input.val().trim()){
            initGame();
            room = input.val().trim();
            socket.emit('join room', room);
        }
    });

    function setText(){
        $("#player").text(turn);
        let string = '';
        if(user == 'spectator'){
            string = turn+" is playing";
        } else if (turn == user){
            string = 'Your Turn';
        } else {
            string = 'Enemy is playing';
        }
        $("#result").text(string);
    }

    function changeTurn(){
        turn = (turn === 'O' ? 'X' : 'O');
        setText();
    }
    
    function setTurn(newTurn){
        turn = newTurn;
        setText();
    }

    function checkUsers(){
        if(playerCount.players == 1){
            $("#result").text("Waiting for an enemy");
        } else {
            setTurn(turn);
        }
        $("#status").text(user == 'spectator' ?  'You are a spectator' : 'You are player ' + user);

    }

    function isFree(tile){
        return tile.html() == '&nbsp;';
    }
    
    function tilePress(tile){
       tile.text(turn);
       if(checkLogic() == true){
           $("#result").text("Player " + turn + " wins!"); 
           $("#TicTacToe button").off();
           return true;
       } else if (checkLogic() == 'tie'){
           $("#result").text("The match was a tie!");
           $("#TicTacToe button").off();
           return true;
       }
       changeTurn();
    }

    function main(button){
        if(isFree(button) && turn == user && playerCount.players > 1){
            tilePress(button);
            socket.emit('move', {move: 'button', id: button.attr('id'), turn: turn});
        }
    }
    
    function resetGame(){
        $("#TicTacToe button").html("&nbsp;");
        $("#result").text("");
        initGame();
        setTurn('O');
        $("#TicTacToe button").on("click", tileClicked);
        voted = false;
        votes = 0;
        $("#votes").text(votes);
        checkUsers();
    }

    function addVote(){
        votes++;
        $("#votes").text(votes);
        voted = true;
    }

    function removeVote(){
        votes--;
        $("#votes").text(votes);
        voted = false;
    }

    $("#again").click(function(){
        socket.emit('move', {move: 'again'});
    });
    
    var tileClicked = function(){
        main($(this));
    }
    
    $("#TicTacToe button").click(tileClicked);
    
    function initGame(){
        var buttons = $("#TicTacToe button");
        tiles = [];
        while(buttons.length) tiles.push(buttons.splice(0,3));
        $("#TicTacToe").fadeIn();
        $("#stripe").fadeIn();
        $("#login").remove();
        checkUsers();
    }
    
    function checkLogic(){
        // Check rows and cols
        for(var i=0; i<tiles.length; i++){
            if(tiles[i][0].innerText == tiles[i][1].innerText && tiles[i][1].innerText == tiles[i][2].innerText && tiles[i][0].innerHTML != "&nbsp;"){
                return true;
            } 
           
            for(var j=0; j<tiles[i].length; j++){
                if(tiles[0][j].innerText == tiles[1][j].innerText && tiles[1][j].innerText == tiles[2][j].innerText && tiles[0][j].innerHTML != "&nbsp;"){
                    return true;
                } 
    
            } 
        }
    
        // Check diagonals
        if(tiles[0][0].innerText == tiles[1][1].innerText && tiles[1][1].innerText == tiles[2][2].innerText && tiles[1][1].innerHTML != "&nbsp;"){
            return true;
        } else if(tiles[2][0].innerText == tiles[1][1].innerText && tiles[1][1].innerText == tiles[0][2].innerText && tiles[1][1].innerHTML != "&nbsp;"){
            return true;
        } 
        
        if(checkIfFull()){
            return 'tie';
        }
    
        return false;
    }
    
    function checkIfFull(){
        for(var i=0; i<$("#TicTacToe button").length; i++){
            if($("#TicTacToe button")[i].innerHTML == "&nbsp;"){
                return false;
            }
        }
        return true;
    }

    function loadTable(table){
        for(var i=0; i<table.length; i++){
            $("#"+table[i][0]).text(table[i][1]);
            if(i == table.length-1){
                if(table[i][1] == 'O'){
                   setTurn('X'); 
                } else {
                   setTurn('O'); 
                }
            }
        }
    }
    
    socket.on('player move', function(move){
        var tilePressed = "#TicTacToe #" + move.id;
        tilePress($(tilePressed));
    });
    
    socket.on('player init', function(player){
        user = player.char;
    });

    socket.on('load table', function(data){
        loadTable(data);
    });

    socket.on('playAgain', function(){
        resetGame();
        socket.emit('reset table');
    });

    socket.on('voting', function(){
        if(!voted){
            addVote();
        }
    });

    socket.on('user connect', function(userCount){
        playerCount = userCount;
        $("#userCount").text(playerCount.players);
        checkUsers();
    });

    socket.on('user disconnect', function(userCount){
        playerCount = userCount;
        $("#userCount").text(playerCount.players);
        if(voted){
            removeVote();
        }
        checkUsers();
    });

    socket.on('disconnect', function(){
        var data = {
            room: room,
            char: user
        };
        socket.emit('disconnect', data);
    });
});
