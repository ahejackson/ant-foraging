import { Vector3 } from 'three';
import Ant, { AntState } from '../entities/ant';
import { FOOD_PHEREMONE, HOME_PHEREMONE } from '../pheremone/pheremone';
import AntSim from '../sim/ant-sim';
import { ANT_CURIOSITY } from '../sim/settings';
import { ANT_HEIGHT } from '../util/mesh-utils';
import {
  Direction,
  directionsForward,
  directionVectors,
  getDirectionNames,
} from '../world/direction';
import World from '../world/world';
import { AntBehaviour } from './ant-behaviour';

export class DirectedCellBehaviour implements AntBehaviour {
  readonly name = 'Directed';
  readonly description = `
  A more sophisticated form of the Cell Behaviour`;

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

  moveDirection(ant: Ant, d: Direction) {
    ant.goal = new Vector3(
      ant.mesh.position.x + directionVectors[d].x,
      ANT_HEIGHT,
      ant.mesh.position.z + directionVectors[d].y
    );
    ant.setDirection(d);
    return ant.goal;
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
      ant.setDirection(null);
      ant.state = AntState.RETURNING_TO_COLONY;
    } else {
      // If not, lay down home pheremone
      world.pheremones.addPheremone(
        HOME_PHEREMONE,
        ant.mesh.position.x,
        ant.mesh.position.z
      );
    }
  }

  returningGoalReached(ant: Ant, world: World) {
    // Check if the ant has returned to its home colony
    if (
      Math.floor(ant.mesh.position.x) ===
        Math.floor(ant.colony.mesh.position.x) &&
      Math.floor(ant.mesh.position.z) === Math.floor(ant.colony.mesh.position.z)
    ) {
      // if so, return any food it is carrying and change the state
      if (ant.hasFood) {
        ant.returnFood();
      }
      ant.setDirection(null);
      ant.state = AntState.IN_COLONY;
    } else {
      // 1. if not, and the ant is carrying food (which it should be) lay down food pheremone
      if (ant.hasFood) {
        world.pheremones.addPheremone(
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
    const antX = ant.mesh.position.x;
    const antY = ant.mesh.position.z;

    // 1. find the passable directions
    const options = world.getPassableAdjacentDirections(antX, antY);

    // 2. check that there are some (there should be...)
    if (options.length == 0) {
      // this should not happen
      console.log('Ant stuck at (${antX}, ${antY})');
      return null;
    }

    // 3. is there food in any of them?
    const possibleFoodDirections = options.filter(
      (d) =>
        world.foodInCell(
          antX + directionVectors[d].x,
          antY + directionVectors[d].y
        ).length > 0
    );

    // 4. if so, go to a random food cell
    if (possibleFoodDirections.length > 0) {
      return this.moveDirection(ant, AntSim.RNG.pick(possibleFoodDirections));
    }

    // 5. if not, check if the ant will be curious
    if (AntSim.RNG.next() < ANT_CURIOSITY) {
      // if it is, head to a random option
      return this.moveDirection(ant, AntSim.RNG.pick(options));
    }

    // 6. if not, look at how much food pheremone is in the surrounding food cells,
    // first looking at the forward directions
    // unless no forward options are possible, in which case consider the other directions
    let directionOptions =
      ant.direction == null
        ? options
        : directionsForward(ant.direction).filter((d) => options.includes(d));

    // if the length is 0 it must mean none of the options are in the forward direction,
    // so all the options are non-forward directions
    if (directionOptions.length == 0) {
      directionOptions = options;
    }

    let bestDirections: Direction[] = [];
    let pheremoneLevel = 0;
    let mostPheremone = 0;

    directionOptions.forEach((d) => {
      pheremoneLevel = world.pheremones.pheremoneValueAt(
        FOOD_PHEREMONE,
        antX + directionVectors[d].x,
        antY + directionVectors[d].y
      );

      if (pheremoneLevel > mostPheremone) {
        mostPheremone = pheremoneLevel;
        bestDirections = [d];
      } else if (pheremoneLevel === mostPheremone) {
        bestDirections.push(d);
      }
    });

    // 7. randomly pick among the best possible locations
    if (bestDirections.length > 0) {
      return this.moveDirection(ant, AntSim.RNG.pick(bestDirections));
    }
  }

  nextReturningAction(ant: Ant, world: World) {
    const antX = ant.mesh.position.x;
    const antY = ant.mesh.position.z;

    // 1. find the passable directions
    const options = world.getPassableAdjacentDirections(antX, antY);

    // 2. check that there are some (there should be...)
    if (options.length == 0) {
      // this should not happen
      console.log('Ant stuck at (${antX}, ${antY})');
      return null;
    }

    // 3. is the ant's colony in any of them?
    const possibleColonyDirections = options.filter(
      (d) =>
        Math.floor(antX + directionVectors[d].x) ===
          Math.floor(ant.colony.mesh.position.x) &&
        Math.floor(antY + directionVectors[d].y) ===
          Math.floor(ant.colony.mesh.position.z)
    );

    // 4. if so, go to a random colony cell (though there should only be one)
    if (possibleColonyDirections.length > 0) {
      return this.moveDirection(ant, AntSim.RNG.pick(possibleColonyDirections));
    }

    // 5. if not, check if the ant will be curious
    if (AntSim.RNG.next() < ANT_CURIOSITY) {
      // if it is, head to a random option
      return this.moveDirection(ant, AntSim.RNG.pick(options));
    }

    // 6. if not, look at how much home pheremone is in the surrounding cells,
    // first looking at the forward directions
    // unless no forward options are possible, in which case consider the other directions
    let directionOptions =
      ant.direction == null
        ? options
        : directionsForward(ant.direction).filter((d) => options.includes(d));

    // if the length is 0 it must mean none of the options are in the forward direction,
    // so all the options are non-forward directions
    if (directionOptions.length == 0) {
      directionOptions = options;
    }

    let bestDirections: Direction[] = [];
    let pheremoneLevel = 0;
    let mostPheremone = 0;

    directionOptions.forEach((d) => {
      pheremoneLevel = world.pheremones.pheremoneValueAt(
        HOME_PHEREMONE,
        antX + directionVectors[d].x,
        antY + directionVectors[d].y
      );

      if (pheremoneLevel > mostPheremone) {
        mostPheremone = pheremoneLevel;
        bestDirections = [d];
      } else if (pheremoneLevel === mostPheremone) {
        bestDirections.push(d);
      }
    });

    // 7. randomly pick among the best possible locations
    if (bestDirections.length > 0) {
      return this.moveDirection(ant, AntSim.RNG.pick(bestDirections));
    }
  }
}
