let screenWidth = 1024;
let screenHeight = 768;
let totalSquares = 2;
let maxSquareSize = 60;
let minSquareSize = 40;
let speedLimit = 3;

let virusMode = true;
let battleMode = false;
let asteriodsMode = false;

// Virus Mode Options
let virusDuration = 3000; // Seconds
let chanceOfDeath = 5;   // 1 in X

let squares = [];
let colors = ["blue", "green", "orange", "purple", "black", "cyan", "grey", "teal", "violet", "pink",
"coral", "chartreuse", "darkgreen", "goldenrod", "khaki", "magenta", "olive", "rebeccapurple", "yellow", "maroon"];

let virusIsAlive = false;
if(virusMode) {
    screenWidth = 1024;
    screenHeight = 768; 
    let virusButton = document.getElementById("infect");
    virusButton.style.display = "block";
    var buttonMargin = (screenWidth / 2) - 75;
    var bm = buttonMargin.toString() + "px";
    virusButton.style.marginLeft = bm; 
    totalSquares = 100;
    minSquareSize = 10;
    maxSquareSize = 25;  
    speedLimit = 7;
}

if(asteriodsMode){
    maxSquareSize = 100;
    totalSquares = 4;
}


/*--------------------------------------------------------------------------------------------*/

function startGame() {
    generateSquares();
    myGameArea.start();
}

/*--------------------------------------------------------------------------------------------*/

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(runGameLoop, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/*--------------------------------------------------------------------------------------------*/

function runGameLoop() {
    myGameArea.clear();
    animateSquares();
    setWallReactionType();
    scanForAllowableCollisions();
    removeDeadSquares();
}

/*--------------------------------------------------------------------------------------------*/

function square(id, width, height, color, x, y) {
    this.id = id;
    this.isStillOverlapping = false;
    this.isVirus = false;
    this.isDead = false;
    this.color = color;
    this.width = width;
    this.height = height;
    this.mass = width % 3;
    this.speedX = generateRandomNumber(speedLimit);
    this.speedY = generateRandomNumber(speedLimit);
    this.x = x;
    this.y = y;   
    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }    
}

/*--------------------------------------------------------------------------------------------*/

function generateSquares() {
    let squareWidth, screenXPos, screenYPos;
    for(let i = 0; i < totalSquares; i++) {
        screenYPos = generateRandomUnsignedNumber(screenHeight - 50);
        squareWidth = generateRandomUnsignedNumber(maxSquareSize);
        screenXPos = generateRandomUnsignedNumber(screenWidth - 50);
        squares.push(new square(i, squareWidth + minSquareSize, squareWidth + minSquareSize, colors[generateRandomUnsignedNumber(colors.length - 1)], screenXPos, screenYPos));
        squares[0].isVirus = true;
    }
}

/*--------------------------------------------------------------------------------------------*/

function animateSquares() {
    for(let i = 0; i < squares.length; i++) {
        squares[i].newPos();
        squares[i].update()    
    }
}

/*--------------------------------------------------------------------------------------------*/

function setWallReactionType() {
    for(let i = 0, j = 1; i < squares.length; i += 2, j += 2) {
        wallBounce(squares[i]);
    }
    
    for(let i = 1; i < squares.length; i += 2) {
        wallPhase(squares[i]);
    }    
}

/*--------------------------------------------------------------------------------------------*/

function printSquareData(square) {
    console.log(square.width + ": {" + square.x + ", " + square.y + "}");
}

/*--------------------------------------------------------------------------------------------*/

function wallPhase(square) {
    if(square.x > myGameArea.canvas.width)
    square.x = -square.width;
    
    if(square.x < 0 - square.width - 1)
    square.x = myGameArea.canvas.width;        
    
    if(square.y > myGameArea.canvas.height)
    square.y = -square.height;
    
    if(square.y < 0 - square.height - 1)
    square.y = myGameArea.canvas.height;   
}

/*--------------------------------------------------------------------------------------------*/

function wallBounce(square) {
    if(square.x > myGameArea.canvas.width - square.width) {
        while(square.x > myGameArea.canvas.width - square.width) {
            square.x -= 3;
        }
        square.speedX = -square.speedX;
    }
    
    if(square.x < 0) {
        while(square.x < 0) {
            square.x += 3;
        }        
        square.speedX = -square.speedX;        
    }
    
    if(square.y > myGameArea.canvas.height - square.width) {
        while(square.y > myGameArea.canvas.height - square.width) {
            square.y -= 3;
        }          
        square.speedY = -square.speedY;
    }
    
    if(square.y < 0) {
        while(square.y < 0) {
            square.y += 3;
        }
        square.speedY = -square.speedY;
    }
}

/*--------------------------------------------------------------------------------------------*/

function detectOverlap(square1, square2) {
    let centerx1 = square1.x + (square1.width / 2);
    let centerx2 = square2.x + (square2.width / 2);
    
    let centery1 = square1.y + (square1.height / 2);
    let centery2 = square2.y + (square2.height / 2);
    
    let xCol = Math.abs(centerx1 - centerx2) < ((square1.width / 2) + (square2.width / 2));
    let yCol = Math.abs(centery1 - centery2) < ((square1.height / 2) + (square2.height / 2));
    
    return xCol && yCol;
}

/*--------------------------------------------------------------------------------------------*/

