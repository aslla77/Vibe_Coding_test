// main.js - Game Manager

import * as airplaneGame from './airplaneGame.js';
import * as brickBreakerGame from './brickBreakerGame.js';
import * as tetrisGame from './tetrisGame.js';
import * as snakeGame from './snakeGame.js';

const gameSelectionScreen = document.getElementById('gameSelectionScreen');
const gameContainer = document.getElementById('gameContainer');
const gameOptions = document.querySelectorAll('.game-option');

let currentGame = null; // Stores the currently active game module

const games = {
    'airplane': airplaneGame,
    'brickbreaker': brickBreakerGame,
    'tetris': tetrisGame,
    'snake': snakeGame,
    // Add placeholders for other games
    'game5': { init: () => console.log('Game 5 init'), start: () => console.log('Game 5 started'), stop: () => console.log('Game 5 stopped') },
    'game6': { init: () => console.log('Game 6 init'), start: () => console.log('Game 6 started'), stop: () => console.log('Game 6 stopped') },
    'game7': { init: () => console.log('Game 7 init'), start: () => console.log('Game 7 started'), stop: () => console.log('Game 7 stopped') },
    'game8': { init: () => console.log('Game 8 init'), start: () => console.log('Game 8 started'), stop: () => console.log('Game 8 stopped') },
    'game9': { init: () => console.log('Game 9 init'), start: () => console.log('Game 9 started'), stop: () => console.log('Game 9 stopped') }
};

function showGameSelection() {
    gameContainer.classList.add('hidden');
    gameSelectionScreen.classList.remove('hidden');
    if (currentGame) {
        currentGame.stop(); // Stop the current game if one was running
        currentGame = null;
    }
    // Clear the game container in case a canvas was left
    gameContainer.innerHTML = '';
}

function startGame(gameId, options = {}) {
    const gameModule = games[gameId];
    if (gameModule && gameModule.init) {
        if (currentGame) {
            currentGame.stop(); // Stop any running game
        }
        currentGame = gameModule;
        gameSelectionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        currentGame.init(gameContainer, options); // Pass the container for the game to append its canvas
        currentGame.start();
    } else {
        console.error(`Game with ID ${gameId} not found or not implemented.`);
    }
}

// Event listeners for game selection
gameOptions.forEach(option => {
    option.addEventListener('click', () => {
        const gameId = option.dataset.game;
        startGame(gameId, { aircraftType: 'square' }); // Default to square for now
    });
});

// Listen for a custom event from games when they are stopped/want to return to menu
window.addEventListener('gameStopped', () => {
    showGameSelection();
});

// Initial display
showGameSelection();
