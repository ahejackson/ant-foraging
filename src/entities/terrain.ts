import {
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  RepeatWrapping,
  TextureLoader,
} from 'three';

export default class Terrain {
  mesh: Mesh;

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
    this.mesh = new Mesh(terrainGeo, terrainMat);

    // rotate the mesh and reposition to make world space match mesh space
    this.mesh.rotation.x = Math.PI * -0.5;
    this.mesh.position.x = (width - 1) / 2;
    this.mesh.position.z = (height - 1) / 2;
  }

  update(delta: number) {}
}
