import { Mesh } from 'three';
import { createColonyMesh } from '../util/mesh-utils';

export default class Colony {
  mesh: Mesh;

  constructor(x: number, y: number) {
    this.mesh = createColonyMesh();
    this.mesh.position.set(x, 0, y);
  }

  update(delta: number) {}
}
