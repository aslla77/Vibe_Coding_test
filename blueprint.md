# Blueprint for Game Arcade

## Project Overview
This project is evolving into a Game Arcade, providing a selection of casual games for the user. The initial focus is on creating a robust game selection mechanism and integrating existing and new game modules. The 2D Dogfight, Brick Breaker, and Tetris games are now implemented, with placeholders for more to come.

## Style, Design, and Features Implemented (Current Version)

### Global Application Structure
*   **Application Type:** Web-based Game Arcade.
*   **Entry Point:** `index.html` serves as the main entry point, hosting the game selection screen and a container for individual games.
*   **Main Script (`main.js`):** Acts as a game manager, orchestrating the display of the game selection screen, loading and launching selected game modules, and managing transitions between them.
*   **Modular Game Design:** Each game is encapsulated in its own JavaScript module (e.g., `airplaneGame.js`, `brickBreakerGame.js`, `tetrisGame.js`), responsible for its own logic, rendering, and lifecycle.

### Game Selection Screen
*   **HTML (`index.html`):** Features a dedicated `div` (`#gameSelectionScreen`) to display a list of available games.
*   **CSS (`style.css`):** Provides a visually appealing and responsive layout for the game selection, using a grid for game options and modern CSS for styling effects (gradients, shadows, transitions). Includes responsive adjustments for various screen sizes.
*   **User Interaction:** Users can select a game by clicking on its respective button. The game manager (`main.js`) handles the loading and starting of the chosen game.

### Integrated Games
*   **1. 2D Dogfight (`airplaneGame.js`):**
    *   **Description:** The original 2D dogfight game, refactored into a modular structure.
    *   **Features:** Player movement (keyboard), shooting (mouse), enemy AI, dynamic difficulty with rounds, upgrade system, obstacles.
    *   **Integration:** Now initialized and started by `main.js` within a dedicated `gameContainer`.
*   **2. Brick Breaker (`brickBreakerGame.js`):**
    *   **Description:** A classic arcade game where the player controls a paddle to bounce a ball and break bricks.
    *   **Features:** Paddle movement, ball physics and collision with walls, paddle, and bricks. Scoring and lives system. Game over/win states.
    *   **Integration:** Fully implemented and integrated with the game manager.
*   **3. Tetris (`tetrisGame.js`):**
    *   **Description:** A classic tile-matching puzzle video game.
    *   **Features:** Falling tetrominoes, rotation, horizontal movement, collision detection with other blocks and boundaries. Line clearing, scoring, and level progression.
    *   **Integration:** Fully implemented and integrated with the game manager.
*   **Other Games (Placeholders):** 6 additional game slots are available on the selection screen, currently showing "Coming Soon!".

### Key Technologies
*   **HTML5:** For structuring the game arcade and individual game interfaces.
*   **CSS3:** For styling the entire application, focusing on modern aesthetics, responsiveness, and interactive elements. Uses `Space Mono` font for a techy feel.
*   **JavaScript (ES Modules):** Core language for all game logic, modularization, and game management.
*   **HTML5 Canvas:** Each game module creates and manages its own canvas for rendering.

## Plan for Current Task: Finalize and Commit Changes

### Objective
To ensure all implemented features are documented and committed to the Git repository.

### Steps
1.  **Update `blueprint.md` (Status: completed):** Document the newly implemented games and any changes to the overall arcade structure.
2.  **Stage and Commit Changes (Status: pending):** Commit all changes to the Git repository.