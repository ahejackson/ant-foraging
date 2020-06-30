import * as THREE from 'three';

export default class Food {
  static readonly GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
  static readonly MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xdddd00,
  });

  mesh: THREE.Mesh;

  constructor(x: number, y: number) {
    this.mesh = new THREE.Mesh(Food.GEOMETRY, Food.MATERIAL);
    this.mesh.position.set(x, 0.5, y);
  }

  update(delta: number) {}
}
