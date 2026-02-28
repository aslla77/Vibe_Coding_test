// snakeGame.js - Snake Game Logic

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = 20;

// Game state
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;
let lastUpdateTime = 0;
let speed = 7; // Frames per second (initially slow)

// Input handling
function handleKeyDown(e) {
    if (!gameStarted && !gameOver) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameStarted = true;
        }
    }

    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { nextDx = 1; nextDy = 0; }
            break;
        case ' ':
            if (gameOver) {
                resetGame();
            }
            break;
    }
}

// --- Initialization ---
export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = TILE_COUNT * GRID_SIZE;
    canvas.height = TILE_COUNT * GRID_SIZE;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    document.addEventListener('keydown', handleKeyDown);

    resetGame();
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = -1; // Initial direction: Up
    score = 0;
    gameOver = false;
    gameStarted = false;
    speed = 7;
}

// --- Game Start/Stop ---
export function start() {
    console.log('Snake Game Started');
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function stop() {
    console.log('Snake Game Stopped');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    document.removeEventListener('keydown', handleKeyDown);
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
}

// --- Game Logic ---
function update() {
    if (gameOver || !gameStarted) return;

    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver = true;
        return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        speed = Math.min(20, 7 + Math.floor(score / 50)); // Gradually increase speed
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } else {
        snake.pop();
    }
}

// --- Drawing ---
function draw() {
    const canvasBg = getComputedStyle(document.body).getPropertyValue('--canvas-bg');
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');

    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = '#F44336';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

    // Draw UI
    ctx.fillStyle = textColor;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 25);

    if (!gameStarted && !gameOver) {
        ctx.textAlign = 'center';
        ctx.fillText('Press Arrow Keys to Start', canvas.width / 2, canvas.height / 2);
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white'; // Keep Game Over text white for contrast on dark overlay
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 60);
        canvas.addEventListener('click', returnToMenuOnce);
    }
}

function gameLoop(currentTime) {
    animationFrameId = requestAnimationFrame(gameLoop);

    const secondsSinceLastUpdate = (currentTime - lastUpdateTime) / 1000;
    if (secondsSinceLastUpdate < 1 / speed) return;

    lastUpdateTime = currentTime;
    update();
    draw();
}

function returnToMenuOnce() {
    canvas.removeEventListener('click', returnToMenuOnce);
    stop();
    window.dispatchEvent(new CustomEvent('gameStopped'));
}
