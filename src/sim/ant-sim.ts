import RNG from '../util/random';
import * as Settings from './settings';
import World from '../world/world';
import { Scene } from 'three';
import Timer from '../util/timer';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import { RandomBehaviour } from '../behaviours/random-behaviour';

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
    this.antBehaviour = new RandomBehaviour();

    // 4. Setup the world
    this.world = new World(Settings.WIDTH, Settings.HEIGHT, scene);

    // 5. Setup the map
    this.setupMap();

    // 6. Setup ant spawn timer
    this.antSpawnTimer = new Timer();
  }

  setupMap() {
    this.world.createTerrain(0, 0, Settings.WIDTH, Settings.HEIGHT);
    this.world.createColony(10, 10);
    this.world.createFood(17, 3);
    this.world.createPheremone(0, 0, Settings.WIDTH, Settings.HEIGHT);
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
