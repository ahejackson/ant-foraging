import { Material } from 'three';

export default class Pheremone {
  constructor(
    readonly name: string,
    readonly max: number,
    readonly increment: number,
    readonly decayInterval: number,
    readonly materials: Material[]
  ) {}

  getMaterial(value: number) {
    return this.materials[
      Math.floor((value / this.max) * this.materials.length)
    ];
  }
}
