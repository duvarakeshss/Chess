import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createChessPieceMesh } from './ChessPieces';
import { 
  createInitialBoard, 
  getValidMoves, 
  makeMove, 
  isKingInCheck, 
  isCheckmate, 
  isStalemate,
  COLORS 
} from './chesslogic';

const Chessboard = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const piecesRef = useRef(new Map()); // Map to track piece meshes
  const [boardState, setBoardState] = useState(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(COLORS.WHITE);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [highlightMeshes, setHighlightMeshes] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  
  // Raycaster for detecting clicks on the board
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    console.log('Chessboard component mounted');
    
    if (!mountRef.current) {
      console.error('Mount ref is null');
      return;
    }

    // Clear any previous content
    mountRef.current.innerHTML = '';

    // Set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    console.log('Scene created');

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
    
    // Try loading from different possible paths
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
      const squareSize = 2.0; // Reduced from 2.2 to make pieces closer together
      const boardOffset = (boardSize * squareSize) / 2;
      
      // Create squares
      for (let x = 0; x < boardSize; x++) {
        for (let z = 0; z < boardSize; z++) {
          const isWhite = (x + z) % 2 === 0;
          // Using more natural wood-like colors
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
        color: 0x5d3a1a, // Darker wood tone for the border
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
      
      // Raycast to find clicked objects
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      
      console.log('Intersected objects:', intersects.length);
      
      if (intersects.length > 0) {
        // Find the first intersected object that is either a square or a piece
        const target = intersects.find(obj => {
          return obj.object.userData && 
            (obj.object.userData.type === 'square' || obj.object.userData.type === 'piece');
        });
        
        if (target) {
          console.log('Clicked on object:', target.object.userData);
          const userData = target.object.userData;
          
          // If we clicked on a piece that belongs to the current player
          if (userData.type === 'piece' && userData.color === currentPlayer) {
            console.log('Selected piece at row:', userData.row, 'col:', userData.col);
            handlePieceSelection(userData.row, userData.col);
          } 
          // If we clicked on a square and have a piece selected
          else if (userData.type === 'square' && selectedPiece) {
            const { row, col } = userData;
            const { row: selectedRow, col: selectedCol } = selectedPiece;
            
            console.log('Attempting to move from', selectedRow, selectedCol, 'to', row, col);
            
            // Check if the clicked square is a valid move
            const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
            
            if (isValidMove) {
              console.log('Valid move detected, moving piece');
              handlePieceMove(selectedRow, selectedCol, row, col);
            } else {
              console.log('Invalid move attempt');
              
              // If the clicked square is not a valid move, but contains a piece of the current player,
              // select that piece instead
              const pieceAtSquare = boardState[row][col];
              if (pieceAtSquare && pieceAtSquare.color === currentPlayer) {
                handlePieceSelection(row, col);
              } else {
                // Deselect the current piece if clicking on an invalid move
                setSelectedPiece(null);
                clearHighlights();
              }
            }
          } else if (userData.type === 'square') {
            // Clicked on a square without having a piece selected
            const pieceAtSquare = boardState[userData.row][userData.col];
            if (pieceAtSquare && pieceAtSquare.color === currentPlayer) {
              // If there's a piece of the current player at this square, select it
              handlePieceSelection(userData.row, userData.col);
            }
          }
        } else {
          console.log('No targetable object found in intersection');
        }
      }
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

  // Place chess pieces based on the current board state
  const placePieces = (board) => {
    if (!sceneRef.current) return;
    
    console.log('Placing chess pieces on the board');
    
    // Clear existing pieces
    piecesRef.current.forEach((mesh) => {
      sceneRef.current.remove(mesh);
    });
    piecesRef.current.clear();
    
    // Board measurements for proper piece placement
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;  // Reduced from 2.2 to make pieces closer together
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Create and place new pieces
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const piece = board[row][col];
        if (piece) {
          const { type, color } = piece;
          const pieceMesh = createChessPieceMesh(type, color);
          
          // Adjust scale based on the piece type
          let pieceScale = 1.8;  // Increased from 1.4 to 1.8 (added 0.4)
          
          // Adjust scale for each piece type
          if (type === 'pawn') {
            pieceScale = 1.6;  // Increased from 1.2 to 1.6 (added 0.4)
          } else if (type === 'knight' || type === 'bishop') {
            pieceScale = 1.7;  // Increased from 1.3 to 1.7 (added 0.4)
          } else if (type === 'rook') {
            pieceScale = 1.7;  // Increased from 1.3 to 1.7 (added 0.4)
          } else if (type === 'queen') {
            pieceScale = 1.8;  // Increased from 1.4 to 1.8 (added 0.4)
          } else if (type === 'king') {
            pieceScale = 1.8;  // Increased from 1.4 to 1.8 (added 0.4)
          }
          
          pieceMesh.scale.set(pieceScale, pieceScale, pieceScale);
          
          // Calculate position to center pieces on squares
          const worldX = (col * squareSize) - boardOffset + (squareSize / 2);
          const worldZ = (row * squareSize) - boardOffset + (squareSize / 2);
          
          // Position the piece with higher elevation to ensure it's on top of the board
          pieceMesh.position.set(
            worldX,
            0.8, // Height above board
            worldZ
          );
          
          // Add metadata to the piece
          pieceMesh.userData = { type: 'piece', row, col, pieceType: type, color };
          
          // Add the piece to the scene
          sceneRef.current.add(pieceMesh);
          
          // Store a reference to the piece
          piecesRef.current.set(`${row}-${col}`, pieceMesh);
        }
      }
    }
    
    console.log(`Placed ${piecesRef.current.size} chess pieces`);
  };

  // Handle piece selection
  const handlePieceSelection = (row, col) => {
    // Clear previous highlights
    clearHighlights();
    
    const piece = boardState[row][col];
    if (piece && piece.color === currentPlayer) {
      // Set the selected piece
      setSelectedPiece({ row, col, type: piece.type, color: piece.color });
      
      // Get valid moves for this piece
      const moves = getValidMoves(boardState, row, col);
      setValidMoves(moves);
      
      // Highlight valid moves
      highlightValidMoves(moves);
    } else {
      // Deselect if clicking on opponent's piece or empty square
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  // Highlight valid moves on the board
  const highlightValidMoves = (moves) => {
    if (!sceneRef.current) return;
    
    const highlightMeshes = [];
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;  // Reduced from 2.2 to make pieces closer together
    const boardOffset = (boardSize * squareSize) / 2;
    
    console.log('Highlighting', moves.length, 'valid moves');
    
    moves.forEach(([row, col]) => {
      const isCapture = boardState[row][col] !== null;
      const color = isCapture ? 0xff0000 : 0x00ff00;
      
      const geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
      const material = new THREE.MeshBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.7 
      });
      
      const highlight = new THREE.Mesh(geometry, material);
      
      // Calculate position to center highlight on square
      const worldX = (col * squareSize) - boardOffset + (squareSize / 2);
      const worldZ = (row * squareSize) - boardOffset + (squareSize / 2);
      
      highlight.position.set(
        worldX,
        0.3, // Height just above the board surface
        worldZ
      );
      highlight.userData = { type: 'highlight' };
      
      sceneRef.current.add(highlight);
      highlightMeshes.push(highlight);
    });
    
    // Store references to highlight meshes for later removal
    setHighlightMeshes(highlightMeshes);
  };

  // Clear highlight indicators
  const clearHighlights = () => {
    if (!sceneRef.current) return;
    
    // Remove all highlight meshes from the scene
    highlightMeshes.forEach(mesh => {
      sceneRef.current.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    
    setHighlightMeshes([]);
  };

  // Handle piece movement
  const handlePieceMove = (fromRow, fromCol, toRow, toCol) => {
    // Check if the move is valid
    const isValid = validMoves.some(([row, col]) => row === toRow && col === toCol);
    
    if (!isValid) {
      console.error('Invalid move attempted');
      return;
    }
    
    console.log(`Moving piece from (${fromRow},${fromCol}) to (${toRow},${toCol})`);
    
    // Create a new board state after the move
    const newBoardState = makeMove(boardState, fromRow, fromCol, toRow, toCol);
    
    // Check if this is a capture (if there's a piece at the destination)
    const isCapture = boardState[toRow][toCol] !== null;
    if (isCapture) {
      console.log('Capture detected!');
    }
    
    // Animate the piece movement and update the board
    try {
      animatePieceMove(fromRow, fromCol, toRow, toCol, isCapture, () => {
        // Update the board state
        setBoardState(newBoardState);
        
        // Clear selection and highlights
        setSelectedPiece(null);
        clearHighlights();
        
        // Switch player
        const nextPlayer = currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        setCurrentPlayer(nextPlayer);
        
        // Check for check, checkmate, or stalemate
        if (isKingInCheck(newBoardState, nextPlayer)) {
          if (isCheckmate(newBoardState, nextPlayer)) {
            setGameStatus(`Checkmate! ${currentPlayer === COLORS.WHITE ? 'White' : 'Black'} wins!`);
          } else {
            setGameStatus(`${nextPlayer === COLORS.WHITE ? 'White' : 'Black'} is in check!`);
          }
        } else if (isStalemate(newBoardState, nextPlayer)) {
          setGameStatus('Stalemate! The game is a draw.');
        } else {
          setGameStatus(null);
        }
      });
    } catch (error) {
      console.error('Error during piece movement:', error);
      // Fallback: update the board state directly if animation fails
      setBoardState(newBoardState);
      setSelectedPiece(null);
      clearHighlights();
      setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
    }
  };

  // Animate piece movement
  const animatePieceMove = (fromRow, fromCol, toRow, toCol, isCapture, onComplete) => {
    const pieceMesh = piecesRef.current.get(`${fromRow}-${fromCol}`);
    if (!pieceMesh || !sceneRef.current) {
      console.error('Could not find piece to animate');
      if (onComplete) onComplete();
      return;
    }
    
    const boardSize = 8;  // 8x8 chess board
    const squareSize = 2.0;  // Reduced from 2.2 to make pieces closer together
    const boardOffset = (boardSize * squareSize) / 2;
    
    // Calculate start and end positions using the same logic as piece placement
    const startX = (fromCol * squareSize) - boardOffset + (squareSize / 2);
    const startZ = (fromRow * squareSize) - boardOffset + (squareSize / 2);
    
    const endX = (toCol * squareSize) - boardOffset + (squareSize / 2);
    const endZ = (toRow * squareSize) - boardOffset + (squareSize / 2);
    
    // Calculate start and end positions
    const startPos = new THREE.Vector3(
      startX, 
      0.8, // Match the height used in placePieces
      startZ
    );
    const endPos = new THREE.Vector3(
      endX, 
      0.8, // Match the height used in placePieces
      endZ
    );
    
    console.log('Animation: Moving from', startPos, 'to', endPos);
    
    // If there's a captured piece, animate it disappearing
    if (isCapture) {
      const capturedPiece = piecesRef.current.get(`${toRow}-${toCol}`);
      if (capturedPiece) {
        console.log('Animating capture of piece at', toRow, toCol);
        // Remove it from our reference map
        piecesRef.current.delete(`${toRow}-${toCol}`);
        
        // Animate it floating up and fading out
        const captureAnimation = {
          y: capturedPiece.position.y,
          opacity: 1
        };
        
        const duration = 500;
        let startTime = null;
        
        const animateCapturedPiece = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          capturedPiece.position.y = captureAnimation.y + progress * 2;
          
          // Update material opacity
          capturedPiece.traverse((object) => {
            if (object.isMesh && object.material) {
              if (!object.material.transparent) {
                object.material = object.material.clone();
                object.material.transparent = true;
              }
              object.material.opacity = 1 - progress;
            }
          });
          
          if (progress < 1) {
            requestAnimationFrame(animateCapturedPiece);
          } else {
            // Remove the piece from the scene
            sceneRef.current.remove(capturedPiece);
            
            // Dispose of geometries and materials
            capturedPiece.traverse((object) => {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(mat => mat.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
        };
        
        requestAnimationFrame(animateCapturedPiece);
      } else {
        console.warn('Capture indicated but no piece found at destination');
      }
    }
    
    // Animate the moving piece
    const moveAnimation = {
      x: startPos.x,
      z: startPos.z,
      y: startPos.y
    };
    
    const duration = 500;
    let startTime = null;
    
    const animateMovingPiece = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Interpolate position
      moveAnimation.x = startPos.x + (endPos.x - startPos.x) * progress;
      moveAnimation.z = startPos.z + (endPos.z - startPos.z) * progress;
      
      // Add a slight arc for better visual effect
      moveAnimation.y = startPos.y + Math.sin(progress * Math.PI) * 0.7;
      
      // Update the piece position
      pieceMesh.position.set(moveAnimation.x, moveAnimation.y, moveAnimation.z);
      
      if (progress < 1) {
        requestAnimationFrame(animateMovingPiece);
      } else {
        // Ensure the piece is exactly at the end position
        pieceMesh.position.copy(endPos);
        
        // Update the piece's metadata
        pieceMesh.userData.row = toRow;
        pieceMesh.userData.col = toCol;
        
        // Update our reference map
        piecesRef.current.delete(`${fromRow}-${fromCol}`);
        piecesRef.current.set(`${toRow}-${toCol}`, pieceMesh);
        
        console.log('Animation complete');
        
        // Call the completion callback
        if (onComplete) onComplete();
      }
    };
    
    requestAnimationFrame(animateMovingPiece);
  };

  return (
    <div>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0 
        }} 
      />
      {gameStatus && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          {gameStatus}
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        Current Player: {currentPlayer === COLORS.WHITE ? 'White' : 'Black'}
      </div>
    </div>
  );
};

export default Chessboard; 