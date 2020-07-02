import { Mesh, Vector3 } from 'three';
import { createAntMesh } from '../util/mesh-utils';
import AntSim from '../sim/ant-sim';

export enum AntState {
  IN_COLONY,
  FORAGING,
  RETURNING_TO_COLONY,
}

export default class Ant {
  scent = 'ONE';
  state = AntState.IN_COLONY;
  mesh: Mesh;

  constructor(x: number, y: number) {
    this.mesh = createAntMesh();
    this.mesh.position.set(x, 0.25, y);
    this.mesh.rotation.y = Math.random() * Math.PI * 2;
  }

  update(delta: number) {
    let movement = new Vector3(0.005, 0, 0);
    let normal = new Vector3(0, 1, 0);
    movement.applyAxisAngle(normal, this.mesh.rotation.y);

    this.mesh.position.add(movement);
    this.mesh.rotation.y += AntSim.RNG.range(-0.005, 0.005);
  }
}
