import { Scene, Vector2, Object3D } from 'three';
import { AntBehaviour } from '../behaviours/ant-behaviour';
import Ant from '../entities/ant';
import Colony from '../entities/colony';
import Food from '../entities/food';
import Terrain from '../entities/terrain';
import PheromoneLayers from '../pheromone/pheromone-layers';
import { createObstacleMesh, OBSTACLE_HEIGHT } from '../util/mesh-utils';
import { Direction } from './direction';

export default class World {
  ants: Ant[] = [];
  food: Food[] = [];
  colonies: Colony[] = [];
  terrain: Terrain[] = [];
  obstacles: Object3D[] = [];

  pheromones: PheromoneLayers;
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

    this.pheromones = this.createPheromoneLayers(0, 0, width, height);
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
    this.obstacles.push(obstacle);
    this.cellPassable[Math.floor(y)][Math.floor(x)] = false;
  }

  removeObstacle(x: number, y: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    const obstaclesToRemove = this.obstacles.filter(
      (o) => cX === Math.floor(o.position.x) && cY === Math.floor(o.position.z)
    );

    if (obstaclesToRemove.length > 0) {
      this.scene.remove(...obstaclesToRemove);
      this.obstacles = this.obstacles.filter(
        (o) => !obstaclesToRemove.includes(o)
      );
      this.cellPassable[cY][cX] = true;
    }
  }

  createPheromoneLayers(x: number, y: number, width: number, height: number) {
    this.pheromones = new PheromoneLayers(x, y, width, height);
    this.scene.add(this.pheromones.mesh);
    return this.pheromones;
  }

  createTerrain(x: number, y: number, width: number, height: number) {
    const terrain = new Terrain(width, height);
    this.scene.add(terrain.mesh);
    this.terrain.push(terrain);
    return terrain;
  }

  update(delta: number) {
    this.pheromones.update(delta);
    this.colonies.forEach((c) => c.update(delta));
    this.ants.forEach((a) => a.update(delta));
    this.food.forEach((f) => f.update(delta));

    // TODO - clean up any removed entities
    // remove dead ants
    // remove finished food
  }

  isInCell(x: number, y: number, object: Object3D) {
    return (
      Math.floor(x) === Math.floor(object.position.x) &&
      Math.floor(y) === Math.floor(object.position.z)
    );
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

  getAdjacentCells(x: number, y: number) {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    const res: Vector2[] = [];

    if (cY > 0) {
      if (cX > 0) {
        // North West
        res.push(new Vector2(cX - 1, cY - 1));
      }
      // North
      res.push(new Vector2(cX, cY - 1));

      // North East
      if (cX < this.width - 1) {
        res.push(new Vector2(cX + 1, cY - 1));
      }
    }

    // West
    if (cX > 0) {
      res.push(new Vector2(cX - 1, cY));
    }

    // East
    if (cX < this.width - 1) {
      res.push(new Vector2(cX + 1, cY));
    }

    if (cY < this.height - 1) {
      // South West
      if (cX > 0) {
        res.push(new Vector2(cX - 1, cY + 1));
      }
      // South
      res.push(new Vector2(cX, cY + 1));

      // South East
      if (cX < this.width - 1) {
        res.push(new Vector2(cX + 1, cY + 1));
      }
    }

    if (res.length == 0) {
      console.log(`nothing is around (${cX},${cY})`);
    }
    return res;
  }

  getPassableAdjacentDirections(x: number, y: number): Direction[] {
    const cX = Math.floor(x);
    const cY = Math.floor(y);

    const res: Direction[] = [];

    if (cY > 0) {
      if (cX > 0) {
        // North West
        if (this.cellPassable[cY - 1][cX - 1]) {
          res.push(Direction.NORTH_WEST);
        }
      }
      // North
      if (this.cellPassable[cY - 1][cX]) {
        res.push(Direction.NORTH);
      }
      // North East
      if (cX < this.width - 1) {
        if (this.cellPassable[cY - 1][cX + 1]) {
          res.push(Direction.NORTH_EAST);
        }
      }
    }

    // West
    if (cX > 0) {
      if (this.cellPassable[cY][cX - 1]) {
        res.push(Direction.WEST);
      }
    }

    // East
    if (cX < this.width - 1) {
      if (this.cellPassable[cY][cX + 1]) {
        res.push(Direction.EAST);
      }
    }

    if (cY < this.height - 1) {
      // South West
      if (cX > 0) {
        if (this.cellPassable[cY + 1][cX - 1]) {
          res.push(Direction.SOUTH_WEST);
        }
      }
      // South
      if (this.cellPassable[cY + 1][cX]) {
        res.push(Direction.SOUTH);
      }
      // South East
      if (cX < this.width - 1) {
        if (this.cellPassable[cY + 1][cX + 1]) {
          res.push(Direction.SOUTH_EAST);
        }
      }
    }

    if (res.length == 0) {
      console.log(`nowhere to go from (${cX},${cY})`);
    }
    return res;
  }
}
