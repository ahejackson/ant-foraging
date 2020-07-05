import { Scene, Vector2 } from 'three';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import Ant from '../entities/ant';
import Colony from '../entities/colony';
import Food from '../entities/food';
import Terrain from '../entities/terrain';
import PheremoneLayers from '../pheremone/pheremone-layers';
import { createObstacleMesh, OBSTACLE_HEIGHT } from '../util/mesh-utils';

export default class World {
  ants: Ant[] = [];
  food: Food[] = [];
  colonies: Colony[] = [];
  terrain: Terrain[] = [];

  pheremones: PheremoneLayers;
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

    this.pheremones = this.createPheremone(0, 0, width, height);
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

  createObstacle(x: number, y: number) {
    const obstacle = createObstacleMesh();
    obstacle.position.set(x, OBSTACLE_HEIGHT, y);
    this.scene.add(obstacle);
    this.cellPassable[Math.floor(y)][Math.floor(x)] = false;
  }

  createPheremone(x: number, y: number, width: number, height: number) {
    this.pheremones = new PheremoneLayers(x, y, width, height);
    this.scene.add(this.pheremones.mesh);
    return this.pheremones;
  }

  createTerrain(x: number, y: number, width: number, height: number) {
    const terrain = new Terrain(width, height);
    this.scene.add(terrain.mesh);
    this.terrain.push(terrain);
    return terrain;
  }

  update(delta: number) {
    this.pheremones.update(delta);
    this.colonies.forEach((c) => c.update(delta));
    this.ants.forEach((a) => a.update(delta));
    this.food.forEach((f) => f.update(delta));

    // TODO - clean up any removed entities
    // remove dead ants
    // remove finished food
  }

  // check if there is food in the same cell as the given point
  foodInCell(x: number, y: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    return this.food.filter(
      (f) =>
        cX === Math.floor(f.mesh.position.x) &&
        cY === Math.floor(f.mesh.position.z)
    );
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
