//initialize board array
var board = [];

var player = false;
var playerturn = true;

//as soon as we're ready, init the game/board
$(document).ready(function() {
  GameInit();
  if (playerturn == false) {
    ComputerTurn();
  }
});

//set the arrays to null and blank the tiles
function GameInit() {
  $("#choiceModal").modal("show");
  $("#choiceModal").on("shown.bs.modal", function() {
    $("#choiceModal").trigger("focus");
  });
  player = false;
  playerturn = true;

  for (let i = 0; i < 3; i++) {
    board[i] = new Array();
    for (let j = 0; j < 3; j++) {
      board[i][j] = null;
      let location = i + "," + j + "-cont";
      let tile = document.getElementById(location);
      tile.innerHTML = "";
    }
  }
  $("button").on("click", function() {
    var buttonVal = $(this).val();
    if (buttonVal == 1) {
      playerturn = true;
    } else {
      playerturn = false;
    }
    setTimeout(function() {
      if (playerturn == false) {
        //give the computer a turn
        ComputerTurn();
      }
    }, 10);
  });

  return;
}

function OnClick(location) {
  //split the location up in to two coordinate ints
  let coords = CoordSplit(location);
  //put a value in the place we just clicked
  let updated = UpdateBoard(coords);

  //if we have returned true it's a valid move
  if (updated == true) {
    MarkTile(coords); //put the marker in the selected tile
    EndTurn(coords); //clean up and swap turns
  } else {
    console.log("Invalid Move"); //if we didn't get true back, it's not valid
  }
}

function MarkTile(coords) {
  let icon = null;
  //put our coords together so we can mark the proper square
  let location = coords[0] + "," + coords[1];
  let tile = document.getElementById(location + "-cont");

  //what icon should we be using?
  if (player == true) {
    icon = "O";
  } else {
    icon = "X";
  }
  tile.innerHTML = icon;
  return;
}

//clean up and make sure the game isn't over
function EndTurn(lastPlaced) {
  let winstate = CheckWin(lastPlaced, player); //check if someone has won the game
  let tiestate = CheckTie(); //make sure we haven't tied
  player = !player; //swap the turn over
  playerturn = !playerturn; //swap the player turn off

  if (winstate == true || tiestate == true) {
    //if we've won or tied we want to alert and start over
    setTimeout(function() {
      alert("Game Over");
      GameInit();
      return;
    }, 30);
  }
  else{
     setTimeout(function() {
    if (playerturn == false) {
      //give the computer a turn
      ComputerTurn();
    }
  }, 10); 
  }
  return;
}

//make sure the location picked is empty and update that location if it is
function UpdateBoard(coords) {
  let row = coords[0];
  let col = coords[1];

  if (board[row][col] == null) {
    board[row][col] = player;
    return true;
  } else {
    return false;
  }
  return;
}

//if we find any null squares the game can go on, if not it's a tie
function CheckTie() {
  let tied = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == null) {
        tied = false;
      }
    }
  }
  return tied;
}

function CheckWin(coords, thisVal) {
  let gamewon = false;
  //the coords of the spot we just updated
  let row = coords[0];
  let col = coords[1];
  //placeholders, we'll calculate these as we go
  let lastrow = NaN;
  let lastcol = NaN;

  for (let i = row - 1; i <= row + 1; i++) {
    //loop through the squares around the updated square only if they are in range
    if (i >= 0 && i < 3) {
      for (let j = col - 1; j <= col + 1; j++) {
        //loop through the squares around the updated square only if they are in range
        if (j >= 0 && j < 3) {
          //if the square is equal to the value passed in (which turn we are checking a win for)
          if (!(i == row && j == col) && board[i][j] == thisVal) {
            //where we are now
            let thisRow = parseInt(row);
            let thisCol = parseInt(col);

            //one square further on the same vector as this square is from the original
            let nextrow = i + (i - thisRow);
            let nextcol = j + (j - thisCol);

            //one square backwards on the same vector as this square is from the original
            let lastrow = thisRow + (thisRow - i);
            let lastcol = thisCol + (thisCol - j);

            //make sure the next square is within range and check if it's the same value
            if (
              nextrow >= 0 &&
              nextrow < 3 &&
              nextcol >= 0 &&
              nextcol < 3 &&
              !(nextrow == row && nextcol == col) &&
              board[nextrow][nextcol] == thisVal
            ) {
              gamewon = true;
              return gamewon;
            } else if (
              lastrow >= 0 &&
              lastrow < 3 &&
              lastcol >= 0 &&
              nextcol < 3 &&
              !(lastrow == row && lastcol == col) &&
              board[lastrow][lastcol] == thisVal
            ) {
              //if the next in line isn't the same, maybe the one on the other side is, check that if it's in range
              gamewon = true;
              return gamewon;
            }
          }
        }
      }
    }
  }
  return;
}

//splits coordinate strings and puts them in an array that it returns
function CoordSplit(coords) {
  let splitCoords = [];
  let split = coords.split(",");

  splitCoords.push(split[0], split[1]);

  return splitCoords;
}

function ComputerTurn() {
  AIMoveFinder(function(coords) {
    OnClick(coords);
  });

  return;
}

function AIMoveFinder(callback) {
  let winFound = false;
  let blockFound = false;

  //let's track both of these possibilities for simplicity
  let placecoords = [];
  let blockcoords = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == null) {
        //if we haven't found a win or block check this square for both
        if (winFound == false && CheckWin([i, j], player) == true) {
          winFound = true;
          placecoords.push(i, j);
        } else if (
          (blockFound == false || winFound == false) &&
          CheckWin([i, j], !player) == true
        ) {
          blockFound = true;
          blockcoords.push(i, j);
        }
      }
    }
  }
  //if we found a win we want to make that our move
  if (winFound == true) {
    var loc = placecoords.join(",");
  }
  //if we didn't find a win but we found a blocking move let's do that
  if (winFound == false && blockFound == true) {
    var loc = blockcoords.join(",");
  }
  //if we haven't found any wining or blocking moves we want to pick a random square (we're a dumb bot)
  if (winFound == false && blockFound == false) {
    //if the center square is empty we want it, we're not that dumb
    if (board[1][1] == null) {
      placecoords.push(1, 1);
    } else {
      //let's get a random spot since the center isn't open
      let randSpot = RandomCoords();
      placecoords.push(randSpot[0], randSpot[1]);
    }
    //Whatever we have decided, let's make it happen
    var loc = placecoords.join(",");
  }
  return callback(loc);
}

//pick a random open spot
function RandomCoords() {
  {
    let choices = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        //if the square is empty, add it to the list of choices we have
        if (board[i][j] == null) {
          let possibleChoice = [i, j];
          choices.push(possibleChoice);
        }
      }
    }
    //pick one of the possible choices and send it back
    if (choices.length > 0) {
      let choice =
        choices[Math.floor(Math.random() * Math.floor(choices.length))];
      return choice;
    }
  }
}
