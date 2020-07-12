import { Group, Mesh } from 'three';
import { createPheromoneGridMesh, TERRAIN_MATERIAL } from '../util/mesh-utils';
import Pheromone from './pheromone';

export default class PheromoneLayers {
  cells: Mesh[][];
  mesh: Group;

  // the cells represent the geometry
  types: Map<string, Pheromone> = new Map();
  values: Map<string, number[][]> = new Map();
  freshness: Map<string, number[][]> = new Map();

  displayPheromone: string | null = null;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {
    [this.cells, this.mesh] = createPheromoneGridMesh(width, height);
  }

  addLayer(pheromone: Pheromone) {
    this.types.set(pheromone.name, pheromone);

    // create and fill the value and freshness of this pheromone layer
    const value = Array<number[]>(this.height);
    const freshness = Array<number[]>(this.height);

    for (let j = 0; j < this.height; j++) {
      value[j] = Array<number>(this.width).fill(0);
      freshness[j] = Array<number>(this.width).fill(0);
    }

    this.values.set(pheromone.name, value);
    this.freshness.set(pheromone.name, freshness);
  }

  pheromoneValueAt(name: string, x: number, y: number) {
    return this.values.get(name)![Math.floor(y)][Math.floor(x)];
  }

  pheromoneFreshnessAt(name: string, x: number, y: number) {
    return this.freshness.get(name)![Math.floor(y)][Math.floor(x)];
  }

  addPheromone(name: string, x: number, y: number, quantity?: number) {
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
        for (const pheromone of this.types.keys()) {
          this.values.get(pheromone)![cY][cX] = Math.max(
            this.values.get(pheromone)![cY][cX] - 1,
            0
          );
          this.freshness.get(pheromone)![cY][cX] = 0;
        }

        // set material
        // first reset to blank
        this.cells[cY][cX].material = TERRAIN_MATERIAL;
        if (this.displayPheromone === 'STRONGEST') {
          let strongestPheromone: Pheromone | null = null;
          let strongestValue = 0;

          for (let [pheromoneName, pheromone] of this.types.entries()) {
            let value = this.values.get(pheromoneName)![cY][cX];
            if (value > strongestValue) {
              strongestValue = value;
              strongestPheromone = pheromone;
            }
          }

          if (strongestPheromone != null) {
            this.cells[cY][cX].material = strongestPheromone.getMaterial(
              strongestValue
            );
          }
        } else if (this.displayPheromone != null) {
          let value = this.values.get(this.displayPheromone)![cY][cX];
          if (value > 0) {
            this.cells[cY][cX].material = this.types
              .get(this.displayPheromone)!
              .getMaterial(value);
          }
        }
      }
    }
  }
}
