import RNG from '../util/random';
import * as Settings from './settings';
import World from '../world/world';
import { Scene } from 'three';

export default class AntSim {
  rng: RNG;
  world: World;

  constructor(readonly scene: Scene) {
    // 1. Setup the log
    console.log('Ant Simulation');

    // 2. Setup the random number generator
    const seed = 'antsim';
    this.rng = new RNG(seed);
    console.log(`seed=${this.rng.seed}`);
    console.log(this.rng.next());
    console.log(this.rng.next());

    // 3. Setup the world
    this.world = new World(Settings.WIDTH, Settings.HEIGHT, scene);

    // 4. Setup the map
    this.setupMap();
  }

  setupMap() {
    this.world.createTerrain(0, 0, Settings.WIDTH, Settings.HEIGHT);
    this.world.createAnt(0, 0);
    this.world.createAnt(19, 19);
    this.world.createColony(10, 10);
    this.world.createFood(17, 3);
    this.world.createPheremone(0, 0, Settings.WIDTH, Settings.HEIGHT);
  }

  update(delta: number) {
    this.world.update(delta);
  }
}
