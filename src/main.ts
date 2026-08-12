import 'portebla/dist/portebla.css';
import './style.css';
import porteblaCode from 'portebla/dist/portebla.js?raw';
import { audioManager } from './audio';

declare const fbq: any;

const script = document.createElement('script');
script.textContent = porteblaCode;
document.head.appendChild(script);

const Portebla = (window as any).Portebla?.Portebla;

const portebla = new Portebla({
    container: document.getElementById('portebla-container'),
    layout: 'portrait',
    leftControl: 'dpad',
    rightControl: 'buttons',
    centerControl: 'menu'
});

const handleVibrate = (e: Event) => {
    // Catch touches inside the portebla controller before they are consumed
    const container = document.getElementById('portebla-container');
    if (container && container.contains(e.target as Node)) {
        if (navigator.vibrate) navigator.vibrate([50]);
    }
};

window.addEventListener('touchstart', handleVibrate, { capture: true, passive: true });
window.addEventListener('pointerdown', handleVibrate, { capture: true, passive: true });

const gameBoard = document.querySelector("#game");
const ctx = (gameBoard as HTMLCanvasElement).getContext("2d");
const scoreText = document.querySelector("#scoreText");

const debugDiv = document.createElement("div");
debugDiv.style.position = "absolute";
debugDiv.style.top = "10px";
debugDiv.style.left = "10px";
debugDiv.style.color = "lime";
debugDiv.style.zIndex = "9999";
debugDiv.style.fontFamily = "monospace";
debugDiv.textContent = navigator.vibrate ? "Vibration API: Supported" : "Vibration API: NOT Supported";
document.body.appendChild(debugDiv);

const gameWidth = (gameBoard as HTMLCanvasElement).width ? (gameBoard as HTMLCanvasElement).width : 200;
const gameHeight = (gameBoard as HTMLCanvasElement).height ? (gameBoard as HTMLCanvasElement).height : 200;
let boardBackground = "black";
const snakeColor = "#005500";
let boardColor = "#003300";
const snakeBorder = "green";
const foodColor = "red";
let unitSize = 10;
let running = false;
let isPaused = false;
let gameVelocity = 60;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX: number;
let foodY: number;

const FOOD_NORMAL = 0;
const FOOD_INVINCIBLE = 1;
const FOOD_MULTIPLIER = 2;
let currentFoodType = FOOD_NORMAL;

let invincibleUntil = 0;
let multiplierUntil = 0;

let walls: { x: number, y: number }[] = [];
let wallStage = 0;

let particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[] = [];
let shakeFrames = 0;

let score = 0;
let snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 }
];
let currentLevel = 0;

window.addEventListener("keydown", changeDirection);

window.addEventListener("keydown", (event) => {
    if ((event.key === "Space" || event.key === "Enter") && !running) {
        resetGame();
    }
});

let lastRenderTime = 0;

function gameStart() {
    audioManager.play();
    (gameBoard as HTMLElement).style.rotate = "0deg";
    boardBackground = "black";
    running = true;
    isPaused = false;
    invincibleUntil = 0;
    multiplierUntil = 0;
    lastRenderTime = performance.now();
    if (scoreText) {
        scoreText.textContent = score.toString();
    }
    createFood();
    drawFood();
};

function loop(currentTime: number) {
    window.requestAnimationFrame(loop);

    if (!running) {
        if (portebla.input.buttons.START?.justPressed || portebla.input.buttons.A?.justPressed) {
            resetGame();
        }
        portebla.input.update();
        return;
    }

    if (portebla.input.buttons.START?.justPressed || portebla.input.buttons.SELECT?.justPressed) {
        isPaused = !isPaused;
        if (isPaused) displayPaused();
        else {
            lastRenderTime = currentTime; // Prevent time jump
            clearBoard();
            drawBoard();
            drawFood();
            drawSnake();
        }
    }

    if (isPaused) {
        portebla.input.update();
        return;
    }

    if (portebla.input.buttons.UP?.justPressed || portebla.input.buttons.UP?.pressed) changeDirection({ keyCode: 38 });
    if (portebla.input.buttons.DOWN?.justPressed || portebla.input.buttons.DOWN?.pressed) changeDirection({ keyCode: 40 });
    if (portebla.input.buttons.LEFT?.justPressed || portebla.input.buttons.LEFT?.pressed) changeDirection({ keyCode: 37 });
    if (portebla.input.buttons.RIGHT?.justPressed || portebla.input.buttons.RIGHT?.pressed) changeDirection({ keyCode: 39 });

    // Mechanic: Tail Cut (X button) - Cuts 5 segments off the tail to save space, keeping the score!
    if (portebla.input.buttons.X?.justPressed) {
        if (snake.length > 10) {
            snake.splice(snake.length - 5, 5);
            // Flash board color to indicate success
            const oldColor = boardBackground;
            boardBackground = "#330033";
            setTimeout(() => { boardBackground = oldColor; }, 150);
        }
    }

    const isBoosting = portebla.input.buttons.B?.pressed || portebla.input.buttons.A?.pressed;
    const isFocusing = portebla.input.buttons.Y?.pressed; // Mechanic: Focus (Y button) - Slows down time

    let effectiveVelocity = gameVelocity;
    if (isBoosting) effectiveVelocity = gameVelocity / 2.5;
    else if (isFocusing) effectiveVelocity = gameVelocity * 2;

    const msSinceLastRender = currentTime - lastRenderTime;
    if (msSinceLastRender >= effectiveVelocity) {
        lastRenderTime = currentTime;

        clearBoard();
        drawBoard();
        drawFood();
        moveSnake();
        drawSnake();
        drawParticles();
        checkGameOver();
        if (!running) {
            shakeFrames = 15;
            displayGameOver();
        }
    }

    if (shakeFrames > 0) {
        shakeFrames--;
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        if (gameBoard) (gameBoard as HTMLElement).style.transform = `translate(${dx}px, ${dy}px)`;
        if (shakeFrames === 0 && gameBoard) (gameBoard as HTMLElement).style.transform = `translate(0px, 0px)`;
    }

    portebla.input.update();
};

