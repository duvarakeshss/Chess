import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createChessPieceMesh } from './ChessPieces';
import toast from 'react-hot-toast';
import { 
  createInitialBoard, 
  getValidMoves, 
  makeMove, 
  isKingInCheck, 
  isCheckmate, 
  isStalemate,
  COLORS,
  PIECES 
} from './chesslogic';
import { findBestMove } from './ChessAI';

const Chessboard = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const piecesRef = useRef(new Map()); // Map to track piece meshes
  const boardStateRef = useRef(createInitialBoard()); // Add ref to track board state
  const [boardState, setBoardState] = useState(createInitialBoard());
  // Add a movement tracker to keep track of actual piece positions
  const movementTracker = useRef(Array(8).fill().map(() => Array(8).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(COLORS.WHITE);
  const currentPlayerRef = useRef(COLORS.WHITE); // Add ref to track current player
  const [selectedPiece, setSelectedPiece] = useState(null);
  const selectedPieceRef = useRef(null); // Add ref to keep track of selected piece
  const [validMoves, setValidMoves] = useState([]);
  const [highlightMeshes, setHighlightMeshes] = useState([]);
  const highlightMeshesRef = useRef([]); // Add a ref to track highlight meshes directly
  const [gameStatus, setGameStatus] = useState(null);
  // Add move history tracking
  const [moveHistory, setMoveHistory] = useState([]);
  const moveHistoryRef = useRef([]); // Add a ref to track move history directly
  // Add winner popup state
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Add AI player state
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiColor] = useState(COLORS.BLACK); // AI is always black
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Raycaster for detecting clicks on the board
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Function to get chess notation for a move
  const getChessNotation = (piece, fromRow, fromCol, toRow, toCol, isCapture, isCheck, isCheckmate) => {
    console.log('Generating notation for move:', { piece, fromRow, fromCol, toRow, toCol, isCapture, isCheck, isCheckmate });
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const fromSquare = files[fromCol] + ranks[fromRow];
    const toSquare = files[toCol] + ranks[toRow];
    
    let notation = '';
    
    // Add piece letter (except for pawns)
    if (piece.type !== PIECES.PAWN) {
      switch (piece.type) {
        case PIECES.KNIGHT: notation += 'N'; break;
        case PIECES.BISHOP: notation += 'B'; break;
        case PIECES.ROOK: notation += 'R'; break;
        case PIECES.QUEEN: notation += 'Q'; break;
        case PIECES.KING: notation += 'K'; break;
      }
    }
    
    // For captures
    if (isCapture) {
      // For pawn captures, add the file
      if (piece.type === PIECES.PAWN) {
        notation += fromSquare[0];
      }
      notation += 'x';
    }
    
    // Add destination square
    notation += toSquare;
    
    // Add check or checkmate symbol
    if (isCheckmate) {
      notation += '#';
    } else if (isCheck) {
      notation += '+';
    }
    
    console.log('Generated notation:', notation);
    return notation;
  };

  useEffect(() => {
    console.log('Chessboard component mounted');
    
    if (!mountRef.current) {
      console.error('Mount ref is null');
      return;
    }

    // Clear any previous content
    mountRef.current.innerHTML = '';

    // Set up scene with animated colorful background
    const scene = new THREE.Scene();
    
    // Create animated background with multiple colors
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Sophisticated color palette with better aesthetics
    const colors = [
      { r: 67, g: 56, b: 202, name: 'Royal Purple' },     // Deep purple
      { r: 139, g: 69, b: 19, name: 'Rich Brown' },       // Warm brown
      { r: 30, g: 64, b: 175, name: 'Navy Blue' },        // Deep blue
      { r: 185, g: 28, b: 28, name: 'Crimson' },          // Deep red
      { r: 22, g: 101, b: 52, name: 'Forest Green' },     // Deep green
      { r: 120, g: 53, b: 15, name: 'Burnt Orange' },     // Warm orange
      { r: 75, g: 85, b: 99, name: 'Slate Gray' },        // Sophisticated gray
      { r: 124, g: 58, b: 237, name: 'Violet' }           // Rich violet
    ];
    
    let time = 0;
    let currentColorIndex = 0;
    let nextColorIndex = 1;
    
    const updateBackground = () => {
      time += 0.008; // Slower, more elegant animation
      
      // Clear canvas with subtle fade effect
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, 512, 512);
      
      // Smooth color transition with easing
      const t = (Math.sin(time * 0.5) + 1) / 2; // Slower, smoother transition
      const currentColor = colors[currentColorIndex];
      const nextColor = colors[nextColorIndex];
      
      // Enhanced color interpolation with better blending
      const easeInOut = t * t * (3 - 2 * t); // Smooth easing function
      const r = Math.floor(currentColor.r + (nextColor.r - currentColor.r) * easeInOut);
      const g = Math.floor(currentColor.g + (nextColor.g - currentColor.g) * easeInOut);
      const b = Math.floor(currentColor.b + (nextColor.b - currentColor.b) * easeInOut);
      
      // Create sophisticated multi-layer gradient
      const centerX = 256 + Math.sin(time * 0.1) * 20;
      const centerY = 256 + Math.cos(time * 0.1) * 20;
      
      // Main gradient
      const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      gradient.addColorStop(0.4, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)}, 0.8)`);
      gradient.addColorStop(0.8, `rgba(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)}, 0.6)`);
      gradient.addColorStop(1, `rgba(${Math.floor(r * 0.2)}, ${Math.floor(g * 0.2)}, ${Math.floor(b * 0.2)}, 0.4)`);
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      
      // Add elegant floating orbs with glow effect
      for (let i = 0; i < 15; i++) {
        const angle = (time * 0.3 + i * 0.4) % (Math.PI * 2);
        const radius = 150 + Math.sin(time * 0.2 + i) * 50;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const size = 3 + Math.sin(time * 1.5 + i) * 2;
        const alpha = 0.4 + Math.sin(time * 2 + i) * 0.3;
        
        // Create glow effect
        const glowGradient = context.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        glowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
        glowGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        context.fillStyle = glowGradient;
        context.beginPath();
        context.arc(x, y, size * 3, 0, Math.PI * 2);
        context.fill();
        
        // Core orb
        context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
      
      // Add sophisticated geometric patterns
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.05 + i * Math.PI / 3;
        const x = centerX + Math.cos(angle) * 250;
        const y = centerY + Math.sin(angle) * 250;
        const size = 8 + Math.sin(time * 0.6 + i) * 4;
        const rotation = time * 0.08 + i;
        
        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        
        // Create diamond shape
        context.fillStyle = `rgba(255, 255, 255, 0.08)`;
        context.beginPath();
        context.moveTo(0, -size);
        context.lineTo(size, 0);
        context.lineTo(0, size);
        context.lineTo(-size, 0);
        context.closePath();
        context.fill();
        
        // Add subtle border
        context.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        context.lineWidth = 1;
        context.stroke();
        
        context.restore();
      }
      
      // Add subtle noise texture for depth
      const imageData = context.getImageData(0, 0, 512, 512);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 2; // Very subtle noise
        data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
      }
      context.putImageData(imageData, 0, 0);
      
      // Update texture
      texture.needsUpdate = true;
      
      // Change color every 4 seconds for more elegant transitions
      if (Math.floor(time * 0.25) > Math.floor((time - 0.008) * 0.25)) {
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % colors.length;
      }
      
      requestAnimationFrame(updateBackground);
    };
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    
    // Start the animation
    updateBackground();
    
    sceneRef.current = scene;
    console.log('Scene created with animated colorful background');

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      35,  // Field of view
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 15);  // Better angle for viewing the board
    camera.lookAt(0, 0, 0);
    console.log('Camera set up');

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    console.log('Renderer added to DOM');

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);  // Increased intensity for better visibility
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);  // Slightly reduced intensity
    directionalLight.position.set(5, 8, 7.5);  // Adjusted position
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Add second directional light from opposite direction for better illumination
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.7);  // Slightly reduced intensity
    secondaryLight.position.set(-5, 6, -7.5);  // Adjusted position
    secondaryLight.castShadow = true;
    secondaryLight.shadow.mapSize.width = 2048;
    secondaryLight.shadow.mapSize.height = 2048;
    scene.add(secondaryLight);
    
    console.log('Lights added');

    // Add a simple error boundary
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });

    // Load the 3D model
    const modelPaths = [
      
      '/models/Chessboard.glb',
    ];
    
    console.log('Attempting to load GLTF model...');
    const loader = new GLTFLoader();
    
    const loadModel = (index) => {
      if (index >= modelPaths.length) {
        console.error('Failed to load model from any path. Using programmatic board instead.');
        createProgrammaticBoard();
        return;
      }
      
      const path = modelPaths[index];
      console.log(`Trying to load model from: ${path}`);
      
      loader.load(
        path,
        (gltf) => {
          console.log('Model loaded successfully!');
          console.log(gltf);
          
          // Add the model to the scene
          const model = gltf.scene;
          
          // Scale the model to a good size
          model.scale.set(26, 26, 26);
          
          // Position the model - adjusted to align with the placed pieces
          model.position.set(0.0, 0.0, 0.0);
          
          // Apply shadows to all meshes in the model
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              console.log('Found mesh in model:', node.name);
            }
          });
          
          scene.add(model);
          console.log('Added model to scene');
          
          // Place chess pieces
          placePieces(boardState);
        },
        (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`Loading progress: ${percent}%`);
        },
        (error) => {
          console.error(`Error loading model from ${path}:`, error);
          // Try the next path
          loadModel(index + 1);
        }
      );
    };
    
    // Start trying to load the model
    loadModel(0);

    // Create a programmatic board
    function createProgrammaticBoard() {
      console.log('Creating programmatic board');
      const boardGroup = new THREE.Group();
      scene.add(boardGroup);

      const boardSize = 8;
      const squareSize = 2.0; 
      const boardOffset = (boardSize * squareSize) / 2;
      
      // Create squares
      for (let x = 0; x < boardSize; x++) {
        for (let z = 0; z < boardSize; z++) {
          const isWhite = (x + z) % 2 === 0;
          
          const color = isWhite ? 0xf5e7d2 : 0x8b5a2b; 
          
          const geometry = new THREE.BoxGeometry(squareSize, 0.2, squareSize);
          const material = new THREE.MeshStandardMaterial({ 
            color,
            roughness: 0.7,
            metalness: 0.1
          });
          const square = new THREE.Mesh(geometry, material);
          square.receiveShadow = true;
          
          // Position each square
          const posX = (x * squareSize) - boardOffset + (squareSize / 2);
          const posZ = (z * squareSize) - boardOffset + (squareSize / 2);
          square.position.set(posX, 0, posZ);
          
          // Store the board coordinates as userData for raycasting
          square.userData = { type: 'square', row: z, col: x };
          
          boardGroup.add(square);
        }
      }
      console.log('Created programmatic board squares');

      // Add border around the board
      const borderGeometry = new THREE.BoxGeometry(boardSize * squareSize + 0.5, 0.3, boardSize * squareSize + 0.5);
      const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5d3a1a,
        roughness: 0.6,
        metalness: 0.2
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.receiveShadow = true;
      border.position.y = -0.15;
      boardGroup.add(border);
      
      console.log('Added border to programmatic board');
      
      // Place chess pieces
      placePieces(boardState);
    }

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;  // Allow zooming out further
    controls.maxPolarAngle = Math.PI / 2;
    console.log('Controls added');

    // Handle mouse move for raycasting
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Handle mouse click for piece selection and movement
    const handleMouseClick = (event) => {
      // Update the mouse coordinates
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      console.log('Mouse clicked at:', mouse.current);
      console.log('CURRENT TURN state:', currentPlayer);
      console.log('CURRENT TURN ref:', currentPlayerRef.current);
      
      // Force synchronize the ref and state if they're out of sync
      if (currentPlayer !== currentPlayerRef.current) {
        console.warn('Ref and state out of sync! Fixing...');
        console.warn(`Current player state: ${currentPlayer}, ref: ${currentPlayerRef.current}`);
        
        // CRITICAL: Trust the REF value as the source of truth
        // This ensures consistent behavior during click events
        console.warn('Setting state to match ref...');
        setCurrentPlayer(currentPlayerRef.current);
      }
      
      // IMPORTANT: From this point forward, we should ALWAYS use currentPlayerRef.current
      // and not currentPlayer, since the state update might not have taken effect yet
      const activePlayer = currentPlayerRef.current;
      console.log('Active player for this click:', activePlayer);
      console.log('WHITE:', COLORS.WHITE, 'BLACK:', COLORS.BLACK);
      console.log('Is white turn?', activePlayer === COLORS.WHITE);
      console.log('Is black turn?', activePlayer === COLORS.BLACK);
      
      // Show whose turn it is prominently in logs
      if (activePlayer === COLORS.WHITE) {
        console.log('%c WHITE PLAYER TURN ', 'background: white; color: black; font-weight: bold;');
      } else {
        console.log('%c BLACK PLAYER TURN ', 'background: black; color: white; font-weight: bold;');
      }

      // Log the current state of the movement tracker for debugging
      logMovementTracker();
      
      // CRITICAL: Store a local copy of selected piece at the start
      // This ensures we don't lose the selection during async state updates
      const localSelectedPiece = selectedPieceRef.current ? {...selectedPieceRef.current} : null;
      
      // Raycast to find clicked objects
      raycaster.current.setFromCamera(mouse.current, camera);
      
      console.log('CLICK HANDLER - Current selected piece REF:', selectedPieceRef.current);
      console.log('CLICK HANDLER - Current selected piece STATE:', selectedPiece);
      console.log('CLICK HANDLER - Local copy of selected piece:', localSelectedPiece);
      
      // Check if we have a piece selected already - if so, we might be trying to move it
      let havePieceSelected = localSelectedPiece && 
                             localSelectedPiece.row !== undefined && 
                             localSelectedPiece.col !== undefined;
                             
      if (havePieceSelected) {
        console.log(`We have a piece selected: ${localSelectedPiece.color} ${localSelectedPiece.type} at ${localSelectedPiece.row},${localSelectedPiece.col}`);
      }
      
      // For debug purposes, check what's under the cursor across ALL objects
      const allObjects = [];
      sceneRef.current.traverse((object) => {
        if (object.isMesh || object instanceof THREE.Group) {
          allObjects.push(object);
        }
      });
      
      const allIntersects = raycaster.current.intersectObjects(allObjects, true);
      console.log('ALL intersects count:', allIntersects.length);
      
      // DIRECT APPROACH: Handle board click plane intersection
      // This will convert click coordinates to board row/col
        for (const intersect of allIntersects) {
        if (intersect.object.name === 'boardClickPlane') {
          console.log('HIT THE BOARD CLICK PLANE!');
          
          // Convert 3D intersection point to board coordinates
          const point = intersect.point;
          console.log('Intersection point:', point);
          
          // Board dimensions
          const boardSize = 8;
          const squareSize = 2.0;
          const boardOffset = (boardSize * squareSize) / 2;
          
          // Calculate row and column from intersection point
          // Adjusting for board position and orientation
          const col = Math.floor((point.x + boardOffset) / squareSize);
          const row = Math.floor((point.z + boardOffset) / squareSize);
          
          console.log(`Clicked on board at row ${row}, col ${col}`);
          
          // If coordinates are valid (within the board)
          if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            console.log(`Board coordinates valid: row ${row}, col ${col}`);
            
            // First, check if we have a selected piece and this is a move
            // CRITICAL: Use the local copy of the selected piece
            console.log('Local selected piece copy:', localSelectedPiece);
            
            if (localSelectedPiece && localSelectedPiece.row !== undefined) {
              // We have a selected piece - check if this is a valid move
              const { row: fromRow, col: fromCol, type: pieceType } = localSelectedPiece;
              console.log(`Checking if click at ${row},${col} is a valid move for ${pieceType} at ${fromRow},${fromCol}`);
              
              // Get valid moves for this piece
              const validMoves = getValidMoves(movementTracker.current, fromRow, fromCol);
              console.log('Valid moves:', validMoves);
              
              // Check if clicked square is a valid move
              const isValidMove = validMoves.some(([moveRow, moveCol]) => 
                moveRow === row && moveCol === col);
              
              if (isValidMove) {
                console.log(`VALID MOVE! Moving ${pieceType} from ${fromRow},${fromCol} to ${row},${col}`);
                // IMPORTANT: Use our local copy of the selected piece
                handlePieceMove(fromRow, fromCol, row, col);
                return;
              } else {
                console.log('Not a valid move for the selected piece');
                
                // If the clicked square has one of our pieces, select it instead
                const pieceAtClick = movementTracker.current[row][col];
                
                // Debug the selection conditions
                if (pieceAtClick) {
                  console.log(`Piece at click: ${pieceAtClick.color} ${pieceAtClick.type}`);
                  console.log(`Current player ref: ${activePlayer}`);
                  console.log(`Can select? ${pieceAtClick.color === activePlayer}`);
                  
                  // Special handling for black pieces
                  if (pieceAtClick.color === COLORS.BLACK && activePlayer === COLORS.BLACK) {
                    console.log("Using force select for black piece");
                    if (forceSelectPiece(row, col, activePlayer)) {
                      return;
                    }
                  }
                }
                
                if (pieceAtClick && pieceAtClick.color === activePlayer) {
                  console.log(`Clicked on our own piece: ${pieceAtClick.color} ${pieceAtClick.type} at ${row},${col}`);
                  
                  // Select this piece instead
                  if (directSelectPiece(row, col, activePlayer)) {
                    return;
                  }
                } else {
                  // If we clicked on an invalid location, just deselect
                  console.log('Invalid move and no new piece to select - deselecting');
                  clearHighlights(true);
                  return;
                }
              }
            } else {
              // No piece selected - check if there's a piece to select at the clicked position
              const pieceAtClick = movementTracker.current[row][col];
              
              // Debug the board state at the clicked position
              console.log('Board state at clicked position:', pieceAtClick);
              console.log('Full board state:', movementTracker.current);
              
              // Debug the selection conditions
              if (pieceAtClick) {
                console.log(`Piece at click: ${pieceAtClick.color} ${pieceAtClick.type}`);
                console.log(`Current player ref: ${activePlayer}`);
                console.log(`Can select? ${pieceAtClick.color === activePlayer}`);
                
                // Special handling for black pieces
                if (pieceAtClick.color === COLORS.BLACK && activePlayer === COLORS.BLACK) {
                  console.log("Using force select for black piece");
                  if (forceSelectPiece(row, col, activePlayer)) {
                    return;
                  }
                }
              }
              
              if (pieceAtClick && pieceAtClick.color === activePlayer) {
                console.log(`Clicked on our own piece: ${pieceAtClick.color} ${pieceAtClick.type} at ${row},${col}`);
                if (directSelectPiece(row, col, activePlayer)) {
                  return;
                }
              } else {
                console.log(pieceAtClick ? 
                  `Cannot select opponent's piece at ${row},${col}` : 
                  `Empty square at ${row},${col} - nothing to select`);
                
                // Show a visual indicator for empty square clicks
                showEmptySquareIndicator(row, col);
                clearHighlights(true);
                return;
              }
            }
          }
          
          // If we clicked on the plane but outside the board, just deselect
          clearHighlights(true);
          return;
        }
      }
      
      // If we get here, we didn't hit the board plane, so check for direct piece selection
      console.log('Checking for direct piece click...');
      
      // List of all pieces in the scene for debugging
      console.log('ALL PIECES IN SCENE:');
      let pieceCount = 0;
      sceneRef.current.traverse((obj) => {
        if (obj.userData && obj.userData.type === 'piece') {
          console.log(`Piece ${pieceCount++}: ${obj.userData.color} ${obj.userData.pieceType} at ${obj.userData.row},${obj.userData.col}`);
        }
      });
      
      // Track whether we found a piece
      let foundPiece = false;
      
      // First, try to find a direct piece intersection
      for (const intersect of allIntersects) {
        const obj = intersect.object;
        
        // Check if this object is a piece directly
        if (obj.userData && obj.userData.type === 'piece') {
          foundPiece = true;
          const userData = obj.userData;
          console.log('DIRECT HIT on piece:', userData);
          console.log('Current player is:', currentPlayer);
          console.log('Current player REF is:', currentPlayerRef.current);
          
          // Special handling for black pieces
          if (userData.color === COLORS.BLACK && activePlayer === COLORS.BLACK) {
            console.log("Using force select for black piece (direct hit)");
            if (forceSelectPiece(userData.row, userData.col, activePlayer)) {
              return;
            }
          }
          
          // If this is the current player's piece, select it
          if (userData.color === activePlayer) {
            console.log(`SELECTING: ${userData.color} ${userData.pieceType} at ${userData.row},${userData.col}`);
            
            const row = userData.row;
            const col = userData.col;
            
            // Use the board state directly to validate the piece exists
            const piece = movementTracker.current[row][col];
            
            if (!piece) {
              console.error('PIECE IN SCENE BUT NOT IN BOARD STATE! This should not happen.');
              console.error('Piece in scene at:', row, col);
              console.error('Board state:', movementTracker.current);
              console.error('Attempting direct board select instead of using scene object data...');
              
              // Try to find the piece in the boardState by searching for a matching piece
              let foundInBoard = false;
              for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                  const boardPiece = movementTracker.current[r][c];
                  if (boardPiece && boardPiece.type === userData.pieceType && boardPiece.color === userData.color) {
                    console.log(`Found matching piece in board at ${r},${c}`);
                    if (directSelectPiece(r, c, activePlayer)) {
                      foundInBoard = true;
                      return;
                    }
                  }
                }
              }
              
              if (!foundInBoard) {
                console.error('Could not find matching piece in board state');
                continue;
              }
            }
            
            // Create and set the selected piece data
            const pieceData = {
              row,
              col,
              type: piece.type,
              color: piece.color
            };
            
            // Directly update both state and ref
            setSelectedPiece(pieceData);
            selectedPieceRef.current = pieceData;
            
            console.log('SELECTED PIECE NOW:', pieceData);
            
            // Calculate valid moves
            const moves = getValidMoves(movementTracker.current, row, col);
            console.log('Valid moves:', moves);
            
            // Set valid moves
            setValidMoves(moves);
            
            // Highlight valid moves
            highlightValidMoves(moves);
            
            return;
          }
        }
      }
      
      // If we didn't find a direct piece hit, try parent traversal
      if (!foundPiece) {
        for (const intersect of allIntersects) {
          let current = intersect.object;
          
          // Walk up the parent chain looking for a piece
          while (current && !foundPiece) {
            if (current.userData && current.userData.type === 'piece') {
              foundPiece = true;
              const userData = current.userData;
              console.log('Found piece through parent traversal:', userData);
              
              // Special handling for black pieces
              if (userData.color === COLORS.BLACK && activePlayer === COLORS.BLACK) {
                console.log("Using force select for black piece (parent traversal)");
                if (forceSelectPiece(userData.row, userData.col, activePlayer)) {
                  return;
                }
              }
              
              // If this is the current player's piece, select it
              if (userData.color === activePlayer) {
                console.log(`SELECTING via parent: ${userData.color} ${userData.pieceType} at ${userData.row},${userData.col}`);
                
                // Directly handle selection here instead of calling another function
                const row = userData.row;
                const col = userData.col;
                
                // Double-check that there's a piece at this position in the board state
                const piece = movementTracker.current[row][col];
                if (!piece) {
                  console.error('Piece in scene but not in board state!');
                  break;
                }
                
                // Create and set the selected piece data
                const pieceData = {
                  row,
                  col,
                  type: piece.type,
                  color: piece.color
                };
                
                // Directly update both state and ref
                setSelectedPiece(pieceData);
                selectedPieceRef.current = pieceData;
                
                console.log('SELECTED PIECE NOW:', pieceData);
                
                // Calculate valid moves
                const moves = getValidMoves(movementTracker.current, row, col);
                console.log('Valid moves:', moves);
                
                // Set valid moves
                setValidMoves(moves);
                
                // Highlight valid moves
                highlightValidMoves(moves);
                
                return;
              }
              break;
            }
            current = current.parent;
          }
          
          if (foundPiece) break;
        }
      }
      
      // If nothing was clicked, deselect
      console.log('No valid object clicked. Deselecting.');
      clearHighlights(true);
    };

    // Handle window resize
    const handleWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    
    // Add touch support for mobile devices
    window.addEventListener('touchstart', (event) => {
      // Prevent default to avoid scrolling/zooming
      event.preventDefault();
      
      // Get the touch position
      const touch = event.touches[0];
      // Convert touch to mouse event for consistent handling
      handleMouseClick({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    console.log('Animation loop started');

    // Initial render to ensure content is displayed
    renderer.render(scene, camera);
    
    // Clean up
    return () => {
      console.log('Cleaning up Three.js resources');
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('touchstart', handleMouseClick);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // Add a separate effect to handle currentPlayer changes
  useEffect(() => {
    console.log('PLAYER CHANGED TO:', currentPlayer);
    console.log('Previous currentPlayerRef was:', currentPlayerRef.current);
    
    // Only update the ref if it's different from the state
    // This prevents unnecessary updates and potential issues
    if (currentPlayerRef.current !== currentPlayer) {
      console.log(`Updating ref to match state: ${currentPlayer}`);
      // Update the ref so event handlers can access the current player
      currentPlayerRef.current = currentPlayer;
    } else {
      console.log(`Ref and state already in sync: ${currentPlayer}`);
    }
    
    console.log('Updated currentPlayerRef to:', currentPlayerRef.current);
    
    // Force a re-render after updating the ref
    setTimeout(() => {
      console.log('Verifying currentPlayerRef after update:', currentPlayerRef.current);
      console.log('Verifying currentPlayer after update:', currentPlayer);
    }, 0);
  }, [currentPlayer]);

  // Add an effect to synchronize boardStateRef with boardState
  useEffect(() => {
    boardStateRef.current = boardState;
  }, [boardState]);

  // Initialize the movement tracker with the initial board state
  useEffect(() => {
    // Make sure we properly initialize the movement tracker from the board state
    console.log('Initializing movement tracker with current board state');
    const initialBoard = createInitialBoard();
    movementTracker.current = initialBoard.map(row => [...row]);
    
    // Log the initial state to verify
    console.log('Initial movement tracker state:', movementTracker.current);
  }, []);
  
  // Effect to trigger AI move when it's AI's turn
  useEffect(() => {
    // If AI is enabled and it's AI's turn, make a move
    if (aiEnabled && currentPlayer === aiColor && !showWinnerPopup) {
      makeAiMove();
    }
  }, [aiEnabled, aiColor, currentPlayer]);

  // Log movement tracker whenever it changes
  const logMovementTracker = () => {
    console.log('Current movement tracker state:');
    for (let row = 0; row < 8; row++) {
      const rowPieces = [];
      for (let col = 0; col < 8; col++) {
        const piece = movementTracker.current[row][col];
        if (piece) {
          rowPieces.push(`${piece.color} ${piece.type}`);
        } else {
          rowPieces.push('empty');
        }
      }
      console.log(`Row ${row}: ${rowPieces.join(' | ')}`);
    }
  };

  // Add a debug function to check if pieces exist at a position
  const debugPieceAtPosition = (row, col) => {
    console.log(`Checking for piece at position [${row},${col}]`);
    console.log(`BoardState at [${row},${col}]:`, boardState[row][col]);
    console.log(`MovementTracker at [${row},${col}]:`, movementTracker.current[row][col]);
  };

  // Place chess pieces based on the current board state
  const placePieces = (board) => {
    if (!sceneRef.current) return;
    
    // Clear existing pieces
    piecesRef.current.forEach((mesh) => {
      sceneRef.current.remove(mesh);
    });
    piecesRef.current.clear();
    
    // Board measurements for proper piece placement
    const boardSize = 8;
    const squareSize = 2.0;
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Initialize the movement tracker with the board state
    movementTracker.current = board.map(row => [...row]);
    
    // Create and place new pieces
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const piece = board[row][col];
        if (piece) {
          const { type, color } = piece;
          const pieceMesh = createChessPieceMesh(type, color);
          
          // Adjust scale based on the piece type
          let pieceScale = 1.8;
          
          if (type === 'pawn') {
            pieceScale = 1.6;
          } else if (type === 'knight' || type === 'bishop') {
            pieceScale = 1.7;
          } else if (type === 'rook') {
            pieceScale = 1.7;
          } else if (type === 'queen') {
            pieceScale = 1.8;
          } else if (type === 'king') {
            pieceScale = 1.8;
          }
          
          pieceMesh.scale.set(pieceScale, pieceScale, pieceScale);
          
          // Calculate position to center pieces on squares
          const worldX = (col * squareSize) - boardOffset + (squareSize / 2);
          const worldZ = (row * squareSize) - boardOffset + (squareSize / 2);
          
          // Position the piece
          pieceMesh.position.set(
            worldX,
            0.8, // Height above board
            worldZ
          );
          
          // Add metadata to the piece
          pieceMesh.userData = { type: 'piece', row, col, pieceType: type, color };
          
          // Propagate userData to all children for better click detection
          pieceMesh.traverse((object) => {
            object.userData = { type: 'piece', row, col, pieceType: type, color };
          });
          
          // Add the piece to the scene
          sceneRef.current.add(pieceMesh);
          
          // Store a reference to the piece
          piecesRef.current.set(`${row}-${col}`, pieceMesh);
        }
      }
    }
    
    // Create the board click plane after placing pieces
    createBoardClickPlane();
  };

  // Handle piece selection
  const handlePieceSelection = (row, col) => {
    console.log(`Attempting to select piece at ${row},${col}`);
    console.log(`Current player state: ${currentPlayer}, ref: ${currentPlayerRef.current}`);
    
    // Get the piece from the movement tracker instead of board state
    const piece = movementTracker.current[row][col];
    if (piece) {
      console.log(`Piece found: ${piece.color} ${piece.type}`);
    }
    
    if (piece && piece.color === currentPlayerRef.current) {
      console.log(`Selected ${piece.color} ${piece.type} at ${row},${col} (current player: ${currentPlayerRef.current})`);
      
      // Store selected piece in both state and ref
      const pieceData = { row, col, type: piece.type, color: piece.color };
      setSelectedPiece(pieceData);
      selectedPieceRef.current = pieceData;
      
      // Get valid moves for this piece
      // Use the movement tracker for calculating valid moves
      const moves = getValidMoves(movementTracker.current, row, col);
      console.log(`Found ${moves.length} valid moves for ${piece.type}:`, moves);
      setValidMoves(moves);
      
      // Highlight valid moves
      highlightValidMoves(moves);
    } else if (piece) {
      console.log(`Cannot select ${piece.color} ${piece.type} - it's ${currentPlayerRef.current}'s turn`);
      // Deselect if clicking on opponent's piece or empty square
      setSelectedPiece(null);
      selectedPieceRef.current = null;
      setValidMoves([]);
      clearHighlights(true);
    } else {
      console.log('No piece at selected position');
      // Deselect if clicking on empty square
      setSelectedPiece(null);
      selectedPieceRef.current = null;
      setValidMoves([]);
      clearHighlights(true);
    }
  };

  // Highlight valid moves on the board
  const highlightValidMoves = (moves) => {
    if (!sceneRef.current) return;
    
    console.log('Highlighting', moves.length, 'valid moves');
    
    // Clear previous highlights first - BUT DO NOT CLEAR SELECTED PIECE
    // Calling this AFTER setting the selected piece
    // keep the selected piece information intact
    clearHighlights(false); // Don't clear the selected piece state!
    
    const newHighlightMeshes = [];
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;  
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Helper function to create chess-style move indicators
    const createChessHighlight = (row, col, color, isSelectedPiece = false, isCapture = false) => {
      // Calculate position to exactly match board squares
      const worldX = (col * squareSize) - boardOffset + (squareSize / 2);
      const worldZ = (row * squareSize) - boardOffset + (squareSize / 2);
      
      // Create a group to hold all highlight elements for this square
      const highlightGroup = new THREE.Group();
      highlightGroup.position.set(worldX, 0, worldZ);
      highlightGroup.userData = {
        type: 'highlight_group',
        row,
        col,
        isSelectedPiece,
        isCapture
      };
      
      if (isSelectedPiece) {
        // For selected piece, create a border highlight
        const borderGeometry = new THREE.RingGeometry(
          squareSize * 0.4, // inner radius
          squareSize * 0.48, // outer radius
          32 // segments
        );
        
        const borderMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        border.position.y = 0.15; // Just above the board
        border.userData = {
          type: 'selected_border',
          row,
          col,
          isSelectedPiece: true
        };
        
        highlightGroup.add(border);
      } else if (isCapture) {
        // For captures, create a red circle with X
        const circleGeometry = new THREE.CircleGeometry(squareSize * 0.3, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = -Math.PI / 2;
        circle.position.y = 0.12;
        circle.userData = {
          type: 'capture_circle',
          row,
          col,
          isCapture: true
        };
        
        highlightGroup.add(circle);
        
        // Add X mark for capture
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 3
        });
        
        // Create X shape
        const points = [
          new THREE.Vector3(-0.3, 0.13, -0.3),
          new THREE.Vector3(0.3, 0.13, 0.3),
          new THREE.Vector3(0, 0.13, 0),
          new THREE.Vector3(0.3, 0.13, -0.3),
          new THREE.Vector3(-0.3, 0.13, 0.3)
        ];
        
        lineGeometry.setFromPoints(points);
        const xLine = new THREE.Line(lineGeometry, lineMaterial);
        xLine.userData = {
          type: 'capture_x',
          row,
          col,
          isCapture: true
        };
        
        highlightGroup.add(xLine);
      } else {
        // For regular moves, create a small dot in the center
        const dotGeometry = new THREE.CircleGeometry(squareSize * 0.15, 16);
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.rotation.x = -Math.PI / 2;
        dot.position.y = 0.1;
        dot.userData = {
          type: 'move_dot',
          row,
          col,
          isCapture: false
        };
        
        highlightGroup.add(dot);
      }
      
      // Add the highlight group to the scene
      sceneRef.current.add(highlightGroup);
      newHighlightMeshes.push(highlightGroup);
      
      // Add each part to the array for easier raycasting
      highlightGroup.children.forEach(child => {
        newHighlightMeshes.push(child);
        child.name = `highlight_${row}_${col}_${child.userData.type}`;
      });
      
      // Add debug name for the group
      highlightGroup.name = `highlightGroup_${row}_${col}`;
      
      console.log(`Created chess-style highlight at ${row},${col} with ${highlightGroup.children.length} parts`);
    };
    
    // Add highlight for selected piece
    if (selectedPiece) {
      const { row, col } = selectedPiece;
      createChessHighlight(row, col, 0x0088ff, true, false); // Blue border for selected piece
    }
    
    // Add highlights for valid moves
    moves.forEach(([row, col]) => {
      const isCapture = movementTracker.current[row][col] !== null;
      const color = isCapture ? 0xff0000 : 0x00ff00;  // Red for captures, green for moves
      createChessHighlight(row, col, color, false, isCapture);
    });
    
    // Store references to highlight meshes in both ref and state
    highlightMeshesRef.current = newHighlightMeshes;
    setHighlightMeshes(newHighlightMeshes);
    
    // Verify selected piece is still intact after highlighting
    console.log('After creating all highlights, selectedPieceRef is:', selectedPieceRef.current);
  };

  // Clear highlight indicators
  const clearHighlights = (clearSelectedPiece = false) => {
    if (!sceneRef.current) return;
    
    console.log(`Clearing highlights (clearSelectedPiece=${clearSelectedPiece})`);
    
    // Remove all highlight meshes from the scene
    highlightMeshesRef.current.forEach(mesh => {
      if (sceneRef.current && mesh) {
        sceneRef.current.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      }
    });
    
    // Clear both the ref and the state for highlights
    highlightMeshesRef.current = [];
    setHighlightMeshes([]);
    
    // Only clear selected piece state if explicitly asked
    if (clearSelectedPiece) {
      console.log('Clearing selected piece state');
      setSelectedPiece(null);
      selectedPieceRef.current = null;
    } else {
      console.log('Keeping selected piece state intact');
    }
  };

  // Handle piece movement
  const handlePieceMove = (fromRow, fromCol, toRow, toCol) => {
    // Get the piece being moved from the movement tracker
    const movingPiece = movementTracker.current[fromRow][fromCol];
    if (!movingPiece) {
      // Try fallback to board state
      const boardPiece = boardState[fromRow][fromCol];
      if (boardPiece) {
        // Update the movement tracker with the board state piece
        const newMovementTracker = movementTracker.current.map(row => [...row]);
        newMovementTracker[fromRow][fromCol] = boardPiece;
        movementTracker.current = newMovementTracker;
        
        // Now try again with the updated movement tracker
        return handlePieceMove(fromRow, fromCol, toRow, toCol);
      }
      return;
    }
    
    // Verify that the piece being moved belongs to the current player
    if (movingPiece.color !== currentPlayerRef.current) {
      return;
    }
    
    // Get fresh valid moves using the movement tracker
    const currentValidMoves = getValidMoves(movementTracker.current, fromRow, fromCol);
    
    // Check if the move is valid using the fresh moves
    const isValid = currentValidMoves.some(([row, col]) => row === toRow && col === toCol);
    
    if (!isValid) {
      return;
    }
    
    // Check if this is a capture (if there's a piece at the destination)
    const isCapture = movementTracker.current[toRow][toCol] !== null;
    
    // Clear selection and highlights now (before we modify the board state)
    clearHighlights(true);
    
    // Create a new board state after the move
    const newBoardState = makeMove(boardState, fromRow, fromCol, toRow, toCol);
    
    // Update the board state
    setBoardState(newBoardState);
    
    // Update the movement tracker to reflect the actual piece positions
    const newMovementTracker = movementTracker.current.map(row => [...row]);
    newMovementTracker[toRow][toCol] = newMovementTracker[fromRow][fromCol];
    newMovementTracker[fromRow][fromCol] = null;
    movementTracker.current = newMovementTracker;
    
    // Directly move the piece on the board (visually)
    movePieceOnBoard(fromRow, fromCol, toRow, toCol, isCapture, () => {
      // Switch player
      const currentTurn = currentPlayerRef.current;
      const nextPlayer = currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
      
      // Update the ref immediately before setting state
      currentPlayerRef.current = nextPlayer;
      
      // Update the state to match the ref
      setCurrentPlayer(nextPlayer);
      
      // Check for check, checkmate, or stalemate using the movement tracker
      const isInCheck = isKingInCheck(newMovementTracker, nextPlayer);
      const isInCheckmate = isInCheck && isCheckmate(newMovementTracker, nextPlayer);
      
      // Record the move in chess notation
      const moveNotation = getChessNotation(
        movingPiece, 
        fromRow, 
        fromCol, 
        toRow, 
        toCol, 
        isCapture, 
        isInCheck, 
        isInCheckmate
      );
      
      
      // Add the move to history
      const newMove = {
        piece: movingPiece,
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        isCapture,
        isCheck: isInCheck,
        isCheckmate: isInCheckmate,
        player: currentTurn,
        notation: moveNotation,
        nextPlayer: nextPlayer // Include the next player in move history for debugging
      };
      
      // Update both the ref and the state to prevent race conditions
      const updatedHistory = [...moveHistoryRef.current, newMove];
      moveHistoryRef.current = updatedHistory;
      setMoveHistory(updatedHistory);
      console.log('Move history updated:', updatedHistory.map(m => `${m.player} ${m.piece.type} ${m.notation}`));
      
      // Update game status
      if (isInCheckmate) {
        const winnerColor = currentTurn === COLORS.WHITE ? 'White' : 'Black';
        setGameStatus(`Checkmate! ${winnerColor} wins!`);
        setWinner(winnerColor);
        setShowWinnerPopup(true);
      } else if (isInCheck) {
        setGameStatus(`${nextPlayer === COLORS.WHITE ? 'White' : 'Black'} is in check!`);
      } else if (isStalemate(newMovementTracker, nextPlayer)) {
        setGameStatus('Stalemate! The game is a draw.');
        setWinner('Draw');
        setShowWinnerPopup(true);
      } else {
        setGameStatus(null);
      }
      
      // Display toast notification for the move with improved styling
      const colorText = currentTurn === COLORS.WHITE ? 'White' : 'Black';
      const pieceIcon = getPieceIcon(movingPiece.type);
      
      // Show appropriate toast based on game state
      if (isInCheckmate) {
        toast.success(`${colorText} wins by checkmate!`, {
          icon: '♔',
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#222',
            color: '#fff',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '16px',
            fontWeight: '500',
          },
        });
      } else if (isInCheck) {
        toast(`${pieceIcon} ${moveNotation} - Check!`, {
          icon: '⚠️',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#d32f2f',
            color: '#fff',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '16px',
            fontWeight: '500',
          },
        });
      } else if (isCapture) {
        toast(`${pieceIcon} ${moveNotation}`, {
          icon: '✖️',
          duration: 2500,
          style: {
            borderRadius: '12px',
            background: '#444',
            color: '#fff',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '16px',
            fontWeight: '500',
          },
        });
      } else {
        toast(`${pieceIcon} ${moveNotation}`, {
          duration: 2000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '16px',
          },
        });
      }
      
      // If AI is enabled and it's AI's turn, make an AI move
      if (aiEnabled && nextPlayer === aiColor && !isInCheckmate && !isStalemate(newMovementTracker, nextPlayer)) {
        makeAiMove();
      }
    });
  };
  
  // Helper function to get chess piece icon for toast notifications
  const getPieceIcon = (pieceType) => {
    switch (pieceType) {
      case PIECES.PAWN: return '♟';
      case PIECES.ROOK: return '♜';
      case PIECES.KNIGHT: return '♞';
      case PIECES.BISHOP: return '♝';
      case PIECES.QUEEN: return '♛';
      case PIECES.KING: return '♚';
      default: return '♙';
    }
  };
  
  // Make AI move
  const makeAiMove = () => {
    setIsAiThinking(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // Find the best move using our AI
        const bestMove = findBestMove(movementTracker.current, aiColor, aiDifficulty);
        
        if (bestMove) {
          const [fromRow, fromCol] = bestMove.from;
          const [toRow, toCol] = bestMove.to;
          
          // Execute the move
          handlePieceMove(fromRow, fromCol, toRow, toCol);
        } else {
          console.error('AI could not find a valid move');
          toast.error('AI could not find a valid move', {
            style: {
              borderRadius: '12px',
              background: '#d32f2f',
              color: '#fff',
            },
          });
        }
      } catch (error) {
        console.error('Error in AI move calculation:', error);
        toast.error('Error in AI move calculation', {
          style: {
            borderRadius: '12px',
            background: '#d32f2f',
            color: '#fff',
          },
        });
      } finally {
        setIsAiThinking(false);
      }
    }, 500); // Small delay to show thinking state
  };

  // Move piece on the 3D board (visually)
  const movePieceOnBoard = (fromRow, fromCol, toRow, toCol, isCapture, onComplete) => {
    const pieceMesh = piecesRef.current.get(`${fromRow}-${fromCol}`);
    if (!pieceMesh || !sceneRef.current) {
      if (onComplete) onComplete();
      return;
    }
    
    const boardSize = 8;
    const squareSize = 2.0;
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Calculate destination position
    const destX = (toCol * squareSize) - boardOffset + (squareSize / 2);
    const destZ = (toRow * squareSize) - boardOffset + (squareSize / 2);
    
    // Handle captured piece - remove it immediately
    if (isCapture) {
      const capturedPiece = piecesRef.current.get(`${toRow}-${toCol}`);
      if (capturedPiece) {
        sceneRef.current.remove(capturedPiece);
        piecesRef.current.delete(`${toRow}-${toCol}`);
      }
    }
    
    // Force-update piece position
    pieceMesh.position.set(destX, pieceMesh.position.y, destZ);
    
    // Update userData and references for the piece and all its children
    pieceMesh.userData.row = toRow;
    pieceMesh.userData.col = toCol;
    
    // Update userData for all children
    pieceMesh.traverse((object) => {
      if (object !== pieceMesh) { // Skip the parent which we already updated
        object.userData = { 
          ...pieceMesh.userData 
        };
      }
    });
    
    // Update the map references
    piecesRef.current.delete(`${fromRow}-${fromCol}`);
    piecesRef.current.set(`${toRow}-${toCol}`, pieceMesh);
    
    if (onComplete) onComplete();
  };

  // Format move for display
  const formatMoveNumber = (index, player) => {
    const moveNumber = Math.floor(index / 2) + 1;
    return player === COLORS.WHITE ? `${moveNumber}. ` : '';
  };

  // Add a special click handling plane to capture all board clicks
  const createBoardClickPlane = () => {
    if (!sceneRef.current) return;
    
    console.log('Creating board click detection plane');
    
    // Remove any existing click plane
    const existingPlane = sceneRef.current.getObjectByName('boardClickPlane');
    if (existingPlane) {
      sceneRef.current.remove(existingPlane);
    }
    
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;
    const fullBoardSize = boardSize * squareSize;
    
    // Create a plane that covers the entire board
    const planeGeometry = new THREE.PlaneGeometry(fullBoardSize, fullBoardSize);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0.001,  // Almost invisible
      side: THREE.DoubleSide 
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    plane.position.y = 0.15; // Just above the board
    plane.name = 'boardClickPlane';
    
    // Add userData for click detection with row/col info
    plane.userData = {
      type: 'boardClickPlane'
    };
    
    sceneRef.current.add(plane);
    console.log('Board click plane added');
  };

  // Force select a piece directly, bypassing all checks - use for black pieces
  const forceSelectPiece = (row, col, activePlayerOverride = null) => {
    console.log(`FORCE SELECT: Selecting piece at ${row},${col}`);
    console.log(`FORCE SELECT: Current player ref: ${currentPlayerRef.current}`);
    
    try {
      // Debug the position before trying to access it
      debugPieceAtPosition(row, col);
      
      // Get the piece from the movement tracker
      const piece = movementTracker.current[row][col];
      if (!piece) {
        console.error('No piece at selected position in movement tracker!');
        
        // Try the board state as a fallback
        const boardPiece = boardState[row][col];
        if (boardPiece) {
          console.log('Found piece in board state, updating movement tracker');
          // Update the movement tracker with the board state piece
          const newMovementTracker = movementTracker.current.map(row => [...row]);
          newMovementTracker[row][col] = boardPiece;
          movementTracker.current = newMovementTracker;
          
          // Now try again with the updated movement tracker
          return forceSelectPiece(row, col, activePlayerOverride);
        }
        
        return false;
      }
      
      console.log(`Found piece: ${piece.color} ${piece.type}`);
      
      // Use the provided activePlayer if available, otherwise use the ref
      const activePlayer = activePlayerOverride || currentPlayerRef.current;
      console.log(`Using active player: ${activePlayer} for validation`);
      
      // Verify this is the current player's piece
      if (piece.color !== activePlayer) {
        console.error(`Cannot select ${piece.color} piece - it's ${activePlayer}'s turn`);
        return false;
      }
      
      // Create piece data - no validation checks, we're forcing selection
      const pieceData = {
        row,
        col,
        type: piece.type,
        color: piece.color
      };
      
      // CRITICAL: Clear highlights without clearing the piece selection
      clearHighlights(false);
      
      // IMPORTANT: Set the ref first, then the state
      // This ensures the ref is always available immediately
      selectedPieceRef.current = pieceData;
      setSelectedPiece(pieceData);
      
      console.log('Selected piece set to:', pieceData);
      console.log('selectedPieceRef is now:', selectedPieceRef.current);
      
      // Get valid moves
      const moves = getValidMoves(movementTracker.current, row, col);
      console.log(`Found ${moves.length} valid moves:`, moves);
      
      // Set valid moves and highlight them
      setValidMoves(moves);
      highlightValidMoves(moves);
      
      return true;
    } catch (error) {
      console.error('Error in forceSelectPiece:', error);
      return false;
    }
  };

  // Add a direct way to select a piece that bypasses React state timing issues
  const directSelectPiece = (row, col, activePlayerOverride = null) => {
    console.log(`DIRECT SELECT: Selecting piece at ${row},${col}`);
    console.log(`DIRECT SELECT: Current player state: ${currentPlayer}, ref: ${currentPlayerRef.current}`);
    
    try {
      // Debug the position before trying to access it
      debugPieceAtPosition(row, col);
      
      // Get the piece from the movement tracker
      const piece = movementTracker.current[row][col];
      if (!piece) {
        console.error('No piece at selected position in movement tracker!');
        
        // Try the board state as a fallback
        const boardPiece = boardState[row][col];
        if (boardPiece) {
          console.log('Found piece in board state, updating movement tracker');
          // Update the movement tracker with the board state piece
          const newMovementTracker = movementTracker.current.map(row => [...row]);
          newMovementTracker[row][col] = boardPiece;
          movementTracker.current = newMovementTracker;
          
          // Now try again with the updated movement tracker
          return directSelectPiece(row, col, activePlayerOverride);
        }
        
        return false;
      }
      
      console.log(`Found piece: ${piece.color} ${piece.type}`);
      console.log(`Current player is: ${currentPlayer}`);
      console.log(`Current player REF is: ${currentPlayerRef.current}`);
      
      // Use the provided activePlayer if available, otherwise use the ref
      const activePlayer = activePlayerOverride || currentPlayerRef.current;
      console.log(`Using active player: ${activePlayer} for validation`);
      
      // Verify this is the current player's piece
      if (piece.color !== activePlayer) {
        console.error(`Cannot select piece: it's ${activePlayer}'s turn, but piece is ${piece.color}`);
        return false;
      }
      
      // Create piece data
      const pieceData = {
        row,
        col,
        type: piece.type,
        color: piece.color
      };
      
      // CRITICAL: Clear highlights without clearing the piece selection
      clearHighlights(false);
      
      // IMPORTANT: Set the ref first, then the state
      // This ensures the ref is always available immediately
      selectedPieceRef.current = pieceData;
      setSelectedPiece(pieceData);
      
      console.log('Selected piece set to:', pieceData);
      console.log('selectedPieceRef is now:', selectedPieceRef.current);
      
      // Get valid moves
      const moves = getValidMoves(movementTracker.current, row, col);
      console.log(`Found ${moves.length} valid moves:`, moves);
      
      // Set valid moves and highlight them
      setValidMoves(moves);
      highlightValidMoves(moves);
      
      // Verify the selection still exists after highlighting
      console.log('After highlighting, selectedPieceRef is:', selectedPieceRef.current);
      
      return true;
    } catch (error) {
      console.error('Error in directSelectPiece:', error);
      return false;
    }
  };

  // Visual indicator for empty square clicks
  const showEmptySquareIndicator = (row, col) => {
    if (!sceneRef.current) return;
    
    // Board measurements
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Calculate position
    const worldX = (col * squareSize) - boardOffset + (squareSize / 2);
    const worldZ = (row * squareSize) - boardOffset + (squareSize / 2);
    
    // Create a simple indicator (red X)
    const indicatorGroup = new THREE.Group();
    indicatorGroup.position.set(worldX, 0.2, worldZ); // Just above the board
    
    // Create a red X using two crossed lines
    const lineGeometry1 = new THREE.BoxGeometry(0.8, 0.1, 0.1);
    const lineGeometry2 = new THREE.BoxGeometry(0.1, 0.1, 0.8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    const line1 = new THREE.Mesh(lineGeometry1, material);
    line1.rotation.y = Math.PI / 4;
    
    const line2 = new THREE.Mesh(lineGeometry2, material);
    line2.rotation.y = Math.PI / 4;
    
    indicatorGroup.add(line1);
    indicatorGroup.add(line2);
    
    // Add to scene
    sceneRef.current.add(indicatorGroup);
    
    // Remove after a short delay
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.remove(indicatorGroup);
        indicatorGroup.children.forEach(child => {
          child.geometry.dispose();
          child.material.dispose();
        });
      }
    }, 700); // Remove after 700ms
  };

  /**
   * Game end and restart functionality
   * - Displays a winner popup when checkmate or stalemate occurs
   * - Shows winner (White/Black) or indicates a draw
   * - Provides a "Play Again" button to reset the game 
   * - Resets board state, pieces, and player turn
   */
  const restartGame = () => {
    console.log('Restarting game...');
    
    // Reset board state and tracker
    const initialBoard = createInitialBoard();
    setBoardState(initialBoard);
    boardStateRef.current = initialBoard;
    movementTracker.current = initialBoard.map(row => [...row]);
    
    // Reset game state
    setCurrentPlayer(COLORS.WHITE);
    currentPlayerRef.current = COLORS.WHITE;
    selectedPieceRef.current = null;
    setSelectedPiece(null);
    setValidMoves([]);
    clearHighlights(true);
    setGameStatus(null);
    
    // Ensure move history is properly cleared
    moveHistoryRef.current = [];
    setMoveHistory([]);
    console.log('Move history cleared', moveHistoryRef.current, moveHistory);
    
    // Close popup
    setShowWinnerPopup(false);
    setWinner(null);
    
    // Recreate pieces
    if (sceneRef.current) {
      piecesRef.current.forEach(piece => sceneRef.current.remove(piece));
      piecesRef.current.clear();
    }
    placePieces(initialBoard);
    
    // Reset AI thinking state
    setIsAiThinking(false);
    
    // If AI is enabled and AI plays white, trigger AI move
    if (aiEnabled && aiColor === COLORS.WHITE) {
      setTimeout(() => makeAiMove(), 1000);
    }
    
    console.log('Game restart complete');
    
    // Show toast notification for game restart
    toast.success('Game restarted!', {
      icon: '🔄',
      duration: 2000,
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
        padding: '10px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '16px',
      },
    });
  };

  useEffect(() => {
    console.log('Move history state changed:', moveHistory);
  }, [moveHistory]);

  // Toggle AI player
  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
    if (!aiEnabled && currentPlayer === aiColor) {
      // If we're enabling AI and it's already AI's turn, trigger a move
      setTimeout(() => makeAiMove(), 500);
    }
  };
  
  // AI color is always black - no need to change it
  
  // Change AI difficulty
  const changeAIDifficulty = (difficulty) => {
    setAiDifficulty(difficulty);
  };

  return (
    <div>
      <div 
        ref={mountRef} 
        className="w-full h-screen absolute top-0 left-0"
      />
      {gameStatus && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white px-6 py-3 rounded-xl font-bold z-10 backdrop-blur-md border border-slate-700/50 shadow-2xl animate-slide-in-top mobile-responsive">
          <div className="flex items-center space-x-2">
            {gameStatus.includes('Checkmate') && (
              <span className="text-2xl">♔</span>
            )}
            {gameStatus.includes('Check') && !gameStatus.includes('Checkmate') && (
              <span className="text-2xl">⚠️</span>
            )}
            {gameStatus.includes('Stalemate') && (
              <span className="text-2xl">🤝</span>
            )}
            <span className="text-lg">{gameStatus}</span>
          </div>
        </div>
      )}
      {showWinnerPopup && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {winner === 'Draw' ? 'Game Over - Draw!' : `${winner} Wins!`}
            </h2>
            <button 
              onClick={restartGame}
              className="bg-green-500 text-white py-2.5 px-5 rounded font-bold hover:bg-green-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Current Player Status */}
      <div className="absolute bottom-5 left-5 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white px-6 py-4 rounded-xl z-10 backdrop-blur-md border border-slate-700/50 shadow-2xl animate-slide-in-bottom mobile-responsive">
        <div className="flex items-center space-x-3">
          {/* Player Indicator with Animation */}
          <div className="relative">
            <div className={`w-4 h-4 rounded-full ${currentPlayer === COLORS.WHITE ? 'bg-white shadow-lg' : 'bg-slate-800 border-2 border-white shadow-lg'} transition-all duration-300`}></div>
            {currentPlayer === COLORS.WHITE && (
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-20"></div>
            )}
            {currentPlayer === COLORS.BLACK && (
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-20"></div>
            )}
          </div>
          
          {/* Player Text */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-300">Current Turn</span>
            <span className="text-lg font-bold text-white">
              {currentPlayer === COLORS.WHITE ? 'White' : 'Black'}
            </span>
          </div>
          
          {/* AI Thinking Indicator */}
          {isAiThinking && currentPlayer === aiColor && (
            <div className="flex items-center space-x-2 ml-3 pl-3 border-l border-slate-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm text-blue-300 font-medium">AI thinking...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced AI Controls Panel */}
      <div className="absolute bottom-5 right-5 bg-gradient-to-br from-slate-900/95 to-slate-800/95 text-white p-5 rounded-xl z-10 backdrop-blur-md border border-slate-700/50 shadow-2xl w-72 animate-slide-in-bottom mobile-responsive">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h3 className="font-bold text-lg">AI Player</h3>
          </div>
          
          {/* Enhanced Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={aiEnabled}
              onChange={toggleAI}
            />
            <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 shadow-lg"></div>
          </label>
        </div>
        
        {/* AI Status Indicator */}
        {aiEnabled && (
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">AI Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Active</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Playing as: <span className="font-medium text-white">{aiColor === COLORS.WHITE ? 'White' : 'Black'}</span>
            </div>
          </div>
        )}
        
        
        {/* Difficulty Selection */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Difficulty Level</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => changeAIDifficulty('easy')}
              className={`py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                aiDifficulty === 'easy' 
                  ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-800/50 text-slate-300 border border-slate-600 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="font-semibold">Easy</span>
                <div className="flex space-x-1">
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'easy' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => changeAIDifficulty('medium')}
              className={`py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                aiDifficulty === 'medium' 
                  ? 'bg-amber-500 shadow-lg transform scale-105 border-2 border-amber-400' 
                  : 'bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className={`font-bold ${aiDifficulty === 'medium' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>Medium</span>
                <div className="flex space-x-1">
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'medium' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'medium' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => changeAIDifficulty('hard')}
              className={`py-2 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                aiDifficulty === 'hard' 
                  ? 'bg-red-500 text-white shadow-lg transform scale-105' 
                  : 'bg-slate-800/50 text-slate-300 border border-slate-600 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="font-semibold">Hard</span>
                <div className="flex space-x-1">
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'hard' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'hard' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                  <div className={`w-1 h-1 rounded-full ${
                    aiDifficulty === 'hard' ? 'bg-white' : 'bg-slate-400'
                  }`}></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Move History Panel */}
      <div className="absolute top-5 right-5 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-2xl p-5 rounded-xl max-h-[75vh] overflow-hidden z-10 w-80 backdrop-blur-md border border-slate-700/50 animate-slide-in-right mobile-responsive">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">♔</span>
            </div>
            <h3 className="font-bold text-lg text-white">Move History</h3>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            {moveHistory.length} moves
          </div>
        </div>
        
        {/* Move List Container */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 overflow-hidden">
          <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {moveHistory.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-slate-700/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-slate-400">♟</span>
                </div>
                <p className="text-slate-400 text-sm">No moves yet</p>
                <p className="text-slate-500 text-xs mt-1">Start playing to see move history</p>
              </div>
            ) : (
              <div className="p-3">
                {/* Group moves in pairs by turn number */}
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                  // Get white and black moves for this turn
                  const whiteMove = moveHistory.find((move, idx) => Math.floor(idx / 2) === i && move.player === COLORS.WHITE);
                  const blackMove = moveHistory.find((move, idx) => Math.floor(idx / 2) === i && move.player === COLORS.BLACK);
                  
                  return (
                    <div key={i} className="mb-2 last:mb-0">
                      {/* Turn Number */}
                      <div className="flex items-center mb-1">
                        <span className="text-slate-400 text-sm font-medium w-8 text-right mr-3">{i + 1}.</span>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          {/* White Move */}
                          {whiteMove && (
                            <div className={`p-2 rounded-lg transition-all duration-200 ${
                              whiteMove.isCheckmate 
                                ? 'bg-red-500/20 border border-red-500/30' 
                                : whiteMove.isCheck 
                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                : whiteMove.isCapture
                                ? 'bg-orange-500/20 border border-orange-500/30'
                                : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getPieceIcon(whiteMove.piece.type)}</span>
                                <span className={`font-mono text-sm font-medium ${
                                  whiteMove.isCheckmate 
                                    ? 'text-red-300' 
                                    : whiteMove.isCheck 
                                    ? 'text-yellow-300'
                                    : whiteMove.isCapture
                                    ? 'text-orange-300'
                                    : 'text-white'
                                }`}>
                                  {whiteMove.notation}
                                </span>
                                {whiteMove.isCheckmate && <span className="text-red-400 text-xs">#</span>}
                                {whiteMove.isCheck && !whiteMove.isCheckmate && <span className="text-yellow-400 text-xs">+</span>}
                              </div>
                            </div>
                          )}
                          
                          {/* Black Move */}
                          {blackMove && (
                            <div className={`p-2 rounded-lg transition-all duration-200 ${
                              blackMove.isCheckmate 
                                ? 'bg-red-500/20 border border-red-500/30' 
                                : blackMove.isCheck 
                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                : blackMove.isCapture
                                ? 'bg-orange-500/20 border border-orange-500/30'
                                : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getPieceIcon(blackMove.piece.type)}</span>
                                <span className={`font-mono text-sm font-medium ${
                                  blackMove.isCheckmate 
                                    ? 'text-red-300' 
                                    : blackMove.isCheck 
                                    ? 'text-yellow-300'
                                    : blackMove.isCapture
                                    ? 'text-orange-300'
                                    : 'text-white'
                                }`}>
                                  {blackMove.notation}
                                </span>
                                {blackMove.isCheckmate && <span className="text-red-400 text-xs">#</span>}
                                {blackMove.isCheck && !blackMove.isCheckmate && <span className="text-yellow-400 text-xs">+</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        {moveHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600/30">
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Capture</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Check</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Checkmate</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chessboard;