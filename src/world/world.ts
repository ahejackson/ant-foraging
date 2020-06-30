import Ant from '../entities/ant';
import Food from '../entities/food';
import Colony from '../entities/colony';
import Terrain from '../entities/terrain';
import { Scene } from 'three';
import Pheremone from '../pheremone/pheremone';

export default class World {
  ants: Ant[] = [];
  food: Food[] = [];
  colonies: Colony[] = [];
  terrain: Terrain[] = [];
  pheremones: Pheremone[] = [];

  constructor(
    readonly width: number,
    readonly height: number,
    readonly scene: Scene
  ) {}

  createTerrain(x: number, y: number, width: number, height: number) {
    const terrain = new Terrain(width, height);
    this.scene.add(terrain.mesh);
    this.terrain.push(terrain);
  }

  createAnt(x: number, y: number) {
    const ant = new Ant(x, y);
    this.scene.add(ant.mesh);
    this.ants.push(ant);
  }

  createColony(x: number, y: number) {
    const colony = new Colony(x, y);
    this.scene.add(colony.mesh);
    this.colonies.push(colony);
  }

  createFood(x: number, y: number) {
    const food = new Food(x, y);
    this.scene.add(food.mesh);
    this.food.push(food);
  }

  createPheremone(x: number, y: number, width: number, height: number) {
    const pheremone = new Pheremone(x, y, width, height);
    this.scene.add(pheremone.mesh);
    this.pheremones.push(pheremone);
  }

  update(delta: number) {
    this.terrain.forEach((t) => t.update(delta));
    this.pheremones.forEach((p) => p.update(delta));
    this.colonies.forEach((c) => c.update(delta));
    this.ants.forEach((a) => a.update(delta));
    this.food.forEach((f) => f.update(delta));
  }
}
