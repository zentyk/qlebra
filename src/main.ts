import './style.css'

const gameBoard = document.querySelector("#game");
const ctx = (gameBoard as HTMLCanvasElement).getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const bgm : HTMLAudioElement =  document.querySelector("#bgm");
const gameWidth = (gameBoard as HTMLCanvasElement).width ? (gameBoard as HTMLCanvasElement).width : 200;
const gameHeight = (gameBoard as HTMLCanvasElement).height ? (gameBoard as HTMLCanvasElement).height : 200;
let boardBackground = "black";
const snakeColor = "black";
const snakeBorder = "green";
const foodColor = "red";
let unitSize = 10;
let running = false;
let gameVelocity = 60;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX: number;
let foodY: number;
let score = 0;
let snake = [
    {x:unitSize * 4, y:0},
    {x:unitSize * 3, y:0},
    {x:unitSize * 2, y:0},
    {x:unitSize, y:0},
    {x:0, y:0}
];
let canPlay = false;
let currentLevel = 0;

window.addEventListener("keydown", changeDirection);

if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
    window.addEventListener("keydown", (event) => {
        if (event.key === "Space" || event.key === "Enter") {
            resetGame();
        }
    });
}

function gameStart(){
  if(bgm){
    if(bgm.paused){
      bgm.play();
    }
  }
  (gameBoard as HTMLElement).style.rotate = "0deg";
  boardBackground = "black";
    running= true;
    if (scoreText) {
        scoreText.textContent = score.toString();
    }
    createFood();
    drawFood();
    nextTick();
};
function nextTick(){
    if(running){
        setTimeout(()=>{
            clearBoard();
            drawFood();
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, gameVelocity);
    }
    else{
        displayGameOver();
    }
};
function clearBoard(){
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};
function createFood(){
    function randomFood(min: number, max: number){
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
};
function drawFood(){
    ctx.fillStyle = 'black';
    ctx.strokeStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
    ctx.strokeRect(foodX, foodY, unitSize, unitSize); 
};
function moveSnake(){
    const head = {x: snake[0].x + xVelocity,
                  y: snake[0].y + yVelocity};
    
    snake.unshift(head);
    //if food is eaten
    if(snake[0].x == foodX && snake[0].y == foodY){
        score+=1;
        HandleLevels(score);
        if (scoreText) {
            scoreText.textContent = score.toString();
        }
        createFood();
    }
    else{
        snake.pop();
    }     
};
function drawSnake(){
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    })
};
function changeDirection(event: { keyCode: any; }){
  const keyPressed = event.keyCode;
  const LEFT = 37;
  const UP = 38;
  const RIGHT = 39;
  const DOWN = 40;

  const goingUp = (yVelocity == -unitSize);
  const goingDown = (yVelocity == unitSize);
  const goingRight = (xVelocity == unitSize);
  const goingLeft = (xVelocity == -unitSize);

  switch(true){
      case(keyPressed == LEFT && !goingRight):
          xVelocity = -unitSize;
          yVelocity = 0;
          break;
      case(keyPressed == UP && !goingDown):
          xVelocity = 0;
          yVelocity = -unitSize;
          break;
      case(keyPressed == RIGHT && !goingLeft):
          xVelocity = unitSize;
          yVelocity = 0;
          break;
      case(keyPressed == DOWN && !goingUp):
          xVelocity = 0;
          yVelocity = unitSize;
          break;
  }
}
function checkGameOver(){
    switch(true){
        case (snake[0].x < 0):
            running = false;
            break;
        case (snake[0].x >= gameWidth):
            running = false;
            break;
        case (snake[0].y < 0):
            running = false;
            break;
        case (snake[0].y >= gameHeight):
                running = false;
                break;
    }
    for(let i = 1; i < snake.length; i+=1){
        if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
            running = false;
        }
    }
};
function displayGameOver(){
    ctx.font = "25px MV Boli";
    ctx.fillStyle = "White";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
    canPlay = false;
    handleInputs(canPlay);
};
function resetGame(){
    score = 0;
    xVelocity = unitSize;
    gameVelocity = 120;
    yVelocity = 0;
    snake = [
        {x:unitSize * 4, y:0},
        {x:unitSize * 3, y:0},
        {x:unitSize * 2, y:0},
        {x:unitSize, y:0},
        {x:0, y:0}
    ];
    gameStart();
    canPlay = true;
    handleInputs(canPlay);
};

