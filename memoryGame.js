// memoryGame.js - Memory Card Match Game Logic with Rounds and Start Button

let canvas;
let ctx;
let gameContainer;
let animationFrameId;

// Game state
let gameState = 'ready'; // 'ready', 'preview', 'playing', 'roundClear', 'gameOver'
let round = 1;
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let isChecking = false;
let previewTimer = 0;

// Card constants
let ROWS = 2;
let COLS = 4;
const MAX_ROWS = 6;
const MAX_COLS = 6;
let CARD_SIZE = 100;
const CARD_PADDING = 15;

// Card symbols
const ALL_SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

export function init(containerElement, options = {}) {
    gameContainer = containerElement;
    canvas = document.createElement('canvas');
    canvas.width = 800; // Fixed size for game area
    canvas.height = 700;
    gameContainer.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', handleMouseDown);
    
    resetToFirstRound();
}

function resetToFirstRound() {
    round = 1;
    setupRound();
    gameState = 'ready';
}

function setupRound() {
    // Increase difficulty based on round
    if (round === 1) { ROWS = 2; COLS = 4; }
    else if (round === 2) { ROWS = 4; COLS = 4; }
    else if (round === 3) { ROWS = 4; COLS = 5; }
    else if (round === 4) { ROWS = 4; COLS = 6; }
    else { ROWS = 6; COLS = 6; }

    // Adjust card size if needed to fit
    const totalW = COLS * (CARD_SIZE + CARD_PADDING) + CARD_PADDING;
    const totalH = ROWS * (CARD_SIZE + CARD_PADDING) + CARD_PADDING + 100; // room for UI
    
    if (totalW > canvas.width || totalH > canvas.height) {
        CARD_SIZE = Math.min(
            (canvas.width - (COLS + 1) * CARD_PADDING) / COLS,
            (canvas.height - 150 - (ROWS + 1) * CARD_PADDING) / ROWS
        );
    }

    cards = [];
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    isChecking = false;

    const numPairs = (ROWS * COLS) / 2;
    const roundSymbols = ALL_SYMBOLS.slice(0, numPairs);
    const deck = [...roundSymbols, ...roundSymbols];
    
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const startX = (canvas.width - (COLS * (CARD_SIZE + CARD_PADDING) - CARD_PADDING)) / 2;
    const startY = 80;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            cards.push({
                symbol: deck[r * COLS + c],
                isFlipped: false,
                isMatched: false,
                x: startX + c * (CARD_SIZE + CARD_PADDING),
                y: startY + r * (CARD_SIZE + CARD_PADDING)
            });
        }
    }
}

function startPreview() {
    gameState = 'preview';
    cards.forEach(card => card.isFlipped = true);
    
    setTimeout(() => {
        cards.forEach(card => card.isFlipped = false);
        gameState = 'playing';
    }, 2000); // 2 seconds preview as requested
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === 'ready') {
        // Start button check
        if (mouseX > canvas.width/2 - 100 && mouseX < canvas.width/2 + 100 &&
            mouseY > canvas.height/2 - 30 && mouseY < canvas.height/2 + 30) {
            startPreview();
        }
        return;
    }

    if (gameState === 'roundClear') {
        round++;
        setupRound();
        gameState = 'ready';
        return;
    }

    if (gameState === 'gameOver') {
        resetToFirstRound();
        return;
    }

    if (gameState !== 'playing' || isChecking) return;

    const clickedCard = cards.find(card => 
        mouseX >= card.x && mouseX <= card.x + CARD_SIZE &&
        mouseY >= card.y && mouseY <= card.y + CARD_SIZE &&
        !card.isFlipped && !card.isMatched
    );

    if (clickedCard) {
        clickedCard.isFlipped = true;
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            moves++;
            isChecking = true;
            setTimeout(checkMatch, 800);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.symbol === card2.symbol) {
        card1.isMatched = true;
        card2.isMatched = true;
        matchedCount += 2;
        if (matchedCount === cards.length) {
            gameState = 'roundClear';
        }
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
    document.removeEventListener('mousedown', handleMouseDown);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');

    // Draw UI
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Round ${round}`, canvas.width / 2, 40);
    ctx.font = '18px Arial';
    ctx.fillText(`Moves: ${moves}`, canvas.width / 2, 65);

    cards.forEach(card => {
        ctx.fillStyle = card.isMatched ? '#555' : (card.isFlipped ? '#fff' : '#00bcd4');
        ctx.beginPath();
        ctx.roundRect(card.x, card.y, CARD_SIZE, CARD_SIZE, 8);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (card.isFlipped || card.isMatched) {
            ctx.fillStyle = card.isMatched ? '#888' : '#333';
            ctx.font = `bold ${Math.floor(CARD_SIZE * 0.4)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(card.symbol, card.x + CARD_SIZE / 2, card.y + CARD_SIZE / 2);
        }
    });

    if (gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(canvas.width/2 - 100, canvas.height/2 - 30, 200, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START GAME', canvas.width/2, canvas.height/2);
    }

    if (gameState === 'roundClear') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('ROUND CLEAR!', canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Click to start next round', canvas.width / 2, canvas.height / 2 + 50);
    }

    // Return to menu logic (usually handle by CustomEvent, but let's add a button here too)
    ctx.fillStyle = textColor;
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Click to return to menu', canvas.width - 20, canvas.height - 20);
    // Add return to menu event
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        if (e.clientX - rect.left > canvas.width - 150 && e.clientY - rect.top > canvas.height - 40) {
            stop();
            window.dispatchEvent(new CustomEvent('gameStopped'));
        }
    };
}

function gameLoop() {
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}
