import { saveAs } from 'file-saver';
import Colony from '../entities/colony';
import Food from '../entities/food';
import { AntMap } from '../world/ant-map';
import World from '../world/world';
import DEFAULT_MAP from '../world/default-map.json';

export function saveMap(world: World) {
  console.log('Saving...');

  const map: AntMap = {
    width: world.width,
    height: world.height,
    colonies: saveColonies(world.colonies),
    food: saveFood(world.food),
    terrainCompressed: saveTerrainCompressed(
      world.cellPassable,
      world.width,
      world.height
    ),
    // terrain: saveTerrain(world.cellPassable),
  };

  saveAs(
    new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' }),
    'map.json'
  );
  return map;
}

export function saveTerrainCompressed(
  cells: boolean[][],
  width: number,
  height: number
) {
  // convert the booleans to a flat array of 1s and 0s
  const boolArray = cells.flatMap((row) =>
    row.map((cell) => (cell ? '0' : '1'))
  );

  // Bundle the booleans up into chunks of 8 (and reverse)
  const boolBundles = boolArray
    .reduce<('0' | '1')[][]>(
      ([c, ...r], b, i) =>
        (boolArray.length - i) % 8 == 0 ? [[b], c, ...r] : [[...c, b], ...r],
      [[]]
    )
    .reverse();

  // convert each chunk to a binary string, then to a number, then to a character
  const mapString = boolBundles
    .map((bundle) => bundle.join(''))
    .map((bundleString) => parseInt(bundleString, 2))
    .map((bundleInt) => String.fromCharCode(bundleInt))
    .join('');

  return `${width},${height}~${btoa(mapString)}`;
}

export function loadTerrainCompressed(s: string) {
  const [dimensions, mapString] = s.split('~');
  const [width, height] = dimensions.split(',').map((dim) => parseInt(dim));

  // expand to bool bundles, then flat map to a long list of booleans and cut to size
  return atob(mapString)
    .split('')
    .map((c) => c.charCodeAt(0))
    .map((s) => Number(s).toString(2).padStart(8, '0'))
    .flatMap((b) => b.split(''))
    .slice(-width * height)
    .map((c) => c === '0');
}

export function saveTerrain(cells: boolean[][]) {
  return cells
    .map((row) => row.map((cell) => (cell ? '0' : '1')).join(''))
    .join(',');
}

export function loadTerrain(s: string) {
  const rows = s.split(',');
  return rows.map((row) => [...row].map((cell) => cell === '0'));
}

export function saveFood(food: Food[]) {
  return food.map((f) => {
    return { x: f.mesh.position.x, y: f.mesh.position.z };
  });
}

export function saveColonies(colonies: Colony[]) {
  return colonies.map((colony) => {
    return { x: colony.mesh.position.x, y: colony.mesh.position.z };
  });
}

export function loadDefaultMap() {
  const map: AntMap = DEFAULT_MAP;
  return map;
}

export function loadMap(map: AntMap, world: World) {
  world.createTerrain(0, 0, map.width, map.height);

  if (map.colonies) {
    map.colonies.forEach((colony) => world.createColony(colony.x, colony.y));
  }

  if (map.food) {
    map.food.forEach((food) => world.createFood(food.x, food.y));
  }

  // load the obstacles either from compressed or uncompressed form
  if (map.terrainCompressed) {
    const cells = loadTerrainCompressed(map.terrainCompressed);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!cells[y * map.height + x]) {
          world.createObstacle(x, y);
        }
      }
    }
  } else if (map.terrain) {
    const cells = loadTerrain(map.terrain);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!cells[y][x]) {
          world.createObstacle(x, y);
        }
      }
    }
  }

  return world;
}
