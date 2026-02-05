# Project Blueprint: 2D Shooter Game

## Overview

This project is a simple 2D shooter game built with HTML, CSS, and vanilla JavaScript. The player controls a character that can move and shoot, fighting against an AI-controlled enemy. The game is round-based, with the enemy becoming progressively more difficult and the player receiving upgrades after each round. The game runs in the browser using the HTML5 Canvas API.

## Features

### Core Gameplay
*   **Player Control:** The player can move the character using the W, A, S, and D keys.
*   **Shooting:** The player can shoot bullets continuously by holding down the mouse button. The bullets travel in the direction of the mouse cursor.
*   **Round System:** The game progresses in rounds. After each round, the enemy becomes stronger.
*   **Progressive Difficulty:** The enemy's health, speed, attack power, and movement patterns (including vertical movement) increase in later rounds.
*   **Player Upgrades:** After successfully completing a round, the player is presented with a choice of three upgrades:
    *   Increased Attack Damage
    *   Increased Movement Speed
    *   Increased Attack Speed (reduced cooldown)
*   **Enemy AI:** A single enemy character moves across the top of the screen and periodically shoots bullets toward the player.
*   **Collision Detection:** The game detects collisions between player bullets and the enemy, and between enemy bullets and the player.
*   **Health System:** Both the player and the enemy have health bars. Health decreases when hit by a bullet.
*   **Win/Loss Condition:** The game ends when the player's health reaches zero. The game progresses to an upgrade screen when the enemy's health reaches zero.
*   **Restart:** The game can be restarted by clicking the screen after a "Game Over" message.

### Technical Details
*   **Frontend:** HTML, CSS, JavaScript
*   **Rendering:** HTML5 Canvas 2D Context
*   **Assets:** The game can load PNG sprites for the player and enemy from an `assets` directory. It includes a fallback to drawing colored squares if the images fail to load.
*   **Game Loop:** The game uses `requestAnimationFrame` for a smooth, efficient game loop.
*   **State Management:** The game state (e.g., `playing`, `upgrade`, `gameOver`), character stats, and round number are managed in plain JavaScript objects.

## Design

### Visuals
*   **Theme:** A clean, minimalist "digital" or "retro" theme.
*   **Player:** A blue square or a `player.png` sprite.
*   **Enemy:** A red square or an `enemy.png` sprite.
*   **Bullets:** Small yellow (player) and orange (enemy) squares.
*   **UI:** 
    *   Health bars are displayed above the player and enemy.
    *   The current round number is displayed in the top-left corner.
    *   Game-end and upgrade screens are overlaid on a semi-transparent background.

### Structure
*   `index.html`: The main HTML file containing the `<canvas>` element.
*   `style.css`: The stylesheet for the game page.
*   `main.js`: The core JavaScript file containing all game logic.
*   `assets/`: A directory intended to hold `player.png` and `enemy.png` sprites.
