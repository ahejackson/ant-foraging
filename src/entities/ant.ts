import { Mesh, Object3D, Vector3 } from 'three';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import { ANT_SPEED } from '../sim/settings';
import {
  ANT_HEIGHT,
  ANT_MATERIAL,
  createAntMesh,
  FOOD_MATERIAL,
} from '../util/mesh-utils';
import { Direction, directionVectors } from '../world/direction';
import World from '../world/world';
import Colony from './colony';
import Food from './food';

export enum AntState {
  IN_COLONY,
  FORAGING,
  RETURNING_TO_COLONY,
}

export default class Ant {
  // Properties
  scent = 'ONE';
  mesh: Object3D;

  // State
  state = AntState.IN_COLONY;
  hasFood = false;
  goal: Vector3 | null = null;
  direction: Direction | null = null;
  steps = 0;

  constructor(
    x: number,
    y: number,
    readonly world: World,
    readonly colony: Colony,
    readonly behaviour: AntBehaviour
  ) {
    this.mesh = createAntMesh();
    this.mesh.position.set(x, ANT_HEIGHT, y);

    this.setDirection(null);
  }

  update(delta: number) {
    // if the ant has a goal, it moves towards its goal
    if (this.goal !== null) {
      // how far has the ant travelled in this time step?
      const distanceTravelled = (ANT_SPEED * delta) / 1000;

      // how far does it have to go?
      const distanceRemaining = this.mesh.position.distanceTo(this.goal);

      // if the ant has travelled far enough to reach its goal, set its position to that goal
      if (distanceRemaining <= distanceTravelled) {
        this.mesh.position.copy(this.goal);
        this.steps++;

        this.behaviour.goalReached(this, this.world);
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
      this.behaviour.nextAction(this, this.world);
    }
  }

  pickupFood(f: Food) {
    this.hasFood = true;
    (this.mesh as Mesh).material = FOOD_MATERIAL;
  }

  returnFood() {
    this.hasFood = false;
    (this.mesh as Mesh).material = ANT_MATERIAL;
  }

  setDirection(direction: Direction | null) {
    this.direction = direction;

    if (this.direction != null) {
      this.mesh.lookAt(
        this.mesh.position.x + directionVectors[this.direction].x,
        this.mesh.position.y,
        this.mesh.position.z + directionVectors[this.direction].y
      );
    }
  }
}
