// main.js - Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 700;

// Game state variables
let gameState = 'start'; // 'start', 'playing', 'upgrade', 'gameOver'
let round = 1;

// Player and Enemy objects (placeholder for now)
let player = {};
let enemy = {};
let playerBullets = [];
let enemyBullets = [];
let obstacles = [];
let upgradeOptions = [];


// Input state
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false // Also allow WASD for convenience
};
const mouse = { x: 0, y: 0, isDown: false };

// --- Game Initialization ---
function initGame() {
    // Reset all game variables for a new game
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
        fireRate: 300, // ms between shots
        lastShotTime: 0
    };
    startRound();
}

// --- Round Management ---
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
        fireRate: Math.max(500, 2000 - (round - 1) * 100), // Enemy shoots faster
        lastShotTime: 0,
        direction: 1 // 1 for right, -1 for left
    };

    playerBullets = [];
    enemyBullets = [];
    obstacles = generateObstacles(round);

    // Reset player's position and health for the new round
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 70;
    player.health = player.maxHealth;

    // Player stats scale with rounds to keep it a "control fight"
    player.bulletDamage = 10 + (round - 1) * 2;
    player.speed = 5 + Math.floor((round - 1) / 3); // Every 3 rounds, speed increases
    player.fireRate = Math.max(100, 300 - (round - 1) * 10); // Player shoots faster
}

function generateObstacles(currentRound) {
    const newObstacles = [];
    if (currentRound >= 3) { // Start introducing obstacles from round 3
        const numObstacles = Math.min(5, Math.floor((currentRound - 2) / 2) + 1); // Max 5 obstacles
        for (let i = 0; i < numObstacles; i++) {
            newObstacles.push({
                x: Math.random() * (canvas.width - 100) + 50,
                y: Math.random() * (canvas.height / 2) + canvas.height / 4, // Middle section of the canvas
                width: Math.random() * 80 + 40,
                height: Math.random() * 80 + 40,
                color: '#607D8B' // Greyish blue
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
        { text: 'Increase Speed', action: () => player.speed += 1 }
    ];
}

// --- Input Handling ---
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key in keys) keys[key] = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key;
    if (key in keys) keys[key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
    mouse.isDown = true;
    if (gameState === 'start' || gameState === 'gameOver') {
        initGame();
    } else if (gameState === 'upgrade') {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        upgradeOptions.forEach(option => {
            if (
                clickX >= option.x &&
                clickX <= option.x + option.width &&
                clickY >= option.y &&
                clickY <= option.y + option.height
            ) {
                option.action(); // Perform the upgrade
                round++;
                startRound();
            }
        });
    }
});

canvas.addEventListener('mouseup', () => {
    mouse.isDown = false;
});


// --- Collision Detection ---
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// --- Update Game State ---
function update() {
    if (gameState !== 'playing') return;

    // Player Movement
    if (keys.ArrowUp || keys.w) player.y = Math.max(0, player.y - player.speed);
    if (keys.ArrowDown || keys.s) player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    if (keys.ArrowLeft || keys.a) player.x = Math.max(0, player.x - player.speed);
    if (keys.ArrowRight || keys.d) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

    // Prevent player from moving through obstacles
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            // Simple repulsion - can be improved for better physics
            const dx = (player.x + player.width / 2) - (obstacle.x + obstacle.width / 2);
            const dy = (player.y + player.height / 2) - (obstacle.y + obstacle.height / 2);
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) player.x = obstacle.x + obstacle.width;
                else player.x = obstacle.x - player.width;
            } else {
                if (dy > 0) player.y = obstacle.y + obstacle.height;
                else player.y = obstacle.y - player.height;
            }
        }
    });


    // Player Shooting
    const now = Date.now();
    if (mouse.isDown && now - player.lastShotTime > player.fireRate) {
        player.lastShotTime = now;
        const angle = Math.atan2(mouse.y - (player.y + player.height / 2), mouse.x - (player.x + player.width / 2));
        playerBullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 8, height: 8,
            color: '#00BFFF', // Deep Sky Blue
            velocityX: Math.cos(angle) * 10,
            velocityY: Math.sin(angle) * 10,
            damage: player.bulletDamage
        });
    }

    // Enemy Movement (Simple horizontal for now)
    enemy.x += enemy.speed * enemy.direction;
    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.direction *= -1;
    }

    // Enemy Shooting (towards player)
    if (now - enemy.lastShotTime > enemy.fireRate) {
        enemy.lastShotTime = now;
        const angle = Math.atan2(
            (player.y + player.height / 2) - (enemy.y + enemy.height / 2),
            (player.x + player.width / 2) - (enemy.x + enemy.width / 2)
        );
        enemyBullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            width: 10, height: 10,
            color: '#FF4136', // Red
            velocityX: Math.cos(angle) * 8,
            velocityY: Math.sin(angle) * 8,
            damage: enemy.attackPower
        });
    }

    // Update Player Bullets
    playerBullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        // Check collision with enemy
        if (checkCollision(bullet, enemy)) {
            enemy.health -= bullet.damage;
            playerBullets.splice(index, 1);
            if (enemy.health <= 0) {
                round++;
                showUpgradeScreen();
            }
        }
        // Remove if out of bounds
        else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            playerBullets.splice(index, 1);
        }
    });

    // Update Enemy Bullets
    enemyBullets.forEach((bullet, index) => {
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        // Check collision with player
        if (checkCollision(bullet, player)) {
            player.health -= bullet.damage;
            enemyBullets.splice(index, 1);
            if (player.health <= 0) {
                gameState = 'gameOver';
            }
        }
        // Remove if out of bounds
        else if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });

    // Remove bullets that hit obstacles (simplified, just remove them)
    playerBullets.forEach((bullet, bIndex) => {
        obstacles.forEach(obstacle => {
            if (checkCollision(bullet, obstacle)) {
                playerBullets.splice(bIndex, 1); // Remove bullet
            }
        });
    });
    enemyBullets.forEach((bullet, bIndex) => {
        obstacles.forEach(obstacle => {
            if (checkCollision(bullet, obstacle)) {
                enemyBullets.splice(bIndex, 1); // Remove bullet
            }
        });
    });
}

