# ChessMaster

A modern, interactive 3D chess game built with React, Three.js, and WebGL. ChessMaster combines classic chess gameplay with stunning 3D graphics and intuitive user interaction.

![ChessMaster Game Screenshot](Screenshots/Screenshot%202025-04-17%20195159.png)

## Features

- **Fully Interactive 3D Board** - Rotate, zoom, and pan around the chess board
- **Realistic 3D Chess Pieces** - Custom-modeled chess pieces with realistic materials
- **Complete Chess Logic** - Full implementation of chess rules including:
  - Piece movement validation
  - Check and checkmate detection
  - Stalemate conditions
  - Move history with algebraic notation
- **Visual Feedback**
  - Highlighted valid moves
  - Capture animations
  - Check and checkmate notifications
- **Responsive Design** - Works on both desktop and mobile devices
- **Game State Tracking** - Visual history of all moves made during the game

## Screenshots

<div align="center">
  <img src="Screenshots/Screenshot%202025-04-17%20195124.png" alt="Game Start" width="45%">
  <img src="Screenshots/Screenshot%202025-04-17%20195038.png" alt="Mid Game" width="45%">
</div>

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository

```bash
git clone https://github.com/duvarakeshss/Chess
cd Chess
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to the local development server (typically http://localhost:5173)

## How to Play

1. **Select a Piece**: Click on any piece that belongs to your color (White starts first)
2. **Move**: Valid moves will be highlighted on the board - click on any highlighted square to move your piece
3. **Capture**: Click on an opponent's piece that is highlighted as a valid move to capture it
4. **Game Status**: The current player and game status are displayed at the bottom of the screen
5. **Move History**: All moves are recorded in algebraic notation on the right side of the screen
6. **Game End**: When checkmate or stalemate occurs, a popup will appear allowing you to restart the game

## Controls

- **Left-click + Drag**: Rotate the board
- **Mouse Wheel**: Zoom in/out
- **Right-click + Drag**: Pan the board

## Project Structure

- `/frontend` - React application
  - `/public/models` - 3D assets for the chessboard and pieces
  - `/src/components` - React components including chess logic
- `/blender model` - Source files for the 3D models
- `/Screenshots` - Game screenshots

## Tech Stack

- **Frontend**:

  - React 19
  - Three.js (3D rendering)
  - React Hot Toast (notifications)
  - TailwindCSS (styling)
  - Vite (build tool)
- **3D Modeling**:

  - Blender (for chess pieces and board)
  - GLTF format (for 3D model export)

## Future Enhancements

- Multiplayer support
- AI opponents with different difficulty levels
- Ability to save and load games
- Piece promotion options for pawns
- Sound effects and music
- Time controls and chess clock
