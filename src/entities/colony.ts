import { Mesh, MeshBasicMaterial, SphereBufferGeometry } from 'three';

export default class Colony {
  static readonly GEOMETRY = new SphereBufferGeometry(
    2,
    8,
    8,
    0,
    2 * Math.PI,
    0,
    0.5 * Math.PI
  );
  static readonly MATERIAL = new MeshBasicMaterial({
    color: 0x222222,
  });

  mesh: Mesh;

  constructor(x: number, y: number) {
    this.mesh = new Mesh(Colony.GEOMETRY, Colony.MATERIAL);
    this.mesh.position.set(x, 0, y);
  }

  update(delta: number) {}
}
