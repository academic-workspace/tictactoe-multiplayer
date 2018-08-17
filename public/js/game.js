var turn = 'O';
var tiles = [];

initTable();

function changeTurn(){
    turn = (turn === 'O' ? 'X' : 'O');
    $("#player").text(turn);
}

function isFree(tile){
    return tile.html() == '&nbsp;';
}

function main(button){
    if(isFree(button)){
        button.text(turn);
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
}

$("#again").click(function(){
    turn = 'O';
    $("#TicTacToe button").html("&nbsp;");
    $("#result").text("");
    initTable();
    $("#TicTacToe button").on("click", tileClicked);
});

var tileClicked = function(){
    main($(this));
}

$("#TicTacToe button").click(tileClicked);

function initTable(){
    var buttons = $("#TicTacToe button");
    tiles = [];
    while(buttons.length) tiles.push(buttons.splice(0,3));
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
