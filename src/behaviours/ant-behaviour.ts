import type Ant from "../entities/ant";
import type World from "../world/world";

export interface AntBehaviour {
	name: string;
	description: string;
	goalReached(ant: Ant, world: World): void;
	nextAction(ant: Ant, world: World): void;
}
