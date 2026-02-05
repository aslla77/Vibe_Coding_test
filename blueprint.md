# Blueprint for 2D Dogfight Game

## Project Overview
This project aims to create a dynamic 2D dogfight game where the player controls a plane against an AI-controlled opponent. The game will feature a progressive difficulty system, with both the player and enemy evolving their capabilities across rounds, ensuring a continuously challenging "control fight" experience. Obstacles will be introduced in later rounds to add strategic complexity.

## Style, Design, and Features Implemented (Initial State)
-   **Application Type:** 2D Web Game.
-   **Core Game Loop:** Utilizes `requestAnimationFrame` for smooth animations and game state updates.
-   **Player Plane:**
    *   **Movement:** Controlled by arrow keys (Up, Down, Left, Right).
    *   **Shooting:** Fires bullets in the direction of the mouse cursor upon mouse click.
-   **Enemy AI Plane:**
    *   Computer-controlled, with basic AI logic to move and shoot towards the player.
-   **Dynamic Difficulty / Progression System:**
    *   Starts with weaker enemies.
    *   **Round-based:** As rounds increase, enemies become stronger (increased health, speed, attack power).
    *   **Player Scaling:** Player's stats (e.g., bullet damage, fire rate, health) will incrementally improve, or be presented as upgrade choices, to maintain balance.
-   **Obstacles:**
    *   Introduced in higher rounds to block movement and add tactical elements. Initially, these will be simple static shapes.
-   **Game States:** Will include a start screen, active gameplay, game over, and round completion/upgrade selection screens.
-   **Basic UI:** Displays essential information like player health, enemy health, current round, and possibly score.

## Key Technologies
-   **HTML5 Canvas:** The primary technology for rendering all game visuals (planes, bullets, obstacles, UI).
-   **JavaScript (ES Modules):** For implementing all game logic, physics, AI, input handling, and state management.
-   **CSS:** For basic styling of the web page, centering the canvas, and font presentation.

## Visual Design & UX
-   **Aesthetics:** The initial design will be clean and functional, employing simple colored geometric shapes (rectangles, circles) to represent planes, bullets, and obstacles. This allows for rapid prototyping and ensures core gameplay mechanics are solid before aesthetic enhancements. Placeholder sprites may be considered later if explicitly requested or if deemed necessary for clarity without adding significant complexity.
-   **Layout:** The game canvas will be centrally positioned on the web page. UI elements (health bars, round number) will be placed intuitively, typically at the top or bottom of the canvas.
-   **Interactivity:** Emphasizes smooth and responsive player controls for an engaging combat experience. Visual cues will indicate successful hits, damage taken, and state transitions (e.g., round start, game over).

## Plan for Current Task: Implement and Push 2D Dogfight Game to GitHub

### Objective
To develop a 2D dogfight game with the described features, ensuring it is fully functional and then push the complete project to a GitHub repository.

### Steps
1.  **Scaffold Project Structure (Status: completed):**
    *   Created `index.html`, `style.css`, and `main.js` with basic canvas and script linking.
2.  **Implement Game Loop and Basic Canvas (Status: completed):**
    *   Initialized canvas context.
    *   Created the main game loop using `requestAnimationFrame`.
    *   Implemented basic `update()` and `draw()` functions.
3.  **Player Plane Implementation (Status: pending):**
    *   Define player object (position, size, health, speed, bullet stats).
    *   Implement arrow key movement handling.
    *   Implement mouse click shooting towards mouse cursor.
    *   Define bullet properties and update their movement.
4.  **Enemy AI Plane Implementation (Status: pending):**
    *   Define enemy object (position, size, health, speed, attack power).
    *   Implement basic AI movement (e.g., horizontal patrol, simple pursuit).
    *   Implement periodic shooting towards the player.
5.  **Collision Detection (Status: pending):**
    *   Develop a collision detection function (e.g., AABB) for:
        *   Player bullets vs. Enemy.
        *   Enemy bullets vs. Player.
        *   Player vs. Obstacles (if present).
        *   Enemy vs. Obstacles (if present).
6.  **Game Progression System (Status: pending):**
    *   Implement round counter and logic to advance rounds.
    *   Scale enemy stats (health, speed, attack) with each round.
    *   Scale player stats (e.g., bullet damage, fire rate) with each round.
    *   Add an "upgrade" screen between rounds for player choices if dynamic upgrades are preferred over automatic scaling.
7.  **Obstacle Generation (Status: pending):**
    *   In later rounds, generate and render simple static obstacles on the canvas.
    *   Ensure obstacles interact correctly with collision detection.
8.  **User Interface (Status: pending):**
    *   Display player and enemy health bars.
    *   Show current round number.
    *   Implement start, game over, and round complete screens.
9.  **Refinement and Testing (Status: pending):**
    *   Playtest the game to identify and fix bugs.
    *   Adjust game balance (speed, damage, health).
    *   Ensure all features work as described.
10. **Prepare for GitHub Push (Status: pending):**
    *   Stage all new and modified files.
    *   Write a comprehensive commit message.
11. **Push to GitHub (Status: pending):**
    *   Push the committed changes to the remote GitHub repository.