window.requestAnimationFrame(loop);
function clearBoard() {
    ctx.globalAlpha = 0.3; // Motion Trails
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    ctx.globalAlpha = 1.0;
};
function drawBoard() {
    //draw a grid of 10x10
    for (let i = 0; i < gameWidth; i += unitSize) {
        ctx.strokeStyle = boardColor;
        ctx.shadowBlur = 0;
        ctx.strokeRect(i, 0, unitSize, gameHeight);
        ctx.strokeRect(0, i, gameWidth, unitSize);
        ctx.strokeRect(i, gameHeight, unitSize, gameHeight);
        ctx.strokeRect(gameWidth, i, gameWidth, unitSize);
    }
    ctx.fillStyle = '#555555';
    ctx.strokeStyle = '#aaaaaa';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#555555';
    walls.forEach(w => {
        ctx.fillRect(w.x, w.y, unitSize, unitSize);
        ctx.strokeRect(w.x, w.y, unitSize, unitSize);
    });
    ctx.shadowBlur = 0;
}
function createFood() {
    function randomFood(min: number, max: number) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }

    let isOccupied = true;
    while (isOccupied) {
        foodX = randomFood(0, gameWidth - unitSize);
        foodY = randomFood(0, gameHeight - unitSize);
        isOccupied = false;

        for (const w of walls) {
            if (w.x === foodX && w.y === foodY) isOccupied = true;
        }
        for (const s of snake) {
            if (s.x === foodX && s.y === foodY) isOccupied = true;
        }
    }

    const rand = Math.random();
    if (rand < 0.1) currentFoodType = FOOD_INVINCIBLE;
    else if (rand < 0.2) currentFoodType = FOOD_MULTIPLIER;
    else currentFoodType = FOOD_NORMAL;
};
function drawFood() {
    let stroke = foodColor;
    let fill = '#550000';
    if (currentFoodType === FOOD_INVINCIBLE) {
        stroke = 'cyan';
        fill = '#005555';
    } else if (currentFoodType === FOOD_MULTIPLIER) {
        stroke = 'gold';
        fill = '#555500';
    }

    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.shadowBlur = 15;
    ctx.shadowColor = stroke;

    ctx.fillRect(foodX, foodY, unitSize, unitSize);
    ctx.strokeRect(foodX, foodY, unitSize, unitSize);
    ctx.shadowBlur = 0;
};
function moveSnake() {
    const head = {
        x: snake[0].x + xVelocity,
        y: snake[0].y + yVelocity
    };

    snake.unshift(head);
    //if food is eaten
    if (snake[0].x == foodX && snake[0].y == foodY) {
        const points = (multiplierUntil > performance.now()) ? 3 : 1;
        score += points;

        // Spawn Particles
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: foodX + unitSize / 2,
                y: foodY + unitSize / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: currentFoodType === FOOD_INVINCIBLE ? 'cyan' : (currentFoodType === FOOD_MULTIPLIER ? 'gold' : foodColor)
            });
        }

        if (currentFoodType === FOOD_INVINCIBLE) {
            invincibleUntil = performance.now() + 5000;
        } else if (currentFoodType === FOOD_MULTIPLIER) {
            multiplierUntil = performance.now() + 5000;
        }

        HandleLevels(score);
        if (scoreText) {
            scoreText.textContent = score.toString();
        }
        createFood();
    }
    else {
        snake.pop();
    }
};

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1.0;
}
function drawSnake() {
    const isInvincible = invincibleUntil > performance.now();
    const isMultiplier = multiplierUntil > performance.now();

    ctx.fillStyle = isInvincible ? "#00ffff" : snakeColor;
    ctx.strokeStyle = isInvincible ? "white" : (isMultiplier ? "gold" : snakeBorder);
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.strokeStyle;

    snake.forEach((snakePart, index) => {
        if (isInvincible && index % 2 === 0) ctx.fillStyle = "white"; // Pulsing effect
        else ctx.fillStyle = isInvincible ? "#00aaaa" : snakeColor;

        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    })
    ctx.shadowBlur = 0;
};
function changeDirection(event: { keyCode: any; }) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);

    switch (true) {
        case (keyPressed == LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed == RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
}
function checkGameOver() {
    const isInvincible = invincibleUntil > performance.now();

    if (isInvincible) {
        if (snake[0].x < 0) snake[0].x = gameWidth - unitSize;
        else if (snake[0].x >= gameWidth) snake[0].x = 0;

        if (snake[0].y < 0) snake[0].y = gameHeight - unitSize;
        else if (snake[0].y >= gameHeight) snake[0].y = 0;
    } else {
        switch (true) {
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
        for (let i = 1; i < snake.length; i += 1) {
            if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
                running = false;
            }
        }
        for (let i = 0; i < walls.length; i += 1) {
            if (walls[i].x == snake[0].x && walls[i].y == snake[0].y) {
                running = false;
            }
        }
    }
};
function displayGameOver() {
    ctx.font = "25px MV Boli";
    ctx.fillStyle = "White";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
};
function displayPaused() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    ctx.font = "25px MV Boli";
    ctx.fillStyle = "White";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", gameWidth / 2, gameHeight / 2);
};
function resetGame() {
    if (typeof fbq !== 'undefined') fbq('track', 'StartTrial');

    score = 0;
    xVelocity = unitSize;
    gameVelocity = 120;
    yVelocity = 0;
    walls = [];
    particles = [];
    wallStage = 0;
    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: unitSize, y: 0 },
        { x: 0, y: 0 }
    ];
    gameStart();
};

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

function HandleLevels(score: number) {
    const settings = levelSettings[score];
    if (settings) {
        if (settings.rotate) (gameBoard as HTMLElement).style.rotate = settings.rotate;
        if (settings.velocity) gameVelocity = settings.velocity;
        if (settings.shadow && gameBoard) (gameBoard as HTMLCanvasElement).style.boxShadow = settings.shadow;
        if (settings.boardColor) boardColor = settings.boardColor;
    }

    if (score % 8 == 0) {
        currentLevel += 2;
        (gameBoard as HTMLElement).style.rotate = `${currentLevel}deg`;
    }

    // Wall Progression
    if (score >= 10 && wallStage === 0) {
        wallStage = 1;
        // Center vertical line
        for (let i = 40; i < 160; i += unitSize) walls.push({ x: 100, y: i });
    }
    if (score >= 20 && wallStage === 1) {
        wallStage = 2;
        // Add horizontal side pieces
        for (let i = 20; i < 70; i += unitSize) {
            walls.push({ x: i, y: 100 });
            walls.push({ x: 200 - i - unitSize, y: 100 });
        }
    }
    if (score >= 30 && wallStage === 2) {
        wallStage = 3;
        // Add corners
        for (let i = 20; i < 60; i += unitSize) {
            walls.push({ x: i, y: 20 });
            walls.push({ x: 200 - i - unitSize, y: 20 });
            walls.push({ x: i, y: 200 - 20 - unitSize });
            walls.push({ x: 200 - i - unitSize, y: 200 - 20 - unitSize });
        }
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