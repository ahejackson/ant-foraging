import * as THREE from 'three';
import { Vector3 } from 'three';

export enum AntState {
  IN_COLONY,
  FORAGING,
  RETURNING_TO_COLONY,
}

export default class Ant {
  static readonly antGeometry = new THREE.BoxGeometry(1, 0.5, 0.7);
  static readonly antMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000dd,
  });

  scent = 'ONE';
  state = AntState.IN_COLONY;
  mesh: THREE.Mesh;

  constructor(x: number, y: number) {
    this.mesh = new THREE.Mesh(Ant.antGeometry, Ant.antMaterial);
    this.mesh.position.x = x;
    this.mesh.position.z = y;
    this.mesh.position.y = 0.25;

    this.mesh.rotation.y = Math.random() * Math.PI * 2;
  }

  update(delta: number) {
    let movement = new THREE.Vector3(0.005, 0, 0);
    let normal = new THREE.Vector3(0, 1, 0);
    movement.applyAxisAngle(normal, this.mesh.rotation.y);

    this.mesh.position.add(movement);
    this.mesh.rotation.y += (Math.random() - 0.5) * 0.001;
  }
}
