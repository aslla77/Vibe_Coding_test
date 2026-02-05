/*
INSTRUCTIONS FOR ASSETS:
Please download two airplane sprites and place them in the 'assets' folder.
- Name the player sprite 'player.png'.
- Name the enemy sprite 'enemy.png'.
A good source for free sprites is https://opengameart.org. The game will fall back to colored squares if the images are not found.
*/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let gameState = 'playing'; // 'playing', 'upgrade', 'gameOver'
let round = 1;

// --- Asset Loading ---
const playerImg = new Image();
const enemyImg = new Image();
playerImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4_uAAAAAXNSR0IArs4c6QAAAHBJREFUGEFjOHz48B8DE4CgYqyogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4AAAHh70u12p0gAAAAASUVORK5CYII='; // Blue square
enemyImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4_uAAAAAXNSR0IArs4c6QAAAHBJREFUGEFjOHz48B8DE4CgYqyogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4CgYqiogpWVAgaQYjDGAoYYvH379j8DE4AAAHh70u12p0gAAAAASUVORK5CYII='; // Red square
let imagesLoaded = false;

const imageLoadPromise = Promise.all([
    new Promise(res => playerImg.onload = res),
    new Promise(res => enemyImg.onload = res)
]).then(() => {
    imagesLoaded = true;
});


// --- Game Objects ---
let player = {};
let enemy = {};
let playerBullets = [];
let enemyBullets = [];
let upgradeButtons = [];

// --- Input State ---
const keys = { w: false, a: false, s: false, d: false };
const mouse = { x: 0, y: 0, isDown: false };

// --- Game Logic Functions ---

function resetGame() {
    round = 1;
    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 5,
        health: 100,
        maxHealth: 100,
        attackSpeed: 400, // ms between shots
        lastShotTime: 0,
        bulletDamage: 10
    };
    startRound();
}

function startRound() {
    gameState = 'playing';
    const enemyHealth = 100 + (round - 1) * 20;
    const enemySpeed = 3 + (round - 1) * 0.5;

    enemy = {
        x: canvas.width / 2 - 25,
        y: 50,
        width: 50,
        height: 50,
        speed: enemySpeed,
        direction: 1,
        verticalDirection: 0.5,
        health: enemyHealth,
        maxHealth: enemyHealth,
        attackPower: 10 + (round -1) * 2
    };

    playerBullets = [];
    enemyBullets = [];
}

function showUpgradeScreen() {
    gameState = 'upgrade';
    upgradeButtons = [
        { x: 150, y: 250, width: 150, height: 100, text: 'Attack Dmg +5', action: () => player.bulletDamage += 5 },
        { x: 325, y: 250, width: 150, height: 100, text: 'Move Speed +1', action: () => player.speed += 1 },
        { x: 500, y: 250, width: 150, height: 100, text: 'Atk Speed -50ms', action: () => player.attackSpeed = Math.max(100, player.attackSpeed - 50) },
    ];
}


// --- Event Listeners ---

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

canvas.addEventListener('mousedown', () => mouse.isDown = true);
canvas.addEventListener('mouseup', () => mouse.isDown = false);
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    if (gameState === 'gameOver') {
        resetGame();
    } else if (gameState === 'upgrade') {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        upgradeButtons.forEach(button => {
            if (clickX > button.x && clickX < button.x + button.width &&
                clickY > button.y && clickY < button.y + button.height) {
                button.action();
                round++;
                startRound();
            }
        });
    }
});

function playerShoot() {
    const now = Date.now();
    if (mouse.isDown && now - player.lastShotTime > player.attackSpeed) {
        player.lastShotTime = now;
        const angle = Math.atan2(mouse.y - (player.y + player.height / 2), mouse.x - (player.x + player.width / 2));
        playerBullets.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, width: 5, height: 5, color: '#FFFF00', velocityX: Math.cos(angle) * 7, velocityY: Math.sin(angle) * 7 });
    }
}

function enemyShoot() {
    if (gameState === 'playing') {
        const angle = Math.atan2((player.y + player.height / 2) - (enemy.y + enemy.height / 2), (player.x + player.width / 2) - (enemy.x + enemy.width / 2));
        enemyBullets.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, width: 5, height: 5, color: '#FF851B', velocityX: Math.cos(angle) * 7, velocityY: Math.sin(angle) * 7 });
    }
}

setInterval(enemyShoot, 2000);

// --- Update & Draw ---

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function update() {
    if (gameState !== 'playing') return;

    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;

    enemy.x += enemy.speed * enemy.direction;
    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) enemy.direction *= -1;
    if (round >= 2) {
        enemy.y += enemy.speed * enemy.verticalDirection * 0.5;
        if (enemy.y <= 0 || enemy.y + enemy.height >= canvas.height / 2) enemy.verticalDirection *= -1;
    }

    playerShoot();

    playerBullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        if (checkCollision(bullet, enemy)) {
            playerBullets.splice(index, 1);
            enemy.health -= player.bulletDamage;
            if (enemy.health <= 0) showUpgradeScreen();
        } else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            playerBullets.splice(index, 1);
        }
    });

    enemyBullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        if (checkCollision(bullet, player)) {
            enemyBullets.splice(index, 1);
            player.health -= enemy.attackPower;
            if (player.health <= 0) gameState = 'gameOver';
        } else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });
}

function drawHealthBar(x, y, width, health, maxHealth, color) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, 10);
    const healthWidth = (health / maxHealth) * width;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(0, healthWidth), 10);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        if (imagesLoaded && !fallbackToSquares) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = '#00A0FF';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.fillStyle = '#FF4136';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }

        drawHealthBar(player.x, player.y - 15, player.width, player.health, player.maxHealth, '#00FF00');
        drawHealthBar(enemy.x, enemy.y - 15, enemy.width, enemy.health, enemy.maxHealth, '#FF0000');

        playerBullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); });
        enemyBullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); });

        ctx.fillStyle = '#FFF';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Round: ${round}`, 10, 30);

    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';

        if (gameState === 'gameOver') {
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px sans-serif';
            ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 40);
        } else if (gameState === 'upgrade') {
            ctx.fillText(`Round ${round} Complete!`, canvas.width / 2, 150);
            ctx.font = '30px sans-serif';
            ctx.fillText('Choose an Upgrade', canvas.width / 2, 200);

            upgradeButtons.forEach(button => {
                ctx.fillStyle = '#555';
                ctx.fillRect(button.x, button.y, button.width, button.height);
                ctx.fillStyle = '#FFF';
                ctx.font = '18px sans-serif';
                ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 5);
            });
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Wait for image loading before starting the game
imageLoadPromise.finally(() => {
    resetGame();
    gameLoop();
});
