// basketballGame.js - Basketball Drag and Shoot Game Logic

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game state variables
let gameState = 'playing'; // 'playing', 'upgrade', 'gameOver'
let round = 1;
let score = 0;
let roundScore = 0;
let goalScore = 5;

// Physics and Ball variables
let balls = [];
const GRAVITY = 0.5;
const FRICTION = 0.98;
const BALL_RADIUS = 20;

// Mouse/Interaction variables
let isDragging = false;
let dragStartX, dragStartY;
let currentMouseX, currentMouseY;

// Hoop variables
let hoop = {
    x: 500,
    y: 150,
    width: 100,
    height: 10,
    speed: 0,
    direction: 1,
    isStopped: false
};

// Item effects
let items = {
    stopHoop: false,
    wideHoop: false,
    doubleShot: false
};

let upgradeOptions = [];

// --- Initialization ---
export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    resetGame();
}

function resetGame() {
    round = 1;
    score = 0;
    roundScore = 0;
    goalScore = 5;
    gameState = 'playing';
    balls = [];
    hoop.width = 100;
    hoop.speed = 0;
    hoop.isStopped = false;
    items = { stopHoop: false, wideHoop: false, doubleShot: false };
    spawnBall();
}

function spawnBall() {
    balls.push({
        x: canvas.width / 2,
        y: canvas.height - 100,
        vx: 0,
        vy: 0,
        radius: BALL_RADIUS,
        inAir: false,
        isScored: false
    });
}

function startRound() {
    gameState = 'playing';
    roundScore = 0;
    goalScore = 5 + (round - 1) * 3;
    
    // Increase difficulty: hoop speed
    if (round > 1) {
        hoop.speed = Math.min(8, (round - 1) * 1.5);
    } else {
        hoop.speed = 0;
    }

    // Apply item effects for the round
    if (items.stopHoop) {
        hoop.isStopped = true;
        hoop.speed = 0;
    } else {
        hoop.isStopped = false;
    }

    if (items.wideHoop) {
        hoop.width = 160;
    } else {
        hoop.width = 100;
    }

    balls = [];
    spawnBall();
}

// --- Input Handling ---
function handleMouseDown(e) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Only allow dragging if there's a ball at the starting position
    const ball = balls.find(b => !b.inAir);
    if (ball) {
        const dist = Math.sqrt((mx - ball.x) ** 2 + (my - ball.y) ** 2);
        if (dist < ball.radius * 2) {
            isDragging = true;
            dragStartX = mx;
            dragStartY = my;
        }
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    currentMouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    currentMouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

function handleMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ball = balls.find(b => !b.inAir);
    if (ball) {
        // Calculate velocity based on drag distance
        ball.vx = (dragStartX - mx) * 0.15;
        ball.vy = (dragStartY - my) * 0.15;
        ball.inAir = true;

        if (items.doubleShot) {
            balls.push({
                x: ball.x + 30,
                y: ball.y,
                vx: ball.vx,
                vy: ball.vy,
                radius: ball.radius,
                inAir: true,
                isScored: false
            });
        }

        // Spawn next ball after a delay if round isn't over
        setTimeout(() => {
            if (gameState === 'playing' && balls.filter(b => !b.inAir).length === 0) {
                spawnBall();
            }
        }, 1000);
    }
}

// --- Game Logic ---
function update() {
    if (gameState !== 'playing') return;

    // Update Hoop
    if (!hoop.isStopped) {
        hoop.x += hoop.speed * hoop.direction;
        if (hoop.x + hoop.width / 2 > canvas.width || hoop.x - hoop.width / 2 < 0) {
            hoop.direction *= -1;
        }
    }

    // Update Balls
    balls.forEach((ball, index) => {
        if (ball.inAir) {
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.vy += GRAVITY;
            ball.vx *= FRICTION;

            // Check Score
            if (!ball.isScored && ball.vy > 0 && 
                ball.y > hoop.y && ball.y < hoop.y + 20 &&
                ball.x > hoop.x - hoop.width / 2 && ball.x < hoop.x + hoop.width / 2) {
                ball.isScored = true;
                score += 1;
                roundScore += 1;
                
                if (roundScore >= goalScore) {
                    showUpgradeScreen();
                }
            }

            // Remove ball if out of bounds
            if (ball.y > canvas.height + 100 || ball.x < -100 || ball.x > canvas.width + 100) {
                balls.splice(index, 1);
                if (balls.filter(b => !b.inAir).length === 0) {
                    spawnBall();
                }
            }
        }
    });
}

