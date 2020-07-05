import { Group, Mesh } from 'three';
import { createPheremoneGridMesh, TERRAIN_MATERIAL } from '../util/mesh-utils';
import Pheremone from './pheremone';

export default class PheremoneLayers {
  cells: Mesh[][];
  mesh: Group;

  // the cells represent the geometry
  types: Map<string, Pheremone> = new Map();
  values: Map<string, number[][]> = new Map();
  freshness: Map<string, number[][]> = new Map();

  displayPheremone: string | null = null;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {
    [this.cells, this.mesh] = createPheremoneGridMesh(width, height);
  }

  addLayer(pheremone: Pheremone) {
    this.types.set(pheremone.name, pheremone);

    // create and fill the value and freshness of this pheremone layer
    const value = Array<number[]>(this.height);
    const freshness = Array<number[]>(this.height);

    for (let j = 0; j < this.height; j++) {
      value[j] = Array<number>(this.width).fill(0);
      freshness[j] = Array<number>(this.width).fill(0);
    }

    this.values.set(pheremone.name, value);
    this.freshness.set(pheremone.name, freshness);
  }

  pheremoneValueAt(name: string, x: number, y: number) {
    return this.values.get(name)![Math.floor(y)][Math.floor(x)];
  }

  pheremoneFreshnessAt(name: string, x: number, y: number) {
    return this.freshness.get(name)![Math.floor(y)][Math.floor(x)];
  }

  addPheremone(name: string, x: number, y: number, quantity?: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    if (!quantity) {
      quantity = this.types.get(name)!.increment;
    }

    this.values.get(name)![cY][cX] = Math.min(
      this.values.get(name)![cY][cX] + quantity,
      this.types.get(name)!.max
    );
    this.freshness.get(name)![cY][cX] = 0;
  }

  update(delta: number) {
    for (let cY = 0; cY < this.height; cY++) {
      for (let cX = 0; cX < this.width; cX++) {
        for (const pheremone of this.types.keys()) {
          this.values.get(pheremone)![cY][cX] = Math.max(
            this.values.get(pheremone)![cY][cX] - 1,
            0
          );
          this.freshness.get(pheremone)![cY][cX] = 0;
        }

        // set material
        this.cells[cY][cX].material =
          this.displayPheremone == null ||
          this.values.get(this.displayPheremone)![cY][cX] == 0
            ? TERRAIN_MATERIAL
            : this.types
                .get(this.displayPheremone)!
                .getMaterial(this.values.get(this.displayPheremone)![cY][cX]);
      }
    }
  }
}