// --- Drawing Functions ---
function drawHealthBar(obj, x, y, width, height, color) {
    ctx.fillStyle = '#333'; // Background of health bar
    ctx.fillRect(x, y, width, height);

    const healthWidth = (obj.health / obj.maxHealth) * width;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(0, healthWidth), height); // Ensure health bar doesn't go below 0
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, width, height);
}

// Function to draw an equilateral triangle for the player (pointing up)
function drawPlayerTriangle(playerObj, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(playerObj.x + playerObj.width / 2, playerObj.y);
    ctx.lineTo(playerObj.x, playerObj.y + playerObj.height);
    ctx.lineTo(playerObj.x + playerObj.width, playerObj.y + playerObj.height);
    ctx.closePath();
    ctx.fill();
}

// Function to draw an equilateral triangle for the enemy (pointing down)
function drawEnemyTriangle(enemyObj, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(enemyObj.x + enemyObj.width / 2, enemyObj.y + enemyObj.height);
    ctx.lineTo(enemyObj.x, enemyObj.y);
    ctx.lineTo(enemyObj.x + enemyObj.width, enemyObj.y);
    ctx.closePath();
    ctx.fill();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (gameState === 'start') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('2D Dogfight', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 20);
    } else if (gameState === 'playing') {
        // Draw Player
        drawPlayerTriangle(player, '#007BFF'); // Blue
        drawHealthBar(player, player.x, player.y - 15, player.width, 10, '#28a745'); // Green health bar

        // Draw Enemy
        drawEnemyTriangle(enemy, '#DC3545'); // Red
        drawHealthBar(enemy, enemy.x, enemy.y - 15, enemy.width, 10, '#DC3545'); // Red health bar

        // Draw Player Bullets
        playerBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw Enemy Bullets
        enemyBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw Obstacles
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw UI
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Round: ${round}`, 10, 30);
        ctx.fillText(`Player Health: ${player.health}/${player.maxHealth}`, 10, 60);

    } else if (gameState === 'gameOver') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText(`You reached Round ${round}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);
    } else if (gameState === 'upgrade') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Round ${round -1} Complete!`, canvas.width / 2, canvas.height / 2 - 100);
        ctx.font = '36px Arial';
        ctx.fillText('Choose Your Upgrade:', canvas.width / 2, canvas.height / 2 - 40);

        const buttonWidth = 200;
        const buttonHeight = 60;
        const startX = (canvas.width - (upgradeOptions.length * (buttonWidth + 20) - 20)) / 2;
        upgradeOptions.forEach((option, index) => {
            const x = startX + index * (buttonWidth + 20);
            const y = canvas.height / 2 + 20;

            ctx.fillStyle = '#007BFF'; // Blue button
            ctx.fillRect(x, y, buttonWidth, buttonHeight);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(x, y, buttonWidth, buttonHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText(option.text, x + buttonWidth / 2, y + buttonHeight / 2 + 7);

            // Store button positions for click detection
            option.x = x;
            option.y = y;
            option.width = buttonWidth;
            option.height = buttonHeight;
        });
    }
}

// --- Game Loop ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initial call to start the game loop
requestAnimationFrame(gameLoop);