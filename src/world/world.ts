import Ant from '../entities/ant';
import Food from '../entities/food';
import Colony from '../entities/colony';
import Terrain from '../entities/terrain';
import { Scene, Vector2 } from 'three';
import Pheremone from '../pheremone/pheremone';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import { HOME_PHEREMONE_MAX } from '../sim/settings';
import { createObstacleMesh, OBSTACLE_HEIGHT } from '../util/mesh-utils';

export default class World {
  ants: Ant[] = [];
  food: Food[] = [];
  colonies: Colony[] = [];
  terrain: Terrain[] = [];
  pheremones: Pheremone[] = [];

  cellPassable: boolean[][];

  constructor(
    readonly width: number,
    readonly height: number,
    readonly scene: Scene
  ) {
    // create and fill the is passable array
    this.cellPassable = Array<boolean[]>(this.height);
    for (let j = 0; j < this.height; j++) {
      this.cellPassable[j] = Array<boolean>(this.width).fill(true);
    }
  }

  createTerrain(x: number, y: number, width: number, height: number) {
    const terrain = new Terrain(width, height);
    this.scene.add(terrain.mesh);
    this.terrain.push(terrain);
    return terrain;
  }

  createObstacle(x: number, y: number) {
    const obstacle = createObstacleMesh();
    obstacle.position.set(x, OBSTACLE_HEIGHT, y);
    this.scene.add(obstacle);
    this.cellPassable[Math.floor(y)][Math.floor(x)] = false;
  }

  createAnt(x: number, y: number, colony: Colony, behaviour: AntBehaviour) {
    const ant = new Ant(x, y, this, colony, behaviour);
    this.scene.add(ant.mesh);
    this.ants.push(ant);
    return ant;
  }

  createColony(x: number, y: number) {
    const colony = new Colony(x, y);
    this.scene.add(colony.mesh);
    this.colonies.push(colony);
    return colony;
  }

  createFood(x: number, y: number) {
    const food = new Food(x, y);
    this.scene.add(food.mesh);
    this.food.push(food);
    return food;
  }

  createPheremone(x: number, y: number, width: number, height: number) {
    const pheremone = new Pheremone(x, y, width, height);
    this.scene.add(pheremone.mesh);
    this.pheremones.push(pheremone);
    return pheremone;
  }

  update(delta: number) {
    // this.terrain.forEach((t) => t.update(delta));
    this.pheremones.forEach((p) => p.update(delta));
    this.colonies.forEach((c) => c.update(delta));
    this.ants.forEach((a) => a.update(delta));
    this.food.forEach((f) => f.update(delta));

    // TODO - clean up any removed entities
    // remove dead ants
    // remove finished food
  }

  // TODO - temporary methods to improve
  addHomePheremone(x: number, y: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);
    this.pheremones[0].pheremoneAt(cX, cY)[0] = HOME_PHEREMONE_MAX;
    this.pheremones[0].pheremoneAt(cX, cY)[1] = 0;
  }

  isCellPassable(x: number, y: number) {
    return (
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      this.cellPassable[Math.floor(y)][Math.floor(x)]
    );
  }

  getPassableAdjacentCells(x: number, y: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    const res: Vector2[] = [];

    if (cY > 0) {
      if (cX > 0) {
        // North West
        if (this.cellPassable[cY - 1][cX - 1]) {
          res.push(new Vector2(cX - 1, cY - 1));
        }
      }
      // North
      if (this.cellPassable[cY - 1][cX]) {
        res.push(new Vector2(cX, cY - 1));
      }
      // North East
      if (cX < this.width - 1) {
        if (this.cellPassable[cY - 1][cX + 1]) {
          res.push(new Vector2(cX + 1, cY - 1));
        }
      }
    }

    // West
    if (cX > 0) {
      if (this.cellPassable[cY][cX - 1]) {
        res.push(new Vector2(cX - 1, cY));
      }
    }

    // East
    if (cX < this.width - 1) {
      if (this.cellPassable[cY][cX + 1]) {
        res.push(new Vector2(cX + 1, cY));
      }
    }

    if (cY < this.height - 1) {
      // South West
      if (cX > 0) {
        if (this.cellPassable[cY + 1][cX - 1]) {
          res.push(new Vector2(cX - 1, cY + 1));
        }
      }
      // South
      if (this.cellPassable[cY + 1][cX]) {
        res.push(new Vector2(cX, cY + 1));
      }
      // South East
      if (cX < this.width - 1) {
        if (this.cellPassable[cY + 1][cX + 1]) {
          res.push(new Vector2(cX + 1, cY + 1));
        }
      }
    }

    if (res.length == 0) {
      console.log(`nowhere to go from (${cX},${cY})`);
    }
    return res;
  }
}
