import { Scene } from 'three';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import { RandomBehaviour } from '../behaviours/random-behaviour';
import Pheremone from '../pheremone/pheremone';
import {
  importMap,
  importTerrain,
  importTerrainCompressed,
} from '../util/map-utils';
import {
  createFoodPheremoneMaterials,
  createHomePheremoneMaterials,
} from '../util/mesh-utils';
import RNG from '../util/random';
import Timer from '../util/timer';
import { AntMap } from '../world/ant-map';
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
    this.antBehaviour = new RandomBehaviour();

    // 4. Setup the world
    this.world = this.loadWorld(importMap(), scene);

    // 6. Setup the pheremones
    this.world.pheremones.addLayer(
      new Pheremone(
        'HOME',
        Settings.HOME_PHEREMONE_MAX,
        Settings.HOME_PHEREMONE_INCREMENT,
        Settings.HOME_PHEREMONE_DECAY_INTERVAL,
        createHomePheremoneMaterials()
      )
    );
    this.world.pheremones.addLayer(
      new Pheremone(
        'FOOD',
        Settings.FOOD_PHEREMONE_MAX,
        Settings.FOOD_PHEREMONE_INCREMENT,
        Settings.FOOD_PHEREMONE_DECAY_INTERVAL,
        createFoodPheremoneMaterials()
      )
    );

    // 7. Setup ant spawn timer
    this.antSpawnTimer = new Timer();
  }

  loadWorld(map: AntMap, scene: Scene) {
    const world = new World(map.width, map.height, scene);
    world.createTerrain(0, 0, map.width, map.height);

    if (map.colonies) {
      map.colonies.forEach((colony) => world.createColony(colony.x, colony.y));
    }

    if (map.food) {
      map.food.forEach((food) => world.createFood(food.x, food.y));
    }

    // load the obstacles either from compressed or uncompressed form
    if (map.terrainCompressed) {
      const cells = importTerrainCompressed(map.terrainCompressed);
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (!cells[y * map.height + x]) {
            world.createObstacle(x, y);
          }
        }
      }
    } else if (map.terrain) {
      const cells = importTerrain(map.terrain);
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (!cells[y][x]) {
            world.createObstacle(x, y);
          }
        }
      }
    }

    return world;
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
