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

// Game state to track special moves
export const createGameState = () => ({
  enPassantTarget: null, // {row, col} of the square that can be captured en passant
  castlingRights: {
    white: { kingside: true, queenside: true },
    black: { kingside: true, queenside: true }
  },
  halfMoveClock: 0, // For 50-move rule
  fullMoveNumber: 1,
  lastMove: null
});

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
const getPawnMoves = (board, row, col, color, gameState = null) => {
  const moves = [];
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;
  
  // Forward move (one step)
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push([row + direction, col]);
    
    // Forward move (two steps) if pawn is at starting position
    if (row === startRow && isValidPosition(row + 2 * direction, col) && !board[row + 2 * direction][col] && !board[row + direction][col]) {
      moves.push([row + 2 * direction, col]);
    }
  }
  
  // Captures (diagonal moves)
  const captureMoves = [
    [row + direction, col - 1],
    [row + direction, col + 1]
  ];
  
  for (const [r, c] of captureMoves) {
    if (isValidPosition(r, c)) {
      // Regular capture
      if (board[r][c] && board[r][c].color !== color) {
        moves.push([r, c]);
      }
      // En passant capture
      else if (gameState && gameState.enPassantTarget && 
               gameState.enPassantTarget.row === r && gameState.enPassantTarget.col === c) {
        moves.push([r, c]);
      }
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
const getKingMoves = (board, row, col, color, gameState = null) => {
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
  
  // Castling moves
  if (gameState && gameState.castlingRights) {
    const castlingRights = gameState.castlingRights[color];
    
    // Kingside castling
    if (castlingRights.kingside) {
      const rookCol = 7;
      const kingCol = 4;
      const targetKingCol = 6;
      const targetRookCol = 5;
      
      // Check if path is clear and rook hasn't moved
      if (board[row][rookCol] && 
          board[row][rookCol].type === PIECES.ROOK && 
          board[row][rookCol].color === color &&
          !board[row][targetKingCol] && 
          !board[row][targetRookCol]) {
        moves.push([row, targetKingCol]);
      }
    }
    
    // Queenside castling
    if (castlingRights.queenside) {
      const rookCol = 0;
      const kingCol = 4;
      const targetKingCol = 2;
      const targetRookCol = 3;
      
      // Check if path is clear and rook hasn't moved
      if (board[row][rookCol] && 
          board[row][rookCol].type === PIECES.ROOK && 
          board[row][rookCol].color === color &&
          !board[row][targetKingCol] && 
          !board[row][targetRookCol] &&
          !board[row][1]) { // b-file must be clear for queenside
        moves.push([row, targetKingCol]);
      }
    }
  }
  
  return moves;
};

// Get all valid moves for a piece
export const getValidMoves = (board, row, col, gameState = null) => {
  const piece = board[row][col];
  if (!piece) return [];
  
  const { type, color } = piece;
  
  switch(type) {
    case PIECES.PAWN:
      return getPawnMoves(board, row, col, color, gameState);
    case PIECES.ROOK:
      return getRookMoves(board, row, col, color);
    case PIECES.KNIGHT:
      return getKnightMoves(board, row, col, color);
    case PIECES.BISHOP:
      return getBishopMoves(board, row, col, color);
    case PIECES.QUEEN:
      return getQueenMoves(board, row, col, color);
    case PIECES.KING:
      return getKingMoves(board, row, col, color, gameState);
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

// Make a move and return the new board state and game state
export const makeMove = (board, fromRow, fromCol, toRow, toCol, gameState = null, promotionPiece = null) => {
  // Create a deep copy of the board to avoid mutating the original
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];
  const newGameState = gameState ? { ...gameState } : createGameState();
  
  // Handle special moves
  if (piece.type === PIECES.PAWN) {
    // En passant capture
    if (newGameState.enPassantTarget && 
        newGameState.enPassantTarget.row === toRow && 
        newGameState.enPassantTarget.col === toCol) {
      // Remove the captured pawn
      const capturedPawnRow = piece.color === COLORS.WHITE ? toRow + 1 : toRow - 1;
      newBoard[capturedPawnRow][toCol] = null;
    }
    
    // Set en passant target for next move (if pawn moves two squares)
    const direction = piece.color === COLORS.WHITE ? -1 : 1;
    const startRow = piece.color === COLORS.WHITE ? 6 : 1;
    if (fromRow === startRow && toRow === fromRow + 2 * direction) {
      newGameState.enPassantTarget = { row: fromRow + direction, col: fromCol };
    } else {
      newGameState.enPassantTarget = null;
    }
    
    // Pawn promotion
    const promotionRow = piece.color === COLORS.WHITE ? 0 : 7;
    if (toRow === promotionRow) {
      const promotedPiece = promotionPiece || PIECES.QUEEN; // Default to queen
      newBoard[toRow][toCol] = { type: promotedPiece, color: piece.color };
    } else {
      newBoard[toRow][toCol] = piece;
    }
  } else if (piece.type === PIECES.KING) {
    // Castling
    const castlingDistance = Math.abs(toCol - fromCol);
    if (castlingDistance === 2) {
      // Move the rook
      if (toCol > fromCol) { // Kingside
        newBoard[fromRow][5] = newBoard[fromRow][7]; // Move rook to f-file
        newBoard[fromRow][7] = null;
      } else { // Queenside
        newBoard[fromRow][3] = newBoard[fromRow][0]; // Move rook to d-file
        newBoard[fromRow][0] = null;
      }
    }
    newBoard[toRow][toCol] = piece;
    
    // Remove castling rights for this color
    newGameState.castlingRights[piece.color] = { kingside: false, queenside: false };
  } else if (piece.type === PIECES.ROOK) {
    newBoard[toRow][toCol] = piece;
    
    // Remove castling rights for the rook that moved
    if (fromRow === (piece.color === COLORS.WHITE ? 7 : 0)) {
      if (fromCol === 0) { // Queenside rook
        newGameState.castlingRights[piece.color].queenside = false;
      } else if (fromCol === 7) { // Kingside rook
        newGameState.castlingRights[piece.color].kingside = false;
      }
    }
  } else {
    newBoard[toRow][toCol] = piece;
  }
  
  // Clear the source square
  newBoard[fromRow][fromCol] = null;
  
  // Update move counters
  if (piece.color === COLORS.BLACK) {
    newGameState.fullMoveNumber++;
  }
  
  // Update half-move clock (for 50-move rule)
  if (piece.type === PIECES.PAWN || newBoard[toRow][toCol] !== null) {
    newGameState.halfMoveClock = 0;
  } else {
    newGameState.halfMoveClock++;
  }
  
  // Store last move
  newGameState.lastMove = { from: [fromRow, fromCol], to: [toRow, toCol], piece };
  
  return { board: newBoard, gameState: newGameState };
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
export const isStalemate = (board, color, gameState = null) => {
  // If the king is in check, it's not stalemate
  if (isKingInCheck(board, color)) return false;
  
  // Check if the player has any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, row, col, gameState);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }
  
  // If the player has no legal moves and is not in check, it's stalemate
  return true;
};

// Check if a move is legal (doesn't put own king in check)
export const isLegalMove = (board, fromRow, fromCol, toRow, toCol, gameState = null) => {
  const piece = board[fromRow][fromCol];
  if (!piece) return false;
  
  // Make the move temporarily
  const moveResult = makeMove(board, fromRow, fromCol, toRow, toCol, gameState);
  const newBoard = moveResult.board;
  
  // Check if this move puts the king in check
  const kingInCheck = isKingInCheck(newBoard, piece.color);
  
  return !kingInCheck;
};

// Get all legal moves for a piece (filtering out moves that put king in check)
export const getLegalMoves = (board, row, col, gameState = null) => {
  const moves = getValidMoves(board, row, col, gameState);
  return moves.filter(([toRow, toCol]) => isLegalMove(board, row, col, toRow, toCol, gameState));
};

// Check for 50-move rule (draw)
export const isFiftyMoveRule = (gameState) => {
  return gameState && gameState.halfMoveClock >= 50;
};

// Check for insufficient material (draw)
export const isInsufficientMaterial = (board) => {
  const pieces = [];
  
  // Count all pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        pieces.push(piece);
      }
    }
  }
  
  // If only kings remain
  if (pieces.length === 2) {
    return true;
  }
  
  // If only king and one minor piece per side
  if (pieces.length === 4) {
    const whitePieces = pieces.filter(p => p.color === COLORS.WHITE);
    const blackPieces = pieces.filter(p => p.color === COLORS.BLACK);
    
    if (whitePieces.length === 2 && blackPieces.length === 2) {
      const whiteMinor = whitePieces.find(p => p.type === PIECES.BISHOP || p.type === PIECES.KNIGHT);
      const blackMinor = blackPieces.find(p => p.type === PIECES.BISHOP || p.type === PIECES.KNIGHT);
      
      if (whiteMinor && blackMinor) {
        // If both have bishops on same color squares, it's insufficient material
        if (whiteMinor.type === PIECES.BISHOP && blackMinor.type === PIECES.BISHOP) {
          const whiteBishopSquare = getBishopSquare(board, COLORS.WHITE);
          const blackBishopSquare = getBishopSquare(board, COLORS.BLACK);
          
          if (whiteBishopSquare && blackBishopSquare) {
            const whiteColor = (whiteBishopSquare.row + whiteBishopSquare.col) % 2;
            const blackColor = (blackBishopSquare.row + blackBishopSquare.col) % 2;
            return whiteColor === blackColor;
          }
        }
        return true;
      }
    }
  }
  
  return false;
};

// Helper function to find bishop square
const getBishopSquare = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PIECES.BISHOP && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check for threefold repetition (simplified - would need move history)
export const isThreefoldRepetition = (moveHistory) => {
  if (!moveHistory || moveHistory.length < 6) return false;
  
  // This is a simplified check - in a real implementation, you'd need to track board positions
  // For now, we'll just return false
  return false;
};

// Check if the game is a draw
export const isDraw = (board, color, gameState, moveHistory) => {
  return isStalemate(board, color, gameState) ||
         isFiftyMoveRule(gameState) ||
         isInsufficientMaterial(board) ||
         isThreefoldRepetition(moveHistory);
};

// Get piece value for evaluation
export const getPieceValue = (piece) => {
  const values = {
    [PIECES.PAWN]: 1,
    [PIECES.KNIGHT]: 3,
    [PIECES.BISHOP]: 3,
    [PIECES.ROOK]: 5,
    [PIECES.QUEEN]: 9,
    [PIECES.KING]: 100
  };
  return values[piece.type] || 0;
};

// Check if a square is under attack by the given color
export const isSquareUnderAttack = (board, row, col, attackingColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackingColor) {
        const moves = getValidMoves(board, r, c);
        for (const [toRow, toCol] of moves) {
          if (toRow === row && toCol === col) {
            return true;
          }
        }
      }
    }
  }
  return false;
};
