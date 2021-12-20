let screenWidth = 800;
let screenHeight = 600;
let totalSquares = 10;
let maxSquareSize = 15;
let speedLimit = 8;

let squares = [];
let mode = {"virusMode" : false, "battleMode" : 0}
let virusMode = true;
let virusIsAlive = false;
let battleMode = true;

let colors = ["blue", "green", "orange", "purple", "black", "cyan", "grey", "teal", "violet", "pink",
                "coral", "chartreuse", "darkgreen", "goldenrod", "khaki", "magenta", "olive", "rebeccapurple", "yellow", "maroon"];

/*--------------------------------------------------------------------------------------------*/

function startGame() {
    generateSquares();
    myGameArea.start();
}

/*--------------------------------------------------------------------------------------------*/

function generateSquares() {
    let squareWidth, screenXPos, screenYPos;
    for(let i = 0; i < totalSquares; i++) {
        screenYPos = generateRandomNumber(screenHeight - 50);
        squareWidth = generateRandomNumber(maxSquareSize);
        screenXPos = generateRandomNumber(screenWidth - 50);
        squares.push(new square(squareWidth + 15, squareWidth + 15, colors[generateRandomNumber(colors.length - 1)], screenXPos, screenYPos));
        squares[0].isVirus = true;
    }
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

function square(width, height, color, x, y) {
    this.isStillOverlapping = false;
    this.isVirus = false;
    this.color = color;
    this.width = width;
    this.height = height;
    this.mass = width % 3;
    this.speedX = generateRandomNumber(speedLimit) - generateRandomNumber(speedLimit);
    this.speedY = generateRandomNumber(speedLimit) - generateRandomNumber(speedLimit);
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

function runGameLoop() {
    myGameArea.clear();
    animateSquares();
    setWallReactionType();
    scanForAllowableCollisions();
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

function printData(square) {
    console.log(square.width + ": {" + square.x + ", " + square.y + "}");
    console.log("Area: {" + myGameArea.canvas.width + ", " + myGameArea.canvas.height + "}");
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
        let y = square1.speedY;// + (Math.sign(square1.speedY) * 1);
        square1.speedY = square2.speedY;// + (Math.sign(square2.speedX) * 1);
        square2.speedY = y;
    } 
    else if(leftOrRight) {
        let x = square1.speedX;// + (Math.sign(square1.speedX) * 1);
        square1.speedX = square2.speedX;// + (Math.sign(square2.speedX) * 1);
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
                    performSquareCollision(squares[i], squares[j]);
                    squares[i].isStillOverlapping = true;
                    squares[j].isStillOverlapping = true;
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

function generateRandomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}

/*--------------------------------------------------------------------------------------------*/

function performSquareCollision(square1, square2) {
    
    exchangeTrajectories(square1, square2);
    
    if(virusMode) {
        document.getElementById("infect").style.display = "block";
        if(virusIsAlive)
            setVirusMode(square1, square2);
    }
    
    if(battleMode)
    setBattleMode(square1, square2);
}

/*--------------------------------------------------------------------------------------------*/

function doSomething() {
    virusIsAlive = true;
}

/*--------------------------------------------------------------------------------------------*/

function setVirusMode(square1, square2) {
    if(square1.isVirus) {
        square2.isVirus = true;
        square2.color = "red";
    }
    
    if(square2.isVirus) {
        square1.isVirus = true;
        square1.color = square2.color;                
    }
}

/*--------------------------------------------------------------------------------------------*/

function setBattleMode(square1, square2) {
    let x = generateRandomNumber(2);
    if(x == 1)
    square1.color = square2.color;
    else    
    square2.color = square1.color;
}