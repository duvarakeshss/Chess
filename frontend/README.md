# 3D Chess Application

A modern 3D chess game built with React and Three.js.

## Features

- Interactive 3D chess board
- Realistic chess piece models
- Standard chess rules and gameplay
- Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

`git clone https://github.com/duvarakeshss/Chess`
`cd Chess/frontend`

2. Install dependencies

```
npm install
```

3. Start the development server

```
npm run dev
```

4. Open your browser and navigate to the local development server (typically http://localhost:5173)

## Tech Stack

- **React** - UI framework
- **Three.js** - 3D rendering library
- **Vite** - Build tool and development server

## Project Structure

- `/public` - Public assets
  - `/models` - 3D model files
    - `Chessboard.glb` - 3D chessboard model
- `/src` - Source code
  - `/components` - React components

    - `Chessboard.jsx` - 3D chessboard implementation
    - `ChessPieces.jsx` - 3D chess piece models
    - `chesslogic.jsx` - Chess game logic and rules