function showUpgradeScreen() {
    gameState = 'upgrade';
    const allItems = [
        { id: 'stopHoop', name: 'Stop Hoop', description: 'Hoop stays still next round.' },
        { id: 'wideHoop', name: 'Wide Hoop', description: 'Hoop becomes wider next round.' },
        { id: 'doubleShot', name: 'Double Shot', description: 'Shoot two balls at once.' }
    ];
    
    // Pick random upgrades
    upgradeOptions = [];
    const pool = [...allItems];
    for(let i=0; i<3; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        upgradeOptions.push(pool.splice(idx, 1)[0]);
    }

    // Reset items for next round choice
    items = { stopHoop: false, wideHoop: false, doubleShot: false };
}

function handleUpgradeClick(upgradeId) {
    items[upgradeId] = true;
    round++;
    startRound();
}

// --- Drawing ---
function draw() {
    const style = getComputedStyle(document.body);
    const canvasBg = style.getPropertyValue('--canvas-bg') || '#1e293b';
    const textColor = style.getPropertyValue('--text-color') || '#f8fafc';

    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Hoop
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hoop.x - hoop.width / 2, hoop.y);
    ctx.lineTo(hoop.x + hoop.width / 2, hoop.y);
    ctx.stroke();

    // Draw Backboard (visual only)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(hoop.x - 60, hoop.y - 80, 120, 80);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(hoop.x - 60, hoop.y - 80, 120, 80);

    // Draw Drag Line
    if (isDragging) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(dragStartX, dragStartY);
        ctx.lineTo(currentMouseX, currentMouseY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw Balls
    balls.forEach(ball => {
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Basketball lines
        ctx.beginPath();
        ctx.moveTo(ball.x - ball.radius, ball.y);
        ctx.lineTo(ball.x + ball.radius, ball.y);
        ctx.stroke();
    });

    // Draw UI
    ctx.fillStyle = textColor;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Round: ${round}`, 20, 40);
    ctx.fillText(`Score: ${score}`, 20, 70);
    ctx.fillText(`Round Score: ${roundScore} / ${goalScore}`, 20, 100);

    if (gameState === 'upgrade') {
        drawUpgradeScreen(textColor);
    }
}

function drawUpgradeScreen(textColor) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Round Complete!', canvas.width / 2, 150);
    ctx.font = '24px Arial';
    ctx.fillText('Choose an Item for Next Round', canvas.width / 2, 200);

    upgradeOptions.forEach((opt, i) => {
        const x = canvas.width / 2 - 150;
        const y = 250 + i * 100;
        const w = 300;
        const h = 80;

        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(opt.name, canvas.width / 2, y + 35);
        ctx.font = '16px Arial';
        ctx.fillText(opt.description, canvas.width / 2, y + 60);

        opt.clickArea = { x, y, w, h };
    });
}

function handleUpgradeClickDetect(e) {
    if (gameState !== 'upgrade') return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    upgradeOptions.forEach(opt => {
        if (mx > opt.clickArea.x && mx < opt.clickArea.x + opt.clickArea.w &&
            my > opt.clickArea.y && my < opt.clickArea.y + opt.clickArea.h) {
            handleUpgradeClick(opt.id);
        }
    });
}

// --- Game Loop ---
function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function start() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
    canvas.addEventListener('click', handleUpgradeClickDetect);
}

export function stop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('click', handleUpgradeClickDetect);
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
}
