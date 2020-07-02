import Ant from '../entities/ant';
import World from '../world/world';

export interface AntBehaviour {
  name: String;
  description: String;
  goalReached(ant: Ant, world: World): void;
  nextAction(ant: Ant, world: World): void;
}
