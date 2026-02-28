// memoryGame.js - Memory Card Match Game Logic with 1s Preview

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game constants
const ROWS = 4;
const COLS = 4;
const CARD_SIZE = 120;
const CARD_PADDING = 20;

// Game state
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let gameOver = false;
let isChecking = false;
let isPreviewing = true;

// Card symbols
const SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = COLS * (CARD_SIZE + CARD_PADDING) + CARD_PADDING;
    canvas.height = ROWS * (CARD_SIZE + CARD_PADDING) + CARD_PADDING;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', handleMouseDown);

    resetGame();
}

function resetGame() {
    cards = [];
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    gameOver = false;
    isChecking = false;
    isPreviewing = true;

    const deck = [...SYMBOLS, ...SYMBOLS];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            cards.push({
                row: r, col: c, symbol: deck[r * COLS + c],
                isFlipped: true, // Initially show all
                isMatched: false,
                x: c * (CARD_SIZE + CARD_PADDING) + CARD_PADDING,
                y: r * (CARD_SIZE + CARD_PADDING) + CARD_PADDING
            });
        }
    }

    // Hide cards after 1 second
    setTimeout(() => {
        cards.forEach(card => card.isFlipped = false);
        isPreviewing = false;
    }, 1000);
}

function handleMouseDown(e) {
    if (gameOver || isChecking || isPreviewing) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedCard = cards.find(card => 
        mouseX >= card.x && mouseX <= card.x + CARD_SIZE &&
        mouseY >= card.y && mouseY <= card.y + CARD_SIZE &&
        !card.isFlipped && !card.isMatched
    );

    if (clickedCard) {
        flipCard(clickedCard);
    }
}

function flipCard(card) {
    card.isFlipped = true;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        isChecking = true;
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.symbol === card2.symbol) {
        card1.isMatched = true;
        card2.isMatched = true;
        matchedCount += 2;
        if (matchedCount === cards.length) gameOver = true;
    } else {
        card1.isFlipped = false;
        card2.isFlipped = false;
    }
    flippedCards = [];
    isChecking = false;
}

export function start() {
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function stop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cards.forEach(card => {
        ctx.fillStyle = card.isMatched ? '#555' : (card.isFlipped ? '#fff' : '#00bcd4');
        ctx.beginPath();
        ctx.roundRect(card.x, card.y, CARD_SIZE, CARD_SIZE, 10);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (card.isFlipped || card.isMatched) {
            ctx.fillStyle = card.isMatched ? '#888' : '#333';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(card.symbol, card.x + CARD_SIZE / 2, card.y + CARD_SIZE / 2);
        }
    });

    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    ctx.fillStyle = textColor;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Moves: ' + moves, 10, canvas.height - 10);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CLEARED!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 50);
        canvas.addEventListener('click', returnToMenuOnce);
    }
}

function returnToMenuOnce() {
    canvas.removeEventListener('click', returnToMenuOnce);
    stop();
    window.dispatchEvent(new CustomEvent('gameStopped'));
}

function gameLoop() {
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}
