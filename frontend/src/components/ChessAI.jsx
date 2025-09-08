import { PIECES, COLORS, getValidMoves, makeMove, isKingInCheck, isCheckmate } from './chesslogic';

// Piece values for evaluation
const PIECE_VALUES = {
  [PIECES.PAWN]: 10,
  [PIECES.KNIGHT]: 30,
  [PIECES.BISHOP]: 30,
  [PIECES.ROOK]: 50,
  [PIECES.QUEEN]: 90,
  [PIECES.KING]: 900
};

// Position bonuses for pieces (encourages good positioning)
const POSITION_BONUSES = {
  [PIECES.PAWN]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  [PIECES.KNIGHT]: [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
  ],
  [PIECES.BISHOP]: [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
  ],
  [PIECES.ROOK]: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0]
  ],
  [PIECES.QUEEN]: [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2]
  ],
  [PIECES.KING]: [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
  ]
};

// Evaluate the board state from the perspective of the given color
const evaluateBoard = (board, color) => {
  let score = 0;
  
  // Check for checkmate first (highest priority)
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  if (isCheckmate(board, opponentColor)) {
    return 10000; // We win
  }
  
  if (isCheckmate(board, color)) {
    return -10000; // We lose
  }
  
  // Count material and position value
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      
      // Base piece value
      let pieceValue = PIECE_VALUES[piece.type];
      
      // Add position bonus
      let positionBonus = 0;
      if (POSITION_BONUSES[piece.type]) {
        // For black pieces, flip the position matrix
        const positionRow = piece.color === COLORS.WHITE ? row : 7 - row;
        positionBonus = POSITION_BONUSES[piece.type][positionRow][col];
      }
      
      // Calculate total piece score
      const totalValue = pieceValue + positionBonus;
      
      // Add to score (positive for our color, negative for opponent)
      if (piece.color === color) {
        score += totalValue;
      } else {
        score -= totalValue;
      }
    }
  }
  
  // Check for check
  if (isKingInCheck(board, opponentColor)) {
    score += 50; // Bonus for putting opponent in check
  }
  
  if (isKingInCheck(board, color)) {
    score -= 50; // Penalty for being in check
  }
  
  // Note: Mobility calculation removed to avoid potential recursion issues
  // The AI will still be strong based on material, position, and tactical evaluation
  
  // Add center control bonus
  const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
  for (const [row, col] of centerSquares) {
    const piece = board[row][col];
    if (piece) {
      if (piece.color === color) {
        score += 5; // Bonus for controlling center
      } else {
        score -= 5; // Penalty for opponent controlling center
      }
    }
  }
  
  return score;
};

// Minimax algorithm with alpha-beta pruning
const minimax = (board, depth, alpha, beta, isMaximizingPlayer, color) => {
  // Base case: reached maximum depth or game over
  if (depth === 0) {
    return evaluateBoard(board, color);
  }
  
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  
  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    
    // Generate all possible moves for our color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece || piece.color !== color) continue;
        
        const moves = getValidMoves(board, row, col);
        
        for (const [toRow, toCol] of moves) {
          // Make the move
          const newBoard = makeMove(board, row, col, toRow, toCol);
          
          // Evaluate this move recursively
          const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, color);
          maxEval = Math.max(maxEval, evalScore);
          
          // Alpha-beta pruning
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) {
            break;
          }
        }
      }
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    
    // Generate all possible moves for opponent
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece || piece.color !== opponentColor) continue;
        
        const moves = getValidMoves(board, row, col);
        
        for (const [toRow, toCol] of moves) {
          // Make the move
          const newBoard = makeMove(board, row, col, toRow, toCol);
          
          // Evaluate this move recursively
          const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, color);
          minEval = Math.min(minEval, evalScore);
          
          // Alpha-beta pruning
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) {
            break;
          }
        }
      }
    }
    
    return minEval;
  }
};

// Find the best move for the AI
export const findBestMove = (board, color, difficulty = 'medium') => {
  // Set search depth based on difficulty
  let depth = 2; // Default for 'medium'
  
  if (difficulty === 'easy') {
    depth = 1;
  } else if (difficulty === 'hard') {
    depth = 4; // Increased depth for hard difficulty
  }
  
  let bestMove = null;
  let bestScore = -Infinity; // Always maximize from AI's perspective
  const isMaximizing = true;
  
  // Collect all possible moves with their scores
  const allMoves = [];
  
  // For each piece of our color
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      
      // Get all valid moves for this piece
      const moves = getValidMoves(board, row, col);
      
      for (const [toRow, toCol] of moves) {
        // Make the move
        const newBoard = makeMove(board, row, col, toRow, toCol);
        
        // Evaluate the move
        const score = minimax(
          newBoard, 
          depth - 1, 
          -Infinity, 
          Infinity, 
          !isMaximizing, 
          color
        );
        
        const move = {
          from: [row, col],
          to: [toRow, toCol],
          piece: piece,
          score: score
        };
        
        allMoves.push(move);
        
        // Update best move if this is better
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
  }
  
  // If no moves found, return null
  if (allMoves.length === 0) {
    return null;
  }
  
  // For easy difficulty, add some randomness but still prefer good moves
  if (difficulty === 'easy') {
    // Sort moves by score (best first)
    allMoves.sort((a, b) => b.score - a.score);
    
    // 50% chance to pick the best move, 30% chance for top 3, 20% chance for any move
    const random = Math.random();
    if (random < 0.5) {
      return allMoves[0]; // Best move
    } else if (random < 0.8 && allMoves.length >= 3) {
      return allMoves[Math.floor(Math.random() * 3)]; // Top 3 moves
    } else {
      return allMoves[Math.floor(Math.random() * allMoves.length)]; // Any move
    }
  }
  
  // For medium and hard, always return the best move
  return bestMove;
};
