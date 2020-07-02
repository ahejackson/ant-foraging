import { Group } from 'three';
import { createTerrainMesh } from '../util/mesh-utils';

export default class Terrain {
  mesh: Group;

  constructor(readonly width: number, readonly height: number) {
    this.mesh = createTerrainMesh(width, height);
  }

  update(delta: number) {}
}
