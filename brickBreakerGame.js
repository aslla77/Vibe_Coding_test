// brickBreakerGame.js - Brick Breaker Game Logic

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game elements
let paddle;
let ball;
let bricks = [];

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let lives = 3;

// Game settings
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

// Input handling
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    else if (e.key === 'ArrowRight') keys.ArrowRight = true;
    else if (e.key === ' ' && !gameStarted) {
        startGameLogic();
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    else if (e.key === 'ArrowRight') keys.ArrowRight = false;
}

function handleMouseMove(e) {
    if (!gameStarted || gameOver) return;
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// --- Initialization ---
export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = BRICK_COLUMN_COUNT * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT * 2;
    canvas.height = 600;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Add event listeners specific to this game's canvas
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    resetGame();
}

function resetGame() {
    paddle = {
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        x: (canvas.width - PADDLE_WIDTH) / 2,
        y: canvas.height - PADDLE_HEIGHT - 10,
        dx: 7 // paddle speed
    };

    ball = {
        radius: BALL_RADIUS,
        x: canvas.width / 2,
        y: paddle.y - BALL_RADIUS,
        dx: 3, // ball speed x
        dy: -3 // ball speed y
    };

    score = 0;
    lives = 3;
    gameStarted = false;
    gameOver = false;

    createBricks();
}

function createBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // Status 1 means active
        }
    }
}

// --- Game Start/Stop ---
export function start() {
    console.log('Brick Breaker Game Started');
    resetGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGameLogic() {
    gameStarted = true;
}

export function stop() {
    console.log('Brick Breaker Game Stopped');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    if (canvas) { // Check if canvas exists before removing its listeners
        canvas.removeEventListener('mousemove', handleMouseMove);
    }
    // Remove canvas from DOM
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
}

// --- Drawing Functions ---
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

// --- Update Game Logic ---
function update() {
    if (gameOver) return;

    // Paddle movement
    if (keys.ArrowLeft && paddle.x > 0) {
        paddle.x -= paddle.dx;
    } else if (keys.ArrowRight && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;
    }

    if (!gameStarted) {
        // Ball stays on paddle before game starts
        ball.x = paddle.x + paddle.width / 2;
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    } else if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives === 0) {
            gameOver = true;
        } else {
            resetBallAndPaddle();
        }
    }

    // Ball collision with paddle
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y) {
        ball.dy *= -1;
    }

    // Ball collision with bricks
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + BRICK_WIDTH &&
                    ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + BRICK_HEIGHT) {
                    ball.dy *= -1;
                    b.status = 0; // Brick is broken
                    score += 10;
                    if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                        alert('YOU WIN, CONGRATS!');
                        gameOver = true; // For simplicity, just end game on win
                    }
                }
            }
        }
    }
}

function resetBallAndPaddle() {
    paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3;
    ball.dy = -3;
    gameStarted = false;
}

// --- Game Loop ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();
    drawLives();

    if (!gameStarted) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 50);
    }

    if (gameOver) {
        ctx.font = '48px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 80);
        canvas.addEventListener('click', returnToMenuOnce);
        cancelAnimationFrame(animationFrameId); // Stop the loop
        return;
    }

    update();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function returnToMenuOnce() {
    canvas.removeEventListener('click', returnToMenuOnce);
    stop();
    window.dispatchEvent(new CustomEvent('gameStopped'));
}