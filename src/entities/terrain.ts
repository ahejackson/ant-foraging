import {
  DoubleSide,
  Group,
  MeshPhongMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  RepeatWrapping,
  TextureLoader,
  Mesh,
  GridHelper,
} from 'three';

export default class Terrain {
  mesh: Group;

  constructor(readonly width: number, readonly height: number) {
    const loader = new TextureLoader();
    const texture = loader.load(
      'https://threejsfundamentals.org/threejs/resources/images/checker.png'
    );
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    texture.repeat.set(width / 2, height / 2);

    const terrainGeo = new PlaneBufferGeometry(width, height);
    const terrainMat = new MeshPhongMaterial({
      map: texture,
      side: DoubleSide,
    });
    const mesh = new Mesh(terrainGeo, terrainMat);

    // rotate the mesh and reposition to make world space match mesh space
    mesh.rotation.x = Math.PI * -0.5;
    mesh.position.set((width - 1) / 2, 0, (height - 1) / 2);

    this.mesh = new Group();
    this.mesh.add(mesh);

    const gridHelper = new GridHelper(width, width);
    gridHelper.position.set((width - 1) / 2, 0.02, (height - 1) / 2);
    this.mesh.add(gridHelper);
  }

  update(delta: number) {}
}