function exchangeTrajectories(square1, square2) {
    
    let xCenterSq1 = square1.x + (square1.width / 2);
    let xCenterSq2 = square2.x + (square2.width / 2);
    
    let yCenterSq1 = square1.y + (square1.height / 2);
    let yCenterSq2 = square2.y + (square2.height / 2);
    
    let distanceXCtr = Math.abs(xCenterSq1 - xCenterSq2);
    let distanceYCtr = Math.abs(yCenterSq1 - yCenterSq2);
    
    let topOrBottom = distanceXCtr <= distanceYCtr;
    let leftOrRight = distanceXCtr > distanceYCtr;
    
    let sq1XDirection = Math.sign(square1.speedX);
    let sq1YDirection = Math.sign(square1.speedY);
    let sq2XDirection = Math.sign(square2.speedX);
    let sq2YDirection = Math.sign(square2.speedY);
    
    if(topOrBottom) {
        let y = square1.speedY; + (Math.sign(square1.speedY) * 1);
        square1.speedY = square2.speedY;
        square2.speedY = y;
    } 
    else if(leftOrRight) {
        let x = square1.speedX;
        square1.speedX = square2.speedX;
        square2.speedX = x;
    }
    else {
        square1.color = "red";
        square2.color = "red";
    }
}

/*--------------------------------------------------------------------------------------------*/

function scanForAllowableCollisions() {
    let x = false;
    for(let i = 1; i < squares.length; i++) {
        for(let j = 0; j < i; j++) {
            if(detectOverlap(squares[i], squares[j])) {
                if(!(squares[i].isStillOverlapping && squares[j].isStillOverlapping)) {
                    squares[i].isStillOverlapping = true;
                    squares[j].isStillOverlapping = true;
                    performSquareCollision(squares[i], squares[j]);
                }
            }
        }
        resetOverlapping(squares[i]);
    }
}

/*--------------------------------------------------------------------------------------------*/

function resetOverlapping(square) {
    for(let i = 0; i < squares.length - 1; i++) {
        if(square == squares[i]) 
        continue;
        
        if(detectOverlap(square, squares[i])) {
            return;
        }
    }
    square.isStillOverlapping = false;
}

/*--------------------------------------------------------------------------------------------*/

function removeDeadSquares() {
    for(let i = squares.length - 1; i >= 0; i--) {
        if(squares[i].isDead) {
            squareDied(squares[i]);
        }
    }
}

/*--------------------------------------------------------------------------------------------*/

function generateRandomUnsignedNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

/*--------------------------------------------------------------------------------------------*/

function generateRandomNumber(max) {
    return generateRandomUnsignedNumber(max) - generateRandomUnsignedNumber(max);
}

/*--------------------------------------------------------------------------------------------*/

function performSquareCollision(square1, square2) {
    
    exchangeTrajectories(square1, square2);
    
    if(virusMode) if(virusIsAlive) setVirusMode(square1, square2);
    if(battleMode) setBattleMode(square1, square2);
    if(asteriodsMode) setAsteroidsMode(square1, square2);
}

/*--------------------------------------------------------------------------------------------*/
// Something is wrong will killing squares. Squares seem to die at random when there is
// a collision. It is almost like the wrong index is being referenced when killing them.
function setAsteroidsMode(square1, square2) {

    if(square1.width > 5) {
        breakAppart(square1);
    }
        
    if(square2.width > 20) {
        breakAppart(square2);
    }

    square1.isDead = true;
    square2.isDead = true;
}

/*--------------------------------------------------------------------------------------------*/

function breakAppart(sq) {

    let w = Math.floor(sq.width * 0.7);
    let col = sq.color;
    let x = sq.x;
    let y = sq.y;
    let newAsteriods = 2;
    let xDir = Math.sign(sq.speedX);
    let yDir = Math.sign(sq.speedY);

    while (newAsteriods--) {
        squares.push(new square(squares.length, w, w, col, x, y));
        squares[squares.length - 1].speedX = generateRandomNumber(4);
        squares[squares.length - 1].speedY = generateRandomNumber(4);
        squares[squares.length - 1].isStillOverlapping = true;
    }
}

/*--------------------------------------------------------------------------------------------*/

function spawnVirus() {
    squares[0].isVirus = true;
    squares[0].color = "red";
    virusIsAlive = true;
    infectionResult(squares[0]);
}

/*--------------------------------------------------------------------------------------------*/

function setVirusMode(square1, square2) {

    if(square1.isVirus && square2.isVirus) {}
    else if(square2.isVirus) {
        square1.isVirus = true;
        square1.color = square2.color;                
        infectionResult(square1);
    }
    else if(square1.isVirus) {
        square2.isVirus = true;
        square2.color = square1.color;
        infectionResult(square2);
    }
}

/*--------------------------------------------------------------------------------------------*/

function infectionResult(square) {
    setTimeout(function() {
        let x = generateRandomUnsignedNumber(chanceOfDeath);
        if(x == chanceOfDeath) 
            square.isDead = true;
        else 
            recovery(square);
    }, virusDuration);
}

/*--------------------------------------------------------------------------------------------*/

function squareDied(square) {
    const i = findCurrentSquareIndex(square);
    // console.log("Killing " + square.color + " square " + square.id + " - square[" + i + "]");
    squares.splice(i, 1);
}

/*--------------------------------------------------------------------------------------------*/

function findCurrentSquareIndex(square) {
    for(let i = 0; i < squares.length; i++) {
        if(squares[i].id == square.id)
            return i;
    }
    console.log("ERROR: Index of square " + square.id + " not found!");
    return 88;
}

/*--------------------------------------------------------------------------------------------*/

function recovery(square) {
    square.color = colors[generateRandomUnsignedNumber(colors.length - 1)];
    square.isVirus = false;
}

/*--------------------------------------------------------------------------------------------*/

function setBattleMode(square1, square2) {
    let x = generateRandomUnsignedNumber(2);
    if(x == 1)
        square1.color = square2.color;
    else    
        square2.color = square1.color;
}