// brickBreakerGame.js - Brick Breaker Game Logic with Rounds and Items

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game elements
let paddle;
let balls = [];
let bricks = [];
let obstacles = [];
let items = [];

// Game state
let gameStarted = false;
let gameOver = false;
let roundClear = false;
let round = 1;
let score = 0;
let lives = 3;
let powerBallActive = false;
let powerBallTimer = 0;

// Game settings
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
let brickRowCount = 3;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 30;
const ITEM_SIZE = 20;

const ITEM_TYPES = {
    MULTI: { color: '#00FF00', label: 'M' }, // Multi Ball
    POWER: { color: '#FFFF00', label: 'P' }  // Power Ball (Penetrating)
};

// Input handling
const keys = { ArrowLeft: false, ArrowRight: false };

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    else if (e.key === 'ArrowRight') keys.ArrowRight = true;
    else if (e.key === ' ' && !gameStarted && !gameOver && !roundClear) gameStarted = true;
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    else if (e.key === 'ArrowRight') keys.ArrowRight = false;
}

function handleMouseMove(e) {
    if (!gameStarted || gameOver || roundClear) return;
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    // Calculate width based on columns to be consistent
    canvas.width = BRICK_COLUMN_COUNT * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT * 2;
    canvas.height = 650;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    resetToFirstRound();
}

function resetToFirstRound() {
    round = 1;
    score = 0;
    lives = 3;
    setupRound();
}

function setupRound() {
    gameStarted = false;
    gameOver = false;
    roundClear = false;
    powerBallActive = false;
    powerBallTimer = 0;
    items = [];
    
    // Difficulty increases with rounds
    brickRowCount = Math.min(8, 2 + round); 
    
    paddle = { height: PADDLE_HEIGHT, width: PADDLE_WIDTH, x: (canvas.width - PADDLE_WIDTH) / 2, y: canvas.height - PADDLE_HEIGHT - 10, dx: 10 };
    balls = [{ x: canvas.width / 2, y: paddle.y - BALL_RADIUS, dx: 4, dy: -4, radius: BALL_RADIUS }];
    
    createBricks();
    createObstacles();
}

function createBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function createObstacles() {
    obstacles = [];
    if (round >= 2) {
        const numObstacles = Math.min(5, round - 1);
        for (let i = 0; i < numObstacles; i++) {
            obstacles.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height / 3) + 200,
                width: 60,
                height: 20
            });
        }
    }
}

export function start() {
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function stop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = powerBallActive ? '#FFFF00' : '#0095DD';
        ctx.fill();
        ctx.closePath();
    });
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < brickRowCount; r++) {
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

function drawObstacles() {
    obstacles.forEach(ob => {
        ctx.fillStyle = '#888888'; // Grey for unbreakable
        ctx.beginPath();
        ctx.rect(ob.x, ob.y, ob.width, ob.height);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.strokeRect(ob.x, ob.y, ob.width, ob.height);
        ctx.closePath();
    });
}

function drawItems() {
    items.forEach(item => {
        ctx.fillStyle = item.type.color;
        ctx.beginPath();
        ctx.roundRect(item.x, item.y, ITEM_SIZE, ITEM_SIZE, 5);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.type.label, item.x + ITEM_SIZE/2, item.y + 15);
    });
}

function drawUI() {
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText(`Round: ${round}  Score: ${score}`, 10, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 10, 30);
    
    if (powerBallActive) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('POWER BALL ACTIVE!', canvas.width/2, 30);
    }
}

function update() {
    if (gameOver || roundClear) return;

    if (keys.ArrowLeft && paddle.x > 0) paddle.x -= paddle.dx;
    else if (keys.ArrowRight && paddle.x + paddle.width < canvas.width) paddle.x += paddle.dx;

    if (!gameStarted) {
        balls[0].x = paddle.x + paddle.width / 2;
        balls[0].y = paddle.y - BALL_RADIUS;
        return;
    }

    if (powerBallActive) {
        powerBallTimer--;
        if (powerBallTimer <= 0) powerBallActive = false;
    }

    // Update balls
    let activeBricks = 0;
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collisions
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
        if (ball.y - ball.radius < 0) ball.dy *= -1;
        else if (ball.y + ball.radius > canvas.height) {
            balls.splice(i, 1);
            continue;
        }

        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y) {
            ball.dy = -Math.abs(ball.dy);
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.dx = hitPoint * 6;
        }

        // Obstacle collision
        obstacles.forEach(ob => {
            if (ball.x + ball.radius > ob.x && ball.x - ball.radius < ob.x + ob.width &&
                ball.y + ball.radius > ob.y && ball.y - ball.radius < ob.y + ob.height) {
                // Simple collision response
                if (ball.y < ob.y || ball.y > ob.y + ob.height) ball.dy *= -1;
                else ball.dx *= -1;
            }
        });

        // Brick collision
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    activeBricks++;
                    if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + BRICK_WIDTH &&
                        ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + BRICK_HEIGHT) {
                        if (!powerBallActive) ball.dy *= -1;
                        b.status = 0;
                        score += 10;
                        activeBricks--;
                        
                        // Item drop chance (30%)
                        if (Math.random() < 0.3) {
                            const types = Object.keys(ITEM_TYPES);
                            const type = ITEM_TYPES[types[Math.floor(Math.random() * types.length)]];
                            items.push({ x: b.x + BRICK_WIDTH/2, y: b.y + BRICK_HEIGHT/2, type: type });
                        }
                    }
                }
            }
        }
    }

    if (activeBricks === 0) {
        roundClear = true;
    }

    if (balls.length === 0) {
        lives--;
        if (lives === 0) gameOver = true;
        else resetBallOnPaddle();
    }

    // Update items
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += 1.5; 

        if (item.y > canvas.height) items.splice(i, 1);
        else if (item.x > paddle.x && item.x < paddle.x + paddle.width && item.y + ITEM_SIZE > paddle.y) {
            applyItem(item.type);
            items.splice(i, 1);
        }
    }
}

function applyItem(type) {
    if (type === ITEM_TYPES.MULTI) {
        const newBalls = [];
        balls.forEach(b => {
            newBalls.push({ x: b.x, y: b.y, dx: -b.dx, dy: b.dy, radius: b.radius });
        });
        balls.push(...newBalls);
    } else if (type === ITEM_TYPES.POWER) {
        powerBallActive = true;
        powerBallTimer = 600; 
    }
}

function resetBallOnPaddle() {
    balls = [{ x: paddle.x + paddle.width / 2, y: paddle.y - BALL_RADIUS, dx: 4, dy: -4, radius: BALL_RADIUS }];
    gameStarted = false;
    items = [];
    powerBallActive = false;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawObstacles();
    drawPaddle();
    drawBalls();
    drawItems();
    drawUI();

    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');

    if (!gameStarted && !gameOver && !roundClear) {
        ctx.font = '24px Arial';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 50);
    }

    if (roundClear) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.textAlign = 'center';
        ctx.fillText('ROUND CLEAR!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Click to start next round', canvas.width / 2, canvas.height / 2 + 50);
        canvas.addEventListener('click', nextRoundOnce);
        return;
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 80);
        canvas.addEventListener('click', returnToMenuOnce);
        return;
    }

    update();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function nextRoundOnce() {
    canvas.removeEventListener('click', nextRoundOnce);
    round++;
    setupRound();
}

function returnToMenuOnce() {
    canvas.removeEventListener('click', returnToMenuOnce);
    stop();
    window.dispatchEvent(new CustomEvent('gameStopped'));
}
