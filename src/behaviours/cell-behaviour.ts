import { Vector3, Vector2 } from 'three';
import Ant, { AntState } from '../entities/ant';
import AntSim from '../sim/ant-sim';
import { ANT_HEIGHT } from '../util/mesh-utils';
import World from '../world/world';
import { AntBehaviour } from './ant-behaviour';
import { FOOD_PHEREMONE, HOME_PHEREMONE } from '../pheromone/pheromone';
import { ANT_CURIOSITY } from '../sim/settings';

export class CellBehaviour implements AntBehaviour {
  readonly name = 'Cell';
  readonly description = `
 Using this behaviour, ants construct and follow a basic gradient pattern as they search for food and return it to the colony.

Whenever and ant reaches its goal location it will lay down pheromone - either a "HOME" pheromone if it doesn't have food, or a "FOOD" pheromone if it does. The ant lays down pheromone in a fixed quantity (up to a maximum value in each cell).

 In general this strategy isn't successful because the simplistic way pheromone is laid down means that it is hard for the ants to create and follow trails.

In particular, groups of ants, some with food and some without, can get stuck in their own little back and forth where they are constantly topping up the levels of each other's pheromone trails.

The initial exploratory stage is also very slow as the ants are doing random walks.`;

  goalReached(ant: Ant, world: World) {
    switch (ant.state) {
      case AntState.IN_COLONY:
        // Log to console - this state shouldn't happen
        console.log('An ant is hanging around its colony...');
        break;
      case AntState.FORAGING:
        this.foragingGoalReached(ant, world);
        break;
      case AntState.RETURNING_TO_COLONY:
        this.returningGoalReached(ant, world);
        break;
    }
  }

  foragingGoalReached(ant: Ant, world: World) {
    // 1. Check if the current cell contains food
    const foodInCell = world.foodInCell(
      ant.mesh.position.x,
      ant.mesh.position.z
    );

    if (foodInCell.length > 0) {
      // If so, pickup the food and change the state
      ant.pickupFood(AntSim.RNG.pick(foodInCell));
      ant.state = AntState.RETURNING_TO_COLONY;
    } else {
      // If not, lay down home pheromone
      world.pheromones.addPheromone(
        HOME_PHEREMONE,
        ant.mesh.position.x,
        ant.mesh.position.z
      );
    }
  }

  returningGoalReached(ant: Ant, world: World) {
    // Check if the ant has returned to its home colony
    if (ant.isHome()) {
      // if so, return any food it is carrying and change the state
      if (ant.hasFood) {
        ant.returnFood();
      }
      ant.state = AntState.IN_COLONY;
    } else {
      // 1. if not, and the ant is carrying food (which it should be) lay down food pheromone
      if (ant.hasFood) {
        world.pheromones.addPheromone(
          FOOD_PHEREMONE,
          ant.mesh.position.x,
          ant.mesh.position.z
        );
      }
    }
  }

  nextAction(ant: Ant, world: World): void {
    switch (ant.state) {
      case AntState.IN_COLONY:
        // change state to foraging
        ant.state = AntState.FORAGING;
        break;
      case AntState.FORAGING:
        this.nextForagingAction(ant, world);
        break;
      case AntState.RETURNING_TO_COLONY:
        this.nextReturningAction(ant, world);
        break;
    }
  }

  nextForagingAction(ant: Ant, world: World) {
    // 1. find the adjacent cells
    const options = world.getPassableAdjacentCells(
      ant.mesh.position.x,
      ant.mesh.position.z
    );

    // 2. check that there are some (there should be...)
    if (options.length == 0) {
      // this should not happen
      console.log(
        'Ant stuck at (${ant.mesh.position.x}, ${ant.mesh.position.z})'
      );
      return null;
    }

    // 3. is there food in any of them?
    const possibleFoodSources = options.flatMap((cell) =>
      world.foodInCell(cell.x, cell.y)
    );

    // 4. if so, go to a random food cell
    if (possibleFoodSources.length > 0) {
      ant.goal = AntSim.RNG.pick(possibleFoodSources).mesh.position.clone();
      return ant.goal;
    }

    // 5. if not, check if the ant will be curious
    if (AntSim.RNG.next() < ANT_CURIOSITY) {
      // if it is, head to a random option
      const target = AntSim.RNG.pick(options);
      ant.goal = new Vector3(target.x, ANT_HEIGHT, target.y);
      return ant.goal;
    }

    // 6. if not, look at how much food pheromone is in the surrounding food cells
    let bestLocations: Vector2[] = [];
    let pheromoneLevel = 0;
    let mostPheromone = 0;

    options.forEach((cell) => {
      pheromoneLevel = world.pheromones.pheromoneValueAt(
        FOOD_PHEREMONE,
        cell.x,
        cell.y
      );

      if (pheromoneLevel > mostPheromone) {
        mostPheromone = pheromoneLevel;
        bestLocations = [cell];
      } else if (pheromoneLevel === mostPheromone) {
        bestLocations.push(cell);
      }
    });

    // 7. randomly pick among the best possible locations
    const target = AntSim.RNG.pick(bestLocations);
    ant.goal = new Vector3(target.x, ANT_HEIGHT, target.y);
    return ant.goal;
  }

  nextReturningAction(ant: Ant, world: World) {
    // 1. find the adjacent cells
    const options = world.getPassableAdjacentCells(
      ant.mesh.position.x,
      ant.mesh.position.z
    );

    // 2. check that there are some (there should be...)
    if (options.length == 0) {
      // this should not happen
      console.log(
        'Ant stuck at (${ant.mesh.position.x}, ${ant.mesh.position.z})'
      );
      return null;
    }

    // 3. if not, look at how much home pheromone is in the surrounding food cells
    let bestLocations: Vector2[] = [];
    let pheromoneLevel = 0;
    let mostPheromone = 0;

    options.forEach((cell) => {
      pheromoneLevel = world.pheromones.pheromoneValueAt(
        HOME_PHEREMONE,
        cell.x,
        cell.y
      );

      if (pheromoneLevel > mostPheromone) {
        mostPheromone = pheromoneLevel;
        bestLocations = [cell];
      } else if (pheromoneLevel === mostPheromone) {
        bestLocations.push(cell);
      }
    });

    // 4. randomly pick among the best possible locations
    const target = AntSim.RNG.pick(bestLocations);
    ant.goal = new Vector3(target.x, ANT_HEIGHT, target.y);
    return ant.goal;
  }
}
