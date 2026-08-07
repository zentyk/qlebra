import './style.css'

const gameBoard = document.querySelector("#game");
const ctx = (gameBoard as HTMLCanvasElement).getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const bgm : HTMLAudioElement =  document.querySelector("#bgm");
const gameWidth = (gameBoard as HTMLCanvasElement).width ? (gameBoard as HTMLCanvasElement).width : 200;
const gameHeight = (gameBoard as HTMLCanvasElement).height ? (gameBoard as HTMLCanvasElement).height : 200;
let boardBackground = "black";
const snakeColor = "#005500";
let boardColor = "#003300";
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

let lastRenderTime = 0;

if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
    window.addEventListener("keydown", (event) => {
        if ((event.key === "Space" || event.key === "Enter") && !running) {
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
    window.requestAnimationFrame(nextTick);
};
function nextTick(currentTime: number){
    if(running){
        window.requestAnimationFrame(nextTick);
        const msSinceLastRender = currentTime - lastRenderTime;
        if (msSinceLastRender < gameVelocity) return;
        lastRenderTime = currentTime;

        clearBoard(); 
        drawBoard();
        drawFood();
        moveSnake();
        drawSnake();
        checkGameOver();
    }
    else{
        displayGameOver();
    }
};
function clearBoard(){
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};
function drawBoard(){
//draw a grid of 10x10
            for(let i = 0; i < gameWidth; i+=unitSize){
                ctx.strokeStyle = boardColor;
                ctx.strokeRect(i, 0, unitSize, gameHeight);
                ctx.strokeRect(0, i, gameWidth, unitSize);
                ctx.strokeRect(i, gameHeight, unitSize, gameHeight);
                ctx.strokeRect(gameWidth, i, gameWidth, unitSize);
            }
}
function createFood(){
    function randomFood(min: number, max: number){
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
};
function drawFood(){
    ctx.strokeStyle = foodColor;
    ctx.fillStyle = '#550000';

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
  const upBtn = document.getElementById('upBtn');
  const downBtn = document.getElementById('downBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const resetBtnEl = document.getElementById('resetBtn');

  if(toPlay){
    if(upBtn) upBtn.style.display = 'block'; 
    if(downBtn) downBtn.style.display = 'block';
    if(leftBtn) leftBtn.style.display = 'block';
    if(rightBtn) rightBtn.style.display = 'block';
    if(resetBtnEl) resetBtnEl.style.display = 'none';
  } else {
    if(upBtn) upBtn.style.display = 'none'; 
    if(downBtn) downBtn.style.display = 'none';
    if(leftBtn) leftBtn.style.display = 'none';
    if(rightBtn) rightBtn.style.display = 'none';
    if(resetBtnEl) resetBtnEl.style.display = 'block';
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
const levelSettings: Record<number, { rotate?: string, velocity?: number, shadow?: string, boardColor?: string }> = {
  2: { rotate: "1deg", velocity: 110, shadow: "0px 0px 10px 10px #f3f3f3", boardColor: "#333333" },
  3: { rotate: "2deg", velocity: 100 },
  4: { rotate: "3deg", velocity: 120 },
  5: { rotate: "0deg", velocity: 130 },
  6: { rotate: "-1deg", velocity: 140 },
  7: { rotate: "-2deg", velocity: 150 },
  8: { rotate: "-3deg", velocity: 160, shadow: "0px 0px 10px 10px rgba(255, 0, 0, 0.5)", boardColor: "#330000" },
  9: { rotate: "0deg", velocity: 100 },
  16: { shadow: "0px 0px 10px 10px rgba(0, 255, 0,0.5)", boardColor: "#003300" },
  24: { velocity: 110, shadow: "0px 0px 10px 10px rgba(0, 0, 255,0.5)", boardColor: "#000033" },
  32: { shadow: "0px 0px 10px 10px rgba(255, 255, 0,0.5)", boardColor: "#333300" },
  40: { shadow: "0px 0px 10px 10px rgba(255, 0, 255,0.5)", boardColor: "#330033" },
  48: { velocity: 100, shadow: "0px 0px 10px 10px rgba(0, 255, 255,0.5)", boardColor: "#003333" },
  56: { shadow: "0px 0px 10px 10px rgba(255, 255, 255,0.5)", boardColor: "#333333" },
  64: { shadow: "0px 0px 10px 10px rgba(0, 0, 0,0.5)", boardColor: "#111111" },
  72: { shadow: "0px 0px 10px 10px rgba(255, 0, 0,0.5)", boardColor: "#330000" },
  80: { shadow: "0px 0px 10px 10px rgba(12, 115, 0,0.5)", boardColor: "#011110" },
  88: { shadow: "0px 0px 10px 10px rgba(21, 245, 223,0.5)", boardColor: "#15f1df" },
  96: { shadow: "0px 0px 10px 10px rgba(255, 255, 255,0.5)", boardColor: "#111111" },
  104: { shadow: "0px 0px 10px 10px rgb(134, 23, 123,0.5)", boardColor: "#431332" },
};

function HandleLevels(score: number){
  const settings = levelSettings[score];
  if (settings) {
    if (settings.rotate) (gameBoard as HTMLElement).style.rotate = settings.rotate;
    if (settings.velocity) gameVelocity = settings.velocity;
    if (settings.shadow && gameBoard) (gameBoard as HTMLCanvasElement).style.boxShadow = settings.shadow;
    if (settings.boardColor) boardColor = settings.boardColor;
  }

  if(score % 8 == 0){
    currentLevel+=2;
    (gameBoard as HTMLElement).style.rotate = `${currentLevel}deg`;
  }
}
//#endregion

let message = document.getElementById("message");

if (message) {
  console.log("Message element found");

  setTimeout(function () {
    fadeOut();
  }, 1500);

  function fadeOut() {
    const intervalId = setInterval(function () {
        if (message && !message.style.opacity) {
            message.style.opacity = "1";
        }
        if (message && parseFloat(message.style.opacity) > 0) {
            message.style.opacity = (parseFloat(message.style.opacity) - 0.1).toString();
        } else {
            clearInterval(intervalId);
        }
    }, 100);

    setTimeout(function () {
        if (message) message.style.display = "none";
    }, 2000);
  }
}