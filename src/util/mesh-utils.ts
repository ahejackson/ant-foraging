import {
  BoxBufferGeometry,
  BoxGeometry,
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  SphereBufferGeometry,
} from 'three';

/* This file is responsible for all mesh creation */

// ANT
export const ANT_HEIGHT = 0.25;
export const ANT_GEOMETRY = new BoxBufferGeometry(0.7, 0.5, 1);
export const ANT_MATERIAL = new MeshBasicMaterial({
  color: 0x0000dd,
});

export function createAntMesh() {
  return new Mesh(ANT_GEOMETRY, ANT_MATERIAL);
}

// COLONY
export const COLONY_GEOMETRY = new SphereBufferGeometry(
  2,
  8,
  8,
  0,
  2 * Math.PI,
  0,
  0.5 * Math.PI
);
export const COLONY_MATERIAL = new MeshBasicMaterial({
  color: 0x222222,
});

export function createColonyMesh() {
  return new Mesh(COLONY_GEOMETRY, COLONY_MATERIAL);
}

// FOOD
export const FOOD_GEOMETRY = new BoxGeometry(1, 1, 1);
export const FOOD_MATERIAL = new MeshBasicMaterial({
  color: 0xdddd00,
});

export function createFoodMesh() {
  return new Mesh(FOOD_GEOMETRY, FOOD_MATERIAL);
}

// TERRAIN

export const TERRAIN_MATERIAL = new MeshBasicMaterial({
  color: 0x999999,
  side: DoubleSide,
});

export function createTerrainMesh(width: number, height: number) {
  const terrainGeo = new PlaneBufferGeometry(width, height);
  const terrain = new Mesh(terrainGeo, TERRAIN_MATERIAL);

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

export const OBSTACLE_HEIGHT = 1;
export const OBSTACLE_GEOMETRY = new BoxGeometry(1, 2, 1);
export const OBSTACLE_MATERIAL = new MeshBasicMaterial({
  color: 0x454545,
});

export function createObstacleMesh() {
  return new Mesh(OBSTACLE_GEOMETRY, OBSTACLE_MATERIAL);
}

// PHEREMONES
export const PHEREMONE_CELL_HEIGHT = 0.01;
export const PHEREMONE_CELL_GEOMETRY = new PlaneBufferGeometry(1, 1);

export function createPheromoneGridMesh(
  width: number,
  height: number
): [Mesh[][], Group] {
  const cells = Array<Mesh[]>(height);
  const cellGroup = new Group();
  for (let cY = 0; cY < height; cY++) {
    cells[cY] = Array<Mesh>(width);

    for (let cX = 0; cX < width; cX++) {
      cells[cY][cX] = new Mesh(PHEREMONE_CELL_GEOMETRY, TERRAIN_MATERIAL);
      cells[cY][cX].rotation.x = Math.PI * -0.5;
      cells[cY][cX].position.set(cX, PHEREMONE_CELL_HEIGHT, cY);
      cellGroup.add(cells[cY][cX]);
    }
  }
  return [cells, cellGroup];
}

export const HOME_PHEREMONE_COLORS = [
  0x800026,
  0xbd0026,
  0xe31a1c,
  0xfc4e2a,
  0xfd8d3c,
  0xfeb24c,
  0xfed976,
  0xffeda0,
  0xffffcc,
];

export function createHomePheromoneMaterials() {
  return HOME_PHEREMONE_COLORS.map(
    (color) => new MeshBasicMaterial({ color, side: DoubleSide })
  );
}

export const FOOD_PHEREMONE_COLORS = [
  0x084081,
  0x0868ac,
  0x2b8dbe,
  0x4eb4d3,
  0x7bccc4,
  0xa8ddb5,
  0xccebc5,
  0xe0f3db,
  0xf7fcf0,
];

export function createFoodPheromoneMaterials() {
  return FOOD_PHEREMONE_COLORS.map(
    (color) => new MeshBasicMaterial({ color, side: DoubleSide })
  );
}
