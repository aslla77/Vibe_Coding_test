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
const BALL_RADIUS = 25;

// Mouse/Interaction variables
let isCharging = false;
let currentPower = 0;
let powerDirection = 1;
let chargeStartTime = 0;
const MAX_POWER = 25;
const MIN_POWER = 5;
const POWER_SPEED = 0.4; // Speed of power oscillation

let dragStartX, dragStartY;
let currentMouseX, currentMouseY;

// Hoop variables
let hoop = {
    x: 500,
    y: 150,
    width: 120,
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
    hoop.width = 120;
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
    
    if (round > 1) {
        hoop.speed = Math.min(10, (round - 1) * 1.5);
    } else {
        hoop.speed = 0;
    }

    if (items.stopHoop) {
        hoop.isStopped = true;
        hoop.speed = 0;
    } else {
        hoop.isStopped = false;
    }

    if (items.wideHoop) {
        hoop.width = 180;
    } else {
        hoop.width = 120;
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

    const ball = balls.find(b => !b.inAir);
    if (ball) {
        const dist = Math.sqrt((mx - ball.x) ** 2 + (my - ball.y) ** 2);
        if (dist < ball.radius * 3) { // Larger hit area for easier starting
            isCharging = true;
            currentPower = MIN_POWER;
            powerDirection = 1;
            dragStartX = ball.x;
            dragStartY = ball.y;
        }
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    currentMouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    currentMouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

function handleMouseUp(e) {
    if (!isCharging) return;
    isCharging = false;

    const ball = balls.find(b => !b.inAir);
    if (ball) {
        // Shooting direction based on current mouse position relative to ball
        const angle = Math.atan2(currentMouseY - dragStartY, currentMouseX - dragStartX);
        
        // Reverse direction for more natural "pull back and shoot" or just "aim and power"
        // Let's use "aim and power": Mouse position determines direction, oscillating bar determines speed.
        ball.vx = Math.cos(angle) * currentPower;
        ball.vy = Math.sin(angle) * currentPower;
        ball.inAir = true;

        if (items.doubleShot) {
            balls.push({
                x: ball.x + 40,
                y: ball.y,
                vx: ball.vx,
                vy: ball.vy,
                radius: ball.radius,
                inAir: true,
                isScored: false
            });
        }

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

    // Update Power Bar Oscillation
    if (isCharging) {
        currentPower += POWER_SPEED * powerDirection * 25; // Increase speed of change
        if (currentPower >= MAX_POWER) {
            currentPower = MAX_POWER;
            powerDirection = -1;
        } else if (currentPower <= MIN_POWER) {
            currentPower = MIN_POWER;
            powerDirection = 1;
        }
    }

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

            // Check Score (More robust check)
            if (!ball.isScored && ball.vy > 0 && 
                ball.y > hoop.y - 10 && ball.y < hoop.y + 10 &&
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
    
    upgradeOptions = [];
    const pool = [...allItems];
    for(let i=0; i<3 && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        upgradeOptions.push(pool.splice(idx, 1)[0]);
    }

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

    // Draw Backboard
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(hoop.x - 70, hoop.y - 100, 140, 100);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(hoop.x - 70, hoop.y - 100, 140, 100);
    ctx.strokeRect(hoop.x - 30, hoop.y - 60, 60, 40);

    // Draw Rim (The Ring)
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 8;
    ctx.beginPath();
    // Use ellipse for a 3D perspective rim
    ctx.ellipse(hoop.x, hoop.y, hoop.width / 2, 15, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Net
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i = -hoop.width/2; i <= hoop.width/2; i += 20) {
        ctx.moveTo(hoop.x + i, hoop.y);
        ctx.lineTo(hoop.x + i * 0.7, hoop.y + 60);
    }
    ctx.stroke();

    // Draw Aiming Line
    if (isCharging) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(dragStartX, dragStartY);
        ctx.lineTo(currentMouseX, currentMouseY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Power Bar next to the ball
        const barX = dragStartX + 50;
        const barY = dragStartY - 50;
        const barW = 20;
        const barH = 100;
        
        // Bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barW, barH);
        
        // Bar fill
        const fillHeight = ((currentPower - MIN_POWER) / (MAX_POWER - MIN_POWER)) * barH;
        const hue = 120 - (fillHeight / barH) * 120; // Green to Red
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(barX, barY + barH - fillHeight, barW, fillHeight);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);
    }

    // Draw Balls
    balls.forEach(ball => {
        // Ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(ball.x, canvas.height - 20, ball.radius * (ball.y / canvas.height), 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Basketball texture lines
        ctx.beginPath();
        ctx.moveTo(ball.x - ball.radius, ball.y);
        ctx.lineTo(ball.x + ball.radius, ball.y);
        ctx.moveTo(ball.x, ball.y - ball.radius);
        ctx.lineTo(ball.x, ball.y + ball.radius);
        ctx.stroke();
    });

    // Draw UI
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`ROUND: ${round}`, 20, 40);
    ctx.fillText(`SCORE: ${score}`, 20, 70);
    ctx.fillText(`GOAL: ${roundScore} / ${goalScore}`, 20, 100);

    if (gameState === 'upgrade') {
        drawUpgradeScreen(textColor);
    }
}

function drawUpgradeScreen(textColor) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ROUND COMPLETE!', canvas.width / 2, 150);
    ctx.font = '24px Arial';
    ctx.fillText('Choose an Item for Next Round', canvas.width / 2, 200);

    upgradeOptions.forEach((opt, i) => {
        const x = canvas.width / 2 - 200;
        const y = 250 + i * 110;
        const w = 400;
        const h = 90;

        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x, y, w, h);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(opt.name, canvas.width / 2, y + 40);
        ctx.font = '18px Arial';
        ctx.fillText(opt.description, canvas.width / 2, y + 70);

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
