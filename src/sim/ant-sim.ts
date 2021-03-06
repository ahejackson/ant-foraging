import { Scene } from 'three';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import { VariablePheromoneIncrementingBehaviour } from '../behaviours/variable-pheromone-incrementing-behaviour';
import Pheromone from '../pheromone/pheromone';
import { loadDefaultMap, loadMap } from '../util/map-utils';
import {
  createFoodPheromoneMaterials,
  createHomePheromoneMaterials,
} from '../util/mesh-utils';
import RNG from '../util/random';
import Timer from '../util/timer';
import World from '../world/world';
import * as Settings from './settings';

export default class AntSim {
  static RNG: RNG;
  world: World;
  antSpawnTimer: Timer;
  antBehaviour: AntBehaviour;

  constructor(readonly scene: Scene) {
    // 1. Setup the log
    console.log('Ant Simulation');

    // 2. Setup the random number generator
    const seed = 'antsim';
    AntSim.RNG = new RNG(seed);
    console.log(`seed=${AntSim.RNG.seed}`);

    // 3. Setup the ant's behaviour
    this.antBehaviour = new VariablePheromoneIncrementingBehaviour();

    // 4. Setup the world
    const map = loadDefaultMap();
    this.world = new World(map.width, map.height, scene);
    loadMap(map, this.world);

    // 6. Setup the pheromones
    this.world.pheromones.addLayer(
      new Pheromone(
        'HOME',
        Settings.HOME_PHEREMONE_MAX,
        Settings.HOME_PHEREMONE_INCREMENT,
        Settings.HOME_PHEREMONE_DECAY_INTERVAL,
        createHomePheromoneMaterials()
      )
    );
    this.world.pheromones.addLayer(
      new Pheromone(
        'FOOD',
        Settings.FOOD_PHEREMONE_MAX,
        Settings.FOOD_PHEREMONE_INCREMENT,
        Settings.FOOD_PHEREMONE_DECAY_INTERVAL,
        createFoodPheromoneMaterials()
      )
    );

    // 7. Setup ant spawn timer
    this.antSpawnTimer = new Timer();
  }

  update(delta: number) {
    // 1. check if we should be spawning new ants
    if (this.world.ants.length < Settings.MAX_ANTS) {
      this.antSpawnTimer.update(delta);
      if (this.antSpawnTimer.time > Settings.ANT_SPAWN_INTERVAL) {
        this.antSpawnTimer.reset();

        for (let i = 0; i < Settings.ANTS_PER_SPAWN; i++) {
          this.world.createAnt(
            this.world.colonies[0].mesh.position.x,
            this.world.colonies[0].mesh.position.z,
            this.world.colonies[0],
            this.antBehaviour
          );
        }
      }
    }

    this.world.update(delta);
  }
}
