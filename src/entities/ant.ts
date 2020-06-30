import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';

export enum AntState {
  IN_COLONY,
  FORAGING,
  RETURNING_TO_COLONY,
}

export default class Ant {
  static readonly GEOMETRY = new BoxBufferGeometry(1, 0.5, 0.7);
  static readonly MATERIAL = new MeshBasicMaterial({
    color: 0x0000dd,
  });

  scent = 'ONE';
  state = AntState.IN_COLONY;
  mesh: Mesh;

  constructor(x: number, y: number) {
    this.mesh = new Mesh(Ant.GEOMETRY, Ant.MATERIAL);
    this.mesh.position.x = x;
    this.mesh.position.z = y;
    this.mesh.position.y = 0.25;

    this.mesh.rotation.y = Math.random() * Math.PI * 2;
  }

  update(delta: number) {
    let movement = new Vector3(0.005, 0, 0);
    let normal = new Vector3(0, 1, 0);
    movement.applyAxisAngle(normal, this.mesh.rotation.y);

    this.mesh.position.add(movement);
    this.mesh.rotation.y += (Math.random() - 0.5) * 0.001;
  }
}
