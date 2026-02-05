# Project Blueprint: 2D Shooter Game

## Overview

This project is a simple 2D shooter game built with HTML, CSS, and vanilla JavaScript. The player controls a character that can move and shoot, fighting against an AI-controlled enemy. The game runs in the browser using the HTML5 Canvas API.

## Features

### Core Gameplay
*   **Player Control:** The player can move the character using the W, A, S, and D keys.
*   **Shooting:** The player can shoot bullets by clicking the mouse. The bullets travel in the direction of the mouse cursor.
*   **Enemy AI:** A single enemy character moves horizontally across the top of the screen and periodically shoots bullets toward the player.
*   **Collision Detection:** The game detects collisions between player bullets and the enemy, and between enemy bullets and the player.
*   **Health System:** Both the player and the enemy have health bars. Health decreases when hit by a bullet.
*   **Win/Loss Condition:** The game ends when either the player's or the enemy's health reaches zero. A "You Win" or "Game Over" message is displayed.
*   **Restart:** The game can be restarted by clicking the screen after a game over or win condition.

### Technical Details
*   **Frontend:** HTML, CSS, JavaScript
*   **Rendering:** HTML5 Canvas 2D Context
*   **Game Loop:** The game uses `requestAnimationFrame` for a smooth, efficient game loop.
*   **State Management:** The game state (e.g., character positions, health, game status) is managed in plain JavaScript objects.

## Design

### Visuals
*   **Theme:** A clean, minimalist "digital" or "retro" theme.
*   **Player:** A blue square.
*   **Enemy:** A red square.
*   **Bullets:** Small yellow (player) and orange (enemy) squares.
*   **UI:** Health bars are displayed above the player and enemy. Game-end messages are overlaid on a semi-transparent background.

### Structure
*   `index.html`: The main HTML file containing the `<canvas>` element.
*   `style.css`: The stylesheet for the game page, providing a dark theme and centering the canvas.
*   `main.js`: The core JavaScript file containing all game logic, including:
    *   Game object definitions (player, enemy, bullets).
    *   Event listeners for player input.
    *   Game state initialization and management.
    *   The main `gameLoop` function, which handles updates and drawing.
    *   Collision detection and response.
    *   Health and win/loss logic.
    *   Drawing functions for all game elements.