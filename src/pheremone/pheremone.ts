import {
  DoubleSide,
  Group,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Mesh,
} from 'three';

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

  constructor(x: number, y: number, width: number, height: number) {
    const group = new Group();
    this.materials = this.createMaterials();

    for (let j = 0; j < height; j++) {
      this.pheremone[j] = [];
      this.cells[j] = [];

      for (let i = 0; i < width; i++) {
        this.pheremone[j][i] = [0, 0];

        this.cells[j][i] = new Mesh(Pheremone.GEOMETRY, this.materials[0]);
        this.cells[j][i].rotation.x = Math.PI * -0.5;
        this.cells[j][i].position.set(i, 0.01, j);
        group.add(this.cells[j][i]);
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

  update(delta: number) {}
}
