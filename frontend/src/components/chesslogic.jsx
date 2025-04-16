export const PIECES = {
  PAWN: 'pawn',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king',
};

export const COLORS = {
  WHITE: 'white',
  BLACK: 'black',
};

// Initial board setup
export const createInitialBoard = () => {
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: PIECES.PAWN, color: COLORS.BLACK };
    board[6][i] = { type: PIECES.PAWN, color: COLORS.WHITE };
  }
  
  // Place rooks
  board[0][0] = { type: PIECES.ROOK, color: COLORS.BLACK };
  board[0][7] = { type: PIECES.ROOK, color: COLORS.BLACK };
  board[7][0] = { type: PIECES.ROOK, color: COLORS.WHITE };
  board[7][7] = { type: PIECES.ROOK, color: COLORS.WHITE };
  
  // Place knights
  board[0][1] = { type: PIECES.KNIGHT, color: COLORS.BLACK };
  board[0][6] = { type: PIECES.KNIGHT, color: COLORS.BLACK };
  board[7][1] = { type: PIECES.KNIGHT, color: COLORS.WHITE };
  board[7][6] = { type: PIECES.KNIGHT, color: COLORS.WHITE };
  
  // Place bishops
  board[0][2] = { type: PIECES.BISHOP, color: COLORS.BLACK };
  board[0][5] = { type: PIECES.BISHOP, color: COLORS.BLACK };
  board[7][2] = { type: PIECES.BISHOP, color: COLORS.WHITE };
  board[7][5] = { type: PIECES.BISHOP, color: COLORS.WHITE };
  
  // Place queens
  board[0][3] = { type: PIECES.QUEEN, color: COLORS.BLACK };
  board[7][3] = { type: PIECES.QUEEN, color: COLORS.WHITE };
  
  // Place kings
  board[0][4] = { type: PIECES.KING, color: COLORS.BLACK };
  board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };
  
  return board;
};

// Check if a position is within the board boundaries
const isValidPosition = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Get all valid moves for a pawn
const getPawnMoves = (board, row, col, color) => {
  const moves = [];
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;
  
  // Forward move (one step)
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push([row + direction, col]);
    
    // Forward move (two steps) if pawn is at starting position
    if (row === startRow && isValidPosition(row + 2 * direction, col) && !board[row + 2 * direction][col]) {
      moves.push([row + 2 * direction, col]);
    }
  }
  
  // Captures (diagonal moves)
  const captureMoves = [
    [row + direction, col - 1],
    [row + direction, col + 1]
  ];
  
  for (const [r, c] of captureMoves) {
    if (isValidPosition(r, c) && board[r][c] && board[r][c].color !== color) {
      moves.push([r, c]);
    }
  }
  
  return moves;
};

// Get all valid moves for a rook
const getRookMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
  
  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    
    while (isValidPosition(r, c)) {
      if (!board[r][c]) {
        // Empty square, can move here
        moves.push([r, c]);
      } else {
        // Found a piece
        if (board[r][c].color !== color) {
          // Can capture opponent's piece
          moves.push([r, c]);
        }
        break; // Can't move past a piece
      }
      
      r += dx;
      c += dy;
    }
  }
  
  return moves;
};

// Get all valid moves for a knight
const getKnightMoves = (board, row, col, color) => {
  const moves = [];
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dx, dy] of knightMoves) {
    const r = row + dx;
    const c = col + dy;
    
    if (isValidPosition(r, c) && (!board[r][c] || board[r][c].color !== color)) {
      moves.push([r, c]);
    }
  }
  
  return moves;
};

// Get all valid moves for a bishop
const getBishopMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // diagonals
  
  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    
    while (isValidPosition(r, c)) {
      if (!board[r][c]) {
        // Empty square, can move here
        moves.push([r, c]);
      } else {
        // Found a piece
        if (board[r][c].color !== color) {
          // Can capture opponent's piece
          moves.push([r, c]);
        }
        break; // Can't move past a piece
      }
      
      r += dx;
      c += dy;
    }
  }
  
  return moves;
};

// Get all valid moves for a queen
const getQueenMoves = (board, row, col, color) => {
  // Queen combines rook and bishop movements
  return [
    ...getRookMoves(board, row, col, color),
    ...getBishopMoves(board, row, col, color)
  ];
};

// Get all valid moves for a king
const getKingMoves = (board, row, col, color) => {
  const moves = [];
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [dx, dy] of kingMoves) {
    const r = row + dx;
    const c = col + dy;
    
    if (isValidPosition(r, c) && (!board[r][c] || board[r][c].color !== color)) {
      moves.push([r, c]);
    }
  }
  
  return moves;
};

// Get all valid moves for a piece
export const getValidMoves = (board, row, col) => {
  const piece = board[row][col];
  if (!piece) return [];
  
  const { type, color } = piece;
  
  switch(type) {
    case PIECES.PAWN:
      return getPawnMoves(board, row, col, color);
    case PIECES.ROOK:
      return getRookMoves(board, row, col, color);
    case PIECES.KNIGHT:
      return getKnightMoves(board, row, col, color);
    case PIECES.BISHOP:
      return getBishopMoves(board, row, col, color);
    case PIECES.QUEEN:
      return getQueenMoves(board, row, col, color);
    case PIECES.KING:
      return getKingMoves(board, row, col, color);
    default:
      return [];
  }
};

// Check if the king is in check
export const isKingInCheck = (board, color) => {
  // Find the king's position
  let kingRow = -1;
  let kingCol = -1;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PIECES.KING && piece.color === color) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }
  
  // Check if any opponent piece can capture the king
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(board, row, col);
        for (const [r, c] of moves) {
          if (r === kingRow && c === kingCol) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

// Make a move and return the new board state
export const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  
  return newBoard;
};

// Check if the given player is in checkmate
export const isCheckmate = (board, color) => {
  // First, check if the king is in check
  if (!isKingInCheck(board, color)) return false;
  
  // Check if any move can get the king out of check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col);
        
        for (const [toRow, toCol] of moves) {
          // Make the move temporarily
          const newBoard = makeMove(board, row, col, toRow, toCol);
          
          // If after this move the king is not in check, then it's not checkmate
          if (!isKingInCheck(newBoard, color)) {
            return false;
          }
        }
      }
    }
  }
  
  // If no move can get the king out of check, it's checkmate
  return true;
};

// Check if the game is a stalemate
export const isStalemate = (board, color) => {
  // If the king is in check, it's not stalemate
  if (isKingInCheck(board, color)) return false;
  
  // Check if the player has any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }
  
  // If the player has no legal moves and is not in check, it's stalemate
  return true;
};
