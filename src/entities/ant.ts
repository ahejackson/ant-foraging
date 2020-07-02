import { Mesh, Vector3 } from 'three';
import AntSim from '../sim/ant-sim';
import * as Settings from '../sim/settings';
import { ANT_HEIGHT, createAntMesh } from '../util/mesh-utils';
import Colony from './colony';

export enum AntState {
  IN_COLONY,
  FORAGING,
  RETURNING_TO_COLONY,
}

export default class Ant {
  // Properties
  scent = 'ONE';
  mesh: Mesh;

  // State
  state = AntState.IN_COLONY;
  hasFood = false;
  goal: Vector3 | null = null;
  steps = 0;

  constructor(x: number, y: number, readonly colony: Colony) {
    this.mesh = createAntMesh();
    this.mesh.position.set(x, ANT_HEIGHT, y);
    this.mesh.rotation.y = Math.random() * Math.PI * 2;
  }

  update(delta: number) {
    // if the ant has a goal, it moves towards its goal
    if (this.goal !== null) {
      // how far has the ant travelled in this time step?
      const distanceTravelled = (Settings.ANT_SPEED * delta) / 1000;

      // how far does it have to go?
      const distanceRemaining = this.mesh.position.distanceTo(this.goal);

      // if the ant has travelled far enough to reach its goal, set its position to that goal
      if (distanceRemaining <= distanceTravelled) {
        this.mesh.position.copy(this.goal);
        this.steps++;
        this.goal = null;
      } else {
        // otherwise it moves towards its goal
        this.mesh.lookAt(this.goal);
        this.mesh.position.lerp(
          this.goal,
          distanceTravelled / distanceRemaining
        );
      }
    } else {
      // if the ant has no goal, it needs a new one
      this.goal = new Vector3(
        AntSim.RNG.range(Settings.WIDTH),
        ANT_HEIGHT,
        AntSim.RNG.range(Settings.HEIGHT)
      );
    }
  }
}
