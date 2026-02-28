// tetrisGame.js - Tetris Game Logic

let canvas;
let ctx;
let gameContainer;
let animationFrameId;
let dropInterval;

// Game board dimensions
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Size of each block in pixels

// Game board
let board = [];

// Tetrominoes shapes
const TETROMINOES = {
    'I': [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    'J': [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    'L': [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    'Z': [[1, 1, 0], [0, 1, 1], [0, 0, 0]]
};

const COLORS = {
    'I': 'cyan',
    'J': 'blue',
    'L': 'orange',
    'O': 'yellow',
    'S': 'green',
    'T': 'purple',
    'Z': 'red'
};

let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let linesCleared = 0;
let gameOver = false;

// Last time the piece dropped
let lastDropTime = 0;
const DROP_SPEEDS = {
    1: 1000, // 1 second
    2: 800,
    3: 600,
    4: 400,
    5: 200
};

// --- Helper Functions ---
function generateRandomPiece() {
    const keys = Object.keys(TETROMINOES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const shape = TETROMINOES[randomKey];
    const color = COLORS[randomKey];
    return {
        shape: shape,
        color: color,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

function rotatePiece(piece) {
    // Transpose matrix
    const newShape = piece.shape[0].map((_, colIndex) => piece.shape.map(row => row[colIndex]));
    // Reverse each row for 90 degree rotation
    return newShape.map(row => row.reverse());
}

function isValidMove(piece, offsetX = 0, offsetY = 0, newShape = piece.shape) {
    for (let r = 0; r < newShape.length; r++) {
        for (let c = 0; c < newShape[r].length; c++) {
            if (newShape[r][c] !== 0) {
                const newX = piece.x + c + offsetX;
                const newY = piece.y + r + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false; // Out of bounds
                }
                if (newY < 0) { // Allow pieces to form above the board
                    continue;
                }
                if (board[newY][newX] !== 0) {
                    return false; // Collision with existing block
                }
            }
        }
    }
    return true;
}

function placePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] !== 0) {
                if (currentPiece.y + r < 0) { // Game over if piece lands above the board
                    gameOver = true;
                    return;
                }
                board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
            }
        }
    }
    clearLines();
    currentPiece = nextPiece;
    nextPiece = generateRandomPiece();

    if (!isValidMove(currentPiece)) { // Game over if new piece immediately collides
        gameOver = true;
    }
}

function clearLines() {
    let linesToClear = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            // This row is full, clear it
            for (let i = r; i > 0; i--) {
                board[i] = [...board[i - 1]];
            }
            board[0] = Array(COLS).fill(0); // Top row becomes empty
            linesToClear++;
            r++; // Check the new row that has fallen into this position
        }
    }
    if (linesToClear > 0) {
        score += linesToClear * 100 * level; // Basic scoring
        linesCleared += linesToClear;
        if (linesCleared >= level * 10 && level < 5) { // Level up every 10 lines, max level 5
            level++;
            console.log('Level Up! New Level:', level);
        }
    }
}


// --- Event Handlers ---
function handleKeyDown(e) {
    if (gameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(currentPiece, -1, 0)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (isValidMove(currentPiece, 1, 0)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
            } else {
                placePiece();
            }
            lastDropTime = performance.now(); // Reset drop timer on manual drop
            break;
        case 'ArrowUp': // Rotate
            const rotated = rotatePiece(currentPiece);
            if (isValidMove(currentPiece, 0, 0, rotated)) {
                currentPiece.shape = rotated;
            }
            break;
        case ' ': // Hard drop
            while (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
            }
            placePiece();
            lastDropTime = performance.now(); // Reset drop timer on hard drop
            break;
    }
}

// --- Game Initialization ---
export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);

    resetGame();
}

function resetGame() {
    board = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    currentPiece = generateRandomPiece();
    nextPiece = generateRandomPiece();
    score = 0;
    level = 1;
    linesCleared = 0;
    gameOver = false;
    lastDropTime = 0;
}

// --- Start and Stop functions for the game manager ---
export function start() {
    console.log('Tetris Game Started');
    resetGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function stop() {
    console.log('Tetris Game Stopped');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    // Remove canvas from DOM
    if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
    }
}

// --- Drawing Functions ---
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                drawBlock(c, r, board[r][c]);
            }
        }
    }
}

function drawPiece(piece) {
    if (!piece) return;
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] !== 0) {
                drawBlock(piece.x + c, piece.y + r, piece.color);
            }
        }
    }
}

function drawUI() {
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    // Score, Level, Lines Cleared
    ctx.fillStyle = textColor;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 5, 25);
    ctx.fillText('Level: ' + level, 5, 50);
    ctx.fillText('Lines: ' + linesCleared, 5, 75);

    // Next Piece
    ctx.fillText('Next:', COLS * BLOCK_SIZE + 10, 25);
    if (nextPiece) {
        for (let r = 0; r < nextPiece.shape.length; r++) {
            for (let c = 0; c < nextPiece.shape[r].length; c++) {
                if (nextPiece.shape[r][c] !== 0) {
                    drawBlock(COLS + c + 0.5, r + 2, nextPiece.color); // Position next piece
                }
            }
        }
    }
}

// --- Game Loop ---
function gameLoop(currentTime) {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the board one last time
        drawBoard(); // Draw the final state of the board
        drawPiece(currentPiece); // Draw the piece that caused game over

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 50);
        canvas.addEventListener('click', returnToMenuOnce);
        return;
    }

    if (!lastDropTime) {
        lastDropTime = currentTime;
    }

    const dropDelay = DROP_SPEEDS[level] || DROP_SPEEDS[1];
    if (currentTime - lastDropTime > dropDelay) {
        if (isValidMove(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            placePiece();
        }
        lastDropTime = currentTime;
    }

    ctx.clearRect(0, 0, canvas.width + 100, canvas.height); // Clear canvas (include UI area)
    drawBoard();
    drawPiece(currentPiece);
    drawUI();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function returnToMenuOnce() {
    canvas.removeEventListener('click', returnToMenuOnce);
    stop();
    window.dispatchEvent(new CustomEvent('gameStopped'));
}