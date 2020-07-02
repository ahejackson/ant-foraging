import {
  DoubleSide,
  Group,
  MeshPhongMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  RepeatWrapping,
  TextureLoader,
  Mesh,
  GridHelper,
  BoxGeometry,
  MeshBasicMaterial,
  SphereBufferGeometry,
  BoxBufferGeometry,
} from 'three';

/* This file is responsible for all mesh creation */

// ANT
export const ANT_HEIGHT = 0.25;
const ANT_GEOMETRY = new BoxBufferGeometry(0.7, 0.5, 1);
const ANT_MATERIAL = new MeshBasicMaterial({
  color: 0x0000dd,
});

export function createAntMesh() {
  return new Mesh(ANT_GEOMETRY, ANT_MATERIAL);
}

// COLONY
const COLONY_GEOMETRY = new SphereBufferGeometry(
  2,
  8,
  8,
  0,
  2 * Math.PI,
  0,
  0.5 * Math.PI
);
const COLONY_MATERIAL = new MeshBasicMaterial({
  color: 0x222222,
});

export function createColonyMesh() {
  return new Mesh(COLONY_GEOMETRY, COLONY_MATERIAL);
}

// FOOD
const FOOD_GEOMETRY = new BoxGeometry(1, 1, 1);
const FOOD_MATERIAL = new MeshBasicMaterial({
  color: 0xdddd00,
});

export function createFoodMesh() {
  return new Mesh(FOOD_GEOMETRY, FOOD_MATERIAL);
}

// TERRAIN
export function createTerrainMesh(width: number, height: number) {
  const loader = new TextureLoader();
  const texture = loader.load(
    'https://threejsfundamentals.org/threejs/resources/images/checker.png'
  );
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  texture.repeat.set(width / 2, height / 2);

  const terrainGeo = new PlaneBufferGeometry(width, height);
  const terrainMat = new MeshPhongMaterial({
    map: texture,
    side: DoubleSide,
  });
  const terrain = new Mesh(terrainGeo, terrainMat);

  // rotate the mesh and reposition to make world space match mesh space
  terrain.rotation.x = Math.PI * -0.5;
  terrain.position.set((width - 1) / 2, 0, (height - 1) / 2);

  const terrainGroup = new Group();
  terrainGroup.add(terrain);

  const gridHelper = new GridHelper(width, width);
  gridHelper.position.set((width - 1) / 2, 0.02, (height - 1) / 2);
  terrainGroup.add(gridHelper);

  return terrainGroup;
}
