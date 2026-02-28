// airplaneGame.js - 2D Dogfight Game Logic

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game state variables
let gameState = 'selectAircraft'; // 'selectAircraft', 'playing', 'upgrade', 'gameOver'
let round = 1;
let selectedAircraft = ''; 

// Aircraft types data
const AIRCRAFT_TYPES = [
    { id: 'square', name: 'Standard (Bullet)', color: '#007BFF', description: 'Fires fast bullets.' },
    { id: 'triangle', name: 'Interceptor (Laser)', color: '#FFD700', description: 'Fires instant laser beams.' },
    { id: 'circle', name: 'Striker (Boomerang)', color: '#90EE90', description: 'Throws returning boomerangs.' }
];

let selectionButtons = [];

// Helper for line-rectangle intersection
function lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const left = lineLineIntersect(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    const right = lineLineIntersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    const top = lineLineIntersect(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    const bottom = lineLineIntersect(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

    if (left || right || top || bottom) return true;
    if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
    if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
    return false;
}

function lineLineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

// Player and Enemy objects
let player = {};
let enemy = {};
let playerBullets = [];
let enemyBullets = [];
let visualLasers = [];
let boomerangs = [];
let obstacles = [];
let upgradeOptions = [];

const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false
};
const mouse = { x: 0, y: 0, isDown: false };

// --- Game Initialization ---
export function init(containerElement, gameOptions) {
    gameContainer = containerElement;
    gameState = 'selectAircraft';

    canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
}

function handleKeyDown(e) {
    const key = e.key;
    if (key in keys) keys[key] = true;
}

function handleKeyUp(e) {
    const key = e.key;
    if (key in keys) keys[key] = false;
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}

function handleMouseDown(e) {
    mouse.isDown = true;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (gameState === 'selectAircraft') {
        selectionButtons.forEach(button => {
            if (clickX >= button.x && clickX <= button.x + button.width &&
                clickY >= button.y && clickY <= button.y + button.height) {
                selectedAircraft = button.id;
                initGame();
                gameState = 'playing';
            }
        });
    } else if (gameState === 'gameOver') {
        stop();
        window.dispatchEvent(new CustomEvent('gameStopped'));
    } else if (gameState === 'upgrade') {
        upgradeOptions.forEach(option => {
            if (clickX >= option.x && clickX <= option.x + option.width &&
                clickY >= option.y && clickY <= option.y + option.height) {
                option.action();
                round++;
                startRound();
            }
        });
    }
}

function handleMouseUp() {
    mouse.isDown = false;
}

function initGame() {
    round = 1;
    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 70,
        width: 50,
        height: 50,
        speed: 5,
        health: 100,
        maxHealth: 100,
        bulletDamage: 10,
        fireRate: 300,
        lastShotTime: 0,
        type: selectedAircraft,
        maxBoomerangDistance: 250
    };
    startRound();
}

export function start() {
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function stop() {
    cancelAnimationFrame(animationFrameId);
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
}

function startRound() {
    gameState = 'playing';
    enemy = {
        x: canvas.width / 2 - 25,
        y: 50,
        width: 60,
        height: 60,
        speed: 3 + (round - 1) * 0.3,
        health: 100 + (round - 1) * 20,
        maxHealth: 100 + (round - 1) * 20,
        attackPower: 10 + (round - 1) * 2,
        fireRate: Math.max(500, 2000 - (round - 1) * 100),
        lastShotTime: 0,
        targetX: Math.random() * (canvas.width - 60),
        targetY: Math.random() * (canvas.height / 2 - 60),
        targetUpdateTimer: 0
    };

    playerBullets = [];
    enemyBullets = [];
    visualLasers = [];
    boomerangs = [];
    obstacles = generateObstacles(round);

    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 70;
    player.health = player.maxHealth;
}

function generateObstacles(currentRound) {
    const newObstacles = [];
    if (currentRound >= 3) {
        const numObstacles = Math.min(5, Math.floor((currentRound - 2) / 2) + 1);
        for (let i = 0; i < numObstacles; i++) {
            newObstacles.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height / 2) + canvas.height / 4,
                width: Math.random() * 80 + 40,
                height: Math.random() * 80 + 40,
                color: '#607D8B'
            });
        }
    }
    return newObstacles;
}

