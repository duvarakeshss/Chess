import * as THREE from 'three';
import { PIECES, COLORS } from './chesslogic';

// Create basic geometries for different chess pieces
const createPawnGeometry = () => {
  const group = new THREE.Group();
  
  // Base, body and head
  const baseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.25;
  
  const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  const head = new THREE.Mesh(headGeometry);
  head.position.y = 0.45;
  
  group.add(base, body, head);
  return group;
};

const createRookGeometry = () => {
  const group = new THREE.Group();
  
  // Base and body
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.22, 0.25, 0.4, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.3;
  
  const topGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
  const top = new THREE.Mesh(topGeometry);
  top.position.y = 0.55;
  
  group.add(base, body, top);
  
  // Battlements
  const size = 0.1;
  const battlementPositions = [
    [-0.15, 0, -0.15],
    [0.15, 0, -0.15],
    [0.15, 0, 0.15],
    [-0.15, 0, 0.15]
  ];
  
  battlementPositions.forEach(pos => {
    const battlementGeometry = new THREE.BoxGeometry(size, size, size);
    const battlement = new THREE.Mesh(battlementGeometry);
    battlement.position.set(pos[0], 0.65, pos[2]);
    group.add(battlement);
  });
  
  return group;
};

const createKnightGeometry = () => {
  const group = new THREE.Group();
  
  // Base, body, neck and head
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.18, 0.25, 0.25, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.225;
  
  const neckGeometry = new THREE.CylinderGeometry(0.1, 0.18, 0.15, 16);
  const neck = new THREE.Mesh(neckGeometry);
  neck.position.y = 0.425;
  neck.rotation.x = Math.PI * 0.25;
  neck.position.z = 0.05;
  
  const headGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
  const head = new THREE.Mesh(headGeometry);
  head.position.y = 0.575;
  head.position.z = 0.1;
  head.rotation.x = Math.PI * 0.25;
  
  group.add(base, body, neck, head);
  return group;
};

const createBishopGeometry = () => {
  const group = new THREE.Group();
  
  // Base, body, head and slit
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.4, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.3;
  
  const headGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const head = new THREE.Mesh(headGeometry);
  head.position.y = 0.6;
  
  const slitGeometry = new THREE.ConeGeometry(0.08, 0.15, 16);
  const slit = new THREE.Mesh(slitGeometry);
  slit.position.y = 0.675;
  
  group.add(base, body, head, slit);
  return group;
};

const createQueenGeometry = () => {
  const group = new THREE.Group();
  
  // Base, body and crown
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.3;
  
  const crownBaseGeometry = new THREE.CylinderGeometry(0.22, 0.2, 0.1, 16);
  const crownBase = new THREE.Mesh(crownBaseGeometry);
  crownBase.position.y = 0.55;
  
  group.add(base, body, crownBase);
  
  // Crown points
  const points = 8;
  const radius = 0.18;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const pointGeometry = new THREE.ConeGeometry(0.04, 0.12, 8);
    const point = new THREE.Mesh(pointGeometry);
    point.position.x = Math.cos(angle) * radius;
    point.position.z = Math.sin(angle) * radius;
    point.position.y = 0.66;
    group.add(point);
  }
  
  // Top sphere
  const topGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const top = new THREE.Mesh(topGeometry);
  top.position.y = 0.75;
  group.add(top);
  
  return group;
};

const createKingGeometry = () => {
  const group = new THREE.Group();
  
  // Base, body, crown and cross
  const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
  const base = new THREE.Mesh(baseGeometry);
  base.position.y = 0.05;
  
  const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
  const body = new THREE.Mesh(bodyGeometry);
  body.position.y = 0.3;
  
  const crownBaseGeometry = new THREE.CylinderGeometry(0.22, 0.2, 0.1, 16);
  const crownBase = new THREE.Mesh(crownBaseGeometry);
  crownBase.position.y = 0.55;
  
  const crossVerticalGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.05);
  const crossVertical = new THREE.Mesh(crossVerticalGeometry);
  crossVertical.position.y = 0.7;
  
  const crossHorizontalGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.05);
  const crossHorizontal = new THREE.Mesh(crossHorizontalGeometry);
  crossHorizontal.position.y = 0.7;
  
  group.add(base, body, crownBase, crossVertical, crossHorizontal);
  return group;
};

// Create materials for chess pieces
const createMaterial = (color) => {
  return new THREE.MeshStandardMaterial({
    color: color === COLORS.WHITE ? 0xf0f0f0 : 0x3a3a3a,
    roughness: 0.5,
    metalness: 0.1
  });
};

// Create a complete chess piece mesh with proper geometry and material
export const createChessPieceMesh = (type, color) => {
  let geometry;
  
  switch (type) {
    case PIECES.PAWN: geometry = createPawnGeometry(); break;
    case PIECES.ROOK: geometry = createRookGeometry(); break;
    case PIECES.KNIGHT: geometry = createKnightGeometry(); break;
    case PIECES.BISHOP: geometry = createBishopGeometry(); break;
    case PIECES.QUEEN: geometry = createQueenGeometry(); break;
    case PIECES.KING: geometry = createKingGeometry(); break;
    default: geometry = new THREE.Group();
  }
  
  // Apply material to all meshes in the group
  const material = createMaterial(color);
  geometry.traverse(object => {
    if (object.isMesh) {
      object.material = material;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  
  return geometry;
}; 