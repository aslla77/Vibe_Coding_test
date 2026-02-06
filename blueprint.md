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
    *   Introduced in higher rounds to add strategic complexity. Initially, these will be simple static shapes.
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

## Plan for Current Task: Implement Enemy Image and Git Push

### Objective
To replace the enemy's default shape with a user-provided image and then push all changes to GitHub.

### Steps
1.  **Update `blueprint.md` (Status: completed):** Document the new feature and the plan.
2.  **Modify `main.js` (Status: pending):**
    *   Load the user-provided image for the enemy.
    *   Modify the `drawEnemyTriangle` function (or create a new `drawEnemy` function) to draw the image instead of the triangle shape.
3.  **Git Push (Status: pending):**
    *   Stage all modified files, including the new enemy image file.
    *   Create a commit with a descriptive message.
    *   Push the commit to the remote repository.