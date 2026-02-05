const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

let gameState = 'playing'; // 'playing', 'gameOver', 'youWin'

// Game Objects
let player = {};
let enemy = {};
let playerBullets = [];
let enemyBullets = [];

const bulletSpeed = 7;
const keys = { w: false, a: false, s: false, d: false };

function initGame() {
    gameState = 'playing';

    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        color: '#00A0FF',
        speed: 5,
        health: 100,
        maxHealth: 100
    };

    enemy = {
        x: canvas.width / 2 - 25,
        y: 50,
        width: 50,
        height: 50,
        color: '#FF4136',
        speed: 3,
        direction: 1,
        health: 100,
        maxHealth: 100
    };

    playerBullets = [];
    enemyBullets = [];
}


// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
});

canvas.addEventListener('click', (e) => {
    if (gameState === 'playing') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const angle = Math.atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));
        playerBullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 5,
            height: 5,
            color: '#FFFF00',
            velocityX: Math.cos(angle) * bulletSpeed,
            velocityY: Math.sin(angle) * bulletSpeed
        });
    } else {
        initGame(); // Restart game on click
    }
});

function enemyShoot() {
    if (gameState === 'playing') {
        const angle = Math.atan2((player.y + player.height / 2) - (enemy.y + enemy.height / 2), (player.x + player.width / 2) - (enemy.x + enemy.width / 2));
        enemyBullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            width: 5,
            height: 5,
            color: '#FF851B',
            velocityX: Math.cos(angle) * bulletSpeed,
            velocityY: Math.sin(angle) * bulletSpeed
        });
    }
}

let enemyShootInterval = setInterval(enemyShoot, 2000);

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    if (gameState !== 'playing') return;

    // Player movement
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;

    // Enemy movement
    enemy.x += enemy.speed * enemy.direction;
    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.direction *= -1;
    }

    // Update player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        if (checkCollision(bullet, enemy)) {
            playerBullets.splice(i, 1);
            enemy.health -= 10;
            if (enemy.health <= 0) {
                gameState = 'youWin';
            }
        } else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            playerBullets.splice(i, 1);
        }
    }

    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        if (checkCollision(bullet, player)) {
            enemyBullets.splice(i, 1);
            player.health -= 10;
            if (player.health <= 0) {
                gameState = 'gameOver';
            }
        } else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

function drawHealthBar(x, y, width, height, health, maxHealth, color) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    const healthWidth = (health / maxHealth) * width;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, healthWidth > 0 ? healthWidth : 0, height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        // Draw player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        drawHealthBar(player.x, player.y - 15, player.width, 10, player.health, player.maxHealth, '#00FF00');

        // Draw enemy
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        drawHealthBar(enemy.x, enemy.y - 15, enemy.width, 10, enemy.health, enemy.maxHealth, '#FF0000');


        // Draw bullets
        playerBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        enemyBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        if (gameState === 'gameOver') {
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        }
        ctx.font = '20px sans-serif';
        ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
