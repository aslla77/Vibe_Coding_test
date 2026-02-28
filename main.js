// main.js - Game Manager

import * as airplaneGame from './airplaneGame.js';
import * as brickBreakerGame from './brickBreakerGame.js';
import * as tetrisGame from './tetrisGame.js';
import * as snakeGame from './snakeGame.js';
import * as memoryGame from './memoryGame.js';

const gameSelectionScreen = document.getElementById('gameSelectionScreen');
const gameContainer = document.getElementById('gameContainer');
const gameOptions = document.querySelectorAll('.game-option');
const themeToggle = document.getElementById('themeToggle');

let currentGame = null;

const games = {
    'airplane': airplaneGame,
    'brickbreaker': brickBreakerGame,
    'tetris': tetrisGame,
    'snake': snakeGame,
    'memory': memoryGame,
    'game6': { init: () => console.log('Game 6 init'), start: () => console.log('Game 6 started'), stop: () => console.log('Game 6 stopped') },
    'game7': { init: () => console.log('Game 7 init'), start: () => console.log('Game 7 started'), stop: () => console.log('Game 7 stopped') },
    'game8': { init: () => console.log('Game 8 init'), start: () => console.log('Game 8 started'), stop: () => console.log('Game 8 stopped') },
    'game9': { init: () => console.log('Game 9 init'), start: () => console.log('Game 9 started'), stop: () => console.log('Game 9 stopped') }
};

function showGameSelection() {
    gameContainer.classList.add('hidden');
    gameSelectionScreen.classList.remove('hidden');
    if (currentGame) {
        currentGame.stop();
        currentGame = null;
    }
    gameContainer.innerHTML = '';
}

function startGame(gameId, options = {}) {
    const gameModule = games[gameId];
    if (gameModule && gameModule.init) {
        if (currentGame) {
            currentGame.stop();
        }
        currentGame = gameModule;
        gameSelectionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        currentGame.init(gameContainer, options);
        currentGame.start();
    } else {
        console.error(`Game with ID ${gameId} not found or not implemented.`);
    }
}

// Event listeners for game selection
gameOptions.forEach(option => {
    option.addEventListener('click', () => {
        const gameId = option.dataset.game;
        startGame(gameId);
    });
});

// Theme toggle logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        themeToggle.textContent = 'Dark Mode';
    } else {
        themeToggle.textContent = 'Light Mode';
    }
});

// Listen for a custom event from games when they are stopped/want to return to menu
window.addEventListener('gameStopped', () => {
    showGameSelection();
});

// Initial display
showGameSelection();
