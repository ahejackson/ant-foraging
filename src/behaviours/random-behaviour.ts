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
    // Add home pheromone to the path
    world.pheromones.addPheromone(
      'HOME',
      ant.mesh.position.x,
      ant.mesh.position.z
    );
  }

  nextAction(ant: Ant, world: World): void {
    // Get the passable directions
    const options = world.getPassableAdjacentCells(
      ant.mesh.position.x,
      ant.mesh.position.z
    );

    // Randomly pick one
    if (options.length > 0) {
      const target = AntSim.RNG.pick(options);
      ant.goal = new Vector3(target.x, ANT_HEIGHT, target.y);
    }
  }
}