gameOver();

function gameOver(){
  handleInputs(canPlay);
}

function handleInputs(toPlay: boolean){
  if(toPlay){
    document.getElementById('upBtn').style.display = 'block'; 
    document.getElementById('downBtn').style.display = 'block';
    document.getElementById('leftBtn').style.display = 'block';
    document.getElementById('rightBtn').style.display = 'block';
    document.getElementById('resetBtn').style.display = 'none';
  } else {
    document.getElementById('upBtn').style.display = 'none'; 
    document.getElementById('downBtn').style.display = 'none';
    document.getElementById('leftBtn').style.display = 'none';
    document.getElementById('rightBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'block';
  }
}

//#region Inputs
document.getElementById('upBtn')?.addEventListener('click', () => {
  changeDirection({keyCode: 38});  
})
document.getElementById('downBtn')?.addEventListener('click', () => {
  changeDirection({keyCode: 40});
})
document.getElementById('leftBtn')?.addEventListener('click', () => {
  changeDirection({keyCode: 37});
})
document.getElementById('rightBtn')?.addEventListener('click', () => {
  changeDirection({keyCode: 39});
})
//#endregion

//#region Levels
function HandleLevels(score: number){
  
  switch(score){
    case 2:
      (gameBoard as HTMLElement).style.rotate = "1deg";
      gameVelocity = 110;
      break;
    case 3:
      (gameBoard as HTMLElement).style.rotate = "2deg";
      gameVelocity = 100;
      break; 
    case 4:
      (gameBoard as HTMLElement).style.rotate = "3deg";
      gameVelocity = 120;
      break;
    case 5:
      (gameBoard as HTMLElement).style.rotate = "0deg";
      gameVelocity = 130;
      break;

    case 6:
      (gameBoard as HTMLElement).style.rotate = "-1deg";
      gameVelocity = 140;
      break;
    case 7:
      (gameBoard as HTMLElement).style.rotate = "-2deg";
      gameVelocity = 150;
      break;
    case 8:
      (gameBoard as HTMLElement).style.rotate = "-3deg";
      gameVelocity = 160;
      break;
    case 9:
      (gameBoard as HTMLElement).style.rotate = "0deg";
      gameVelocity = 100;
      break;
  }

  if(score % 8 == 0){
    currentLevel+=2;
    (gameBoard as HTMLElement).style.rotate = `${currentLevel}deg`;
  }

  switch(score){
    case 2: 
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px #f3f3f3";
      }
      break;

    case 8:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 0, 0, 0.5)";
 
      }
      break;
    
    case 16:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(0, 255, 0,0.5)";
      }
      break;
    case 24:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(0, 0, 255,0.5)";
        gameVelocity = 110;
      }
      break;
    case 32:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 255, 0,0.5)";
      }
      break;
    case 40:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 0, 255,0.5)";
      }
      break;
    case 48:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(0, 255, 255,0.5)";
        gameVelocity = 100;
      }
      break;
    case 56:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 255, 255,0.5)";
      }
      break;
    case 64:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(0, 0, 0,0.5)";
      }
      break;
    case 72:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 0, 0,0.5)";
      }
      break;
    case 80:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(12, 115, 0,0.5)";
      }
      break;
    case 88:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(21, 245, 223,0.5)";
      }
      break;
    case 96:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgba(255, 255, 255,0.5)";
      }
      break;
    case 104:
      if (gameBoard) {
        (gameBoard as HTMLCanvasElement).style.boxShadow = "0px 0px 10px 10px rgb(134, 23, 123,0.5)";
      }
      break;
  }
}
//#endregion

let message = document.getElementById("message");

if (message) {
  console.log("Message element found");

  setTimeout(function () {
    fadeIn();
  }, 1500);

  function fadeIn() {
    const intervalId = setInterval(function () {
        if (!message.style.opacity) {
            message.style.opacity = "1";
        }
        if (parseFloat(message.style.opacity) > 0) {
            message.style.opacity = (parseFloat(message.style.opacity) - 0.1).toString();
        } else {
            clearInterval(intervalId);
        }
    }, 100);

    setTimeout(function () {
        message.style.display = "none";
    }, 2000);
  }
}