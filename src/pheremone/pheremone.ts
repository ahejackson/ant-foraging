import {
  DoubleSide,
  Group,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Mesh,
} from 'three';
import { HOME_PHEREMONE_MAX } from '../sim/settings';
import { TERRAIN_MATERIAL } from '../util/mesh-utils';

export default class Pheremone {
  // a pheremone layer has a width, a height (in cells)
  // and a position

  // The geometry
  static readonly GEOMETRY = new PlaneBufferGeometry(1, 1);

  // On each cell, the pheremon has a value and a freshness
  // stored as [y][x][value, freshness]
  pheremone: number[][][] = [];
  cells: Mesh[][] = [];
  materials: MeshBasicMaterial[] = [];
  mesh: Group;

  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) {
    const group = new Group();
    this.materials = this.createMaterials();

    for (let cY = 0; cY < height; cY++) {
      this.pheremone[cY] = [];
      this.cells[cY] = [];

      for (let cX = 0; cX < width; cX++) {
        this.pheremone[cY][cX] = [0, 0];

        this.cells[cY][cX] = new Mesh(Pheremone.GEOMETRY, this.materials[0]);
        this.cells[cY][cX].rotation.x = Math.PI * -0.5;
        this.cells[cY][cX].position.set(cX, 0.01, cY);
        group.add(this.cells[cY][cX]);
      }
    }
    this.mesh = group;
  }

  createMaterials() {
    const colors = [
      0x800026,
      0xbd0026,
      0xe31a1c,
      0xfc4e2a,
      0xfd8d3c,
      0xfeb24c,
      0xfed976,
      0xffeda0,
      0xffffcc,
    ];

    const colors2 = [
      0x084081,
      0x0868ac,
      0x2b8dbe,
      0x4eb4d3,
      0x7bccc4,
      0xa8ddb5,
      0xccebc5,
      0xe0f3db,
      0xf7fcf0,
    ];

    return colors.map(
      (color) => new MeshBasicMaterial({ color, side: DoubleSide })
    );
  }

  pheremoneAt(cX: number, cY: number) {
    return this.pheremone[cY][cX];
  }

  update(delta: number) {
    for (let cY = 0; cY < this.height; cY++) {
      for (let cX = 0; cX < this.width; cX++) {
        // update value
        this.pheremone[cY][cX][0] = Math.max(this.pheremone[cY][cX][0] - 1, 0);
        this.cells[cY][cX].material =
          this.pheremone[cY][cX][0] > 0
            ? this.materials[
                Math.floor(
                  (this.pheremone[cY][cX][0] / HOME_PHEREMONE_MAX) *
                    this.materials.length
                )
              ]
            : TERRAIN_MATERIAL;
      }
    }
  }
}
