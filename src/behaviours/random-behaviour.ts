import { Vector3 } from 'three';
import Ant from '../entities/ant';
import AntSim from '../sim/ant-sim';
import { ANT_HEIGHT } from '../util/mesh-utils';
import World from '../world/world';
import { AntBehaviour } from './ant-behaviour';

export class RandomBehaviour implements AntBehaviour {
  readonly name = 'Random';
  readonly description = 'This behaviour causes ants to move randomly';

  goalReached(ant: Ant, world: World) {
    // Add home pheremone to the path
    world.addHomePheremone(ant.mesh.position.x, ant.mesh.position.z);
  }

  nextAction(ant: Ant, world: World): void {
    // Get the passable directions
    // Randomly pick one

    ant.goal = new Vector3(
      AntSim.RNG.range(world.width),
      ANT_HEIGHT,
      AntSim.RNG.range(world.height)
    );
  }
}
