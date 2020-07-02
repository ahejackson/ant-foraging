import { createFoodMesh } from '../util/mesh-utils';
import { Mesh } from 'three';

export default class Food {
  mesh: Mesh;

  constructor(x: number, y: number) {
    this.mesh = createFoodMesh();
    this.mesh.position.set(x, 0.5, y);
  }

  update(delta: number) {}
}
