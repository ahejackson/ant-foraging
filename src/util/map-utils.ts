import { saveAs } from 'file-saver';
import Colony from '../entities/colony';
import Food from '../entities/food';
import { AntMap } from '../world/ant-map';
import World from '../world/world';
import DEFAULT_MAP from '../world/default-map.json';

export function exportMap(world: World) {
  console.log('Exporting...');

  const map: AntMap = {
    width: world.width,
    height: world.height,
    colonies: exportColonies(world.colonies),
    food: exportFood(world.food),
    terrainCompressed: exportTerrainCompressed(
      world.cellPassable,
      world.width,
      world.height
    ),
    // terrain: exportTerrain(world.cellPassable),
  };

  saveAs(
    new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' }),
    'map.json'
  );
  return map;
}

export function exportTerrainCompressed(
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

export function importTerrainCompressed(s: string) {
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

export function exportTerrain(cells: boolean[][]) {
  return cells
    .map((row) => row.map((cell) => (cell ? '0' : '1')).join(''))
    .join(',');
}

export function importTerrain(s: string) {
  const rows = s.split(',');
  return rows.map((row) => [...row].map((cell) => cell === '0'));
}

export function exportFood(food: Food[]) {
  return food.map((f) => {
    return { x: f.mesh.position.x, y: f.mesh.position.z };
  });
}

export function exportColonies(colonies: Colony[]) {
  return colonies.map((colony) => {
    return { x: colony.mesh.position.x, y: colony.mesh.position.z };
  });
}

export function importMap() {
  const map: AntMap = DEFAULT_MAP;
  return map;
}