function showUpgradeScreen() {
    gameState = 'upgrade';
    upgradeOptions = [
        { text: 'Increase Damage', action: () => player.bulletDamage += 5 },
        { text: 'Increase Fire Rate', action: () => player.fireRate = Math.max(50, player.fireRate - 25) },
        { text: 'Increase Max Health', action: () => { player.maxHealth += 20; player.health += 20; } },
        { text: 'Increase Speed', action: () => player.speed += 1 },
        { text: 'Increase Boomerang Range', action: () => player.maxBoomerangDistance += 50 }
    ];
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    if (gameState !== 'playing') return;

    const now = Date.now();

    if (keys.ArrowUp || keys.w) player.y = Math.max(0, player.y - player.speed);
    if (keys.ArrowDown || keys.s) player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    if (keys.ArrowLeft || keys.a) player.x = Math.max(0, player.x - player.speed);
    if (keys.ArrowRight || keys.d) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            const dx = (player.x + player.width / 2) - (obstacle.x + obstacle.width / 2);
            const dy = (player.y + player.height / 2) - (obstacle.y + obstacle.height / 2);
            if (Math.abs(dx) > Math.abs(dy)) {
                player.x = dx > 0 ? obstacle.x + obstacle.width : obstacle.x - player.width;
            } else {
                player.y = dy > 0 ? obstacle.y + obstacle.height : obstacle.y - player.height;
            }
        }
    });

    if (mouse.isDown && now - player.lastShotTime > player.fireRate) {
        player.lastShotTime = now;
        const angle = Math.atan2(mouse.y - (player.y + player.height / 2), mouse.x - (player.x + player.width / 2));

        if (player.type === 'square') {
            playerBullets.push({
                x: player.x + player.width / 2, y: player.y + player.height / 2,
                width: 8, height: 8, color: '#00BFFF',
                velocityX: Math.cos(angle) * 12, velocityY: Math.sin(angle) * 12,
                damage: player.bulletDamage
            });
        } else if (player.type === 'triangle') {
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const laserDist = 1500;
            const laserEndX = playerCenterX + Math.cos(angle) * laserDist;
            const laserEndY = playerCenterY + Math.sin(angle) * laserDist;

            if (lineRectIntersect(playerCenterX, playerCenterY, laserEndX, laserEndY, enemy.x, enemy.y, enemy.width, enemy.height)) {
                enemy.health -= player.bulletDamage * 0.5;
                if (enemy.health <= 0) showUpgradeScreen();
            }
            visualLasers.push({ x1: playerCenterX, y1: playerCenterY, x2: laserEndX, y2: laserEndY, color: '#FFD700', life: 5 });
        } else if (player.type === 'circle') {
            if (boomerangs.length === 0) {
                boomerangs.push({
                    x: player.x + player.width / 2, y: player.y + player.height / 2,
                    width: 20, height: 10, color: '#90EE90',
                    velocityX: Math.cos(angle) * 10, velocityY: Math.sin(angle) * 10,
                    damage: player.bulletDamage * 2, state: 'out',
                    maxDistance: player.maxBoomerangDistance, distanceTraveled: 0,
                    rotation: 0, canDamage: true
                });
            }
        }
    }

    if (now - enemy.targetUpdateTimer > 2000) {
        enemy.targetX = Math.random() * (canvas.width - enemy.width);
        enemy.targetY = Math.random() * (canvas.height / 2 - enemy.height);
        enemy.targetUpdateTimer = now;
    }

    const dx_e = enemy.targetX - enemy.x;
    const dy_e = enemy.targetY - enemy.y;
    const dist_e = Math.sqrt(dx_e * dx_e + dy_e * dy_e);
    if (dist_e > 1) {
        enemy.x += (dx_e / dist_e) * enemy.speed;
        enemy.y += (dy_e / dist_e) * enemy.speed;
    }

    if (now - enemy.lastShotTime > enemy.fireRate) {
        enemy.lastShotTime = now;
        const angle = Math.atan2((player.y + player.height / 2) - (enemy.y + enemy.height / 2), (player.x + player.width / 2) - (enemy.x + enemy.width / 2));
        enemyBullets.push({
            x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2,
            width: 10, height: 10, color: '#FF4136',
            velocityX: Math.cos(angle) * 8, velocityY: Math.sin(angle) * 8,
            damage: enemy.attackPower
        });
    }

    boomerangs.forEach((b, i) => {
        b.x += b.velocityX; b.y += b.velocityY; b.rotation += 0.3;
        b.distanceTraveled += Math.sqrt(b.velocityX**2 + b.velocityY**2);
        if (b.state === 'out' && b.distanceTraveled >= b.maxDistance) {
            b.state = 'returning';
            b.canDamage = true;
        }
        if (b.state === 'returning') {
            const angle = Math.atan2((player.y + player.height / 2) - b.y, (player.x + player.width / 2) - b.x);
            b.velocityX = Math.cos(angle) * 12; b.velocityY = Math.sin(angle) * 12;
            if (checkCollision(b, player)) boomerangs.splice(i, 1);
        }
        if (b.canDamage && checkCollision(b, enemy)) {
            enemy.health -= b.damage; b.canDamage = false;
            if (enemy.health <= 0) showUpgradeScreen();
        }
    });

    playerBullets.forEach((b, i) => {
        b.x += b.velocityX; b.y += b.velocityY;
        if (checkCollision(b, enemy)) {
            enemy.health -= b.damage; playerBullets.splice(i, 1);
            if (enemy.health <= 0) showUpgradeScreen();
        } else if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            playerBullets.splice(i, 1);
        }
    });

    enemyBullets.forEach((b, i) => {
        b.x += b.velocityX; b.y += b.velocityY;
        if (checkCollision(b, player)) {
            player.health -= b.damage; enemyBullets.splice(i, 1);
            if (player.health <= 0) gameState = 'gameOver';
        } else if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    });
}

function drawPlayer(obj) {
    ctx.fillStyle = obj.type === 'square' ? '#007BFF' : (obj.type === 'triangle' ? '#FFD700' : '#90EE90');
    if (obj.type === 'square') {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    } else if (obj.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width / 2, obj.y);
        ctx.lineTo(obj.x, obj.y + obj.height);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'selectAircraft') {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Select Your Aircraft', canvas.width / 2, 150);

        selectionButtons = [];
        const btnW = 250; const btnH = 200;
        AIRCRAFT_TYPES.forEach((type, i) => {
            const x = (canvas.width / 2 - 400) + i * 300;
            const y = 250;
            ctx.fillStyle = '#222';
            ctx.fillRect(x, y, btnW, btnH);
            ctx.strokeStyle = type.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, btnW, btnH);

            ctx.fillStyle = type.color;
            ctx.font = '24px Arial';
            ctx.fillText(type.name, x + btnW / 2, y + 40);

            // Draw icon
            const iconX = x + btnW / 2 - 25;
            const iconY = y + 70;
            if (type.id === 'square') ctx.fillRect(iconX, iconY, 50, 50);
            else if (type.id === 'triangle') {
                ctx.beginPath(); ctx.moveTo(iconX + 25, iconY); ctx.lineTo(iconX, iconY + 50); ctx.lineTo(iconX + 50, iconY + 50); ctx.closePath(); ctx.fill();
            } else {
                ctx.beginPath(); ctx.arc(iconX + 25, iconY + 25, 25, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(type.description, x + btnW / 2, y + 160);

            selectionButtons.push({ id: type.id, x, y, width: btnW, height: btnH });
        });
    } else if (gameState === 'playing' || gameState === 'upgrade' || gameState === 'gameOver') {
        drawPlayer(player);
        ctx.fillStyle = '#FFD700'; // Star enemy
        const ex = enemy.x + enemy.width/2; const ey = enemy.y + enemy.height/2; const r = enemy.width/2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = Math.PI/5 * i;
            const rad = i % 2 === 0 ? r : r/2.5;
            ctx.lineTo(ex + rad * Math.sin(angle), ey - rad * Math.cos(angle));
        }
        ctx.closePath(); ctx.fill();

        playerBullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); });
        enemyBullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); });
        boomerangs.forEach(b => {
            ctx.save(); ctx.translate(b.x + b.width/2, b.y + b.height/2); ctx.rotate(b.rotation);
            ctx.fillStyle = b.color; ctx.fillRect(-b.width/2, -b.height/4, b.width, b.height/2); ctx.fillRect(-b.width/4, -b.height/2, b.width/2, b.height);
            ctx.restore();
        });
        visualLasers.forEach((l, i) => {
            ctx.strokeStyle = l.color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
            l.life--; if (l.life <= 0) visualLasers.splice(i, 1);
        });
        obstacles.forEach(o => { ctx.fillStyle = o.color; ctx.fillRect(o.x, o.y, o.width, o.height); });

        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
        ctx.fillStyle = textColor; ctx.font = '20px Arial'; ctx.textAlign = 'left';
        ctx.fillText(`Round: ${round} | Health: ${Math.floor(player.health)}`, 10, 30);
        ctx.textAlign = 'right';
        ctx.fillText(`Enemy: ${Math.floor(enemy.health)}`, canvas.width - 10, 30);

        if (gameState === 'gameOver') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = 'white'; ctx.font = '48px Arial'; ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
            ctx.font = '24px Arial'; ctx.fillText('Click to Return to Menu', canvas.width/2, canvas.height/2 + 50);
        } else if (gameState === 'upgrade') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = 'white'; ctx.font = '36px Arial'; ctx.textAlign = 'center';
            ctx.fillText('Choose Upgrade', canvas.width/2, 200);
            upgradeOptions.forEach((o, i) => {
                const x = (canvas.width - 1000) / 2 + i * 210; const y = 300;
                ctx.fillStyle = '#007BFF'; ctx.fillRect(x, y, 200, 60);
                ctx.fillStyle = 'white'; ctx.font = '18px Arial'; ctx.fillText(o.text, x + 100, y + 35);
                o.x = x; o.y = y; o.width = 200; o.height = 60;
            });
        }
    }
}

function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}
