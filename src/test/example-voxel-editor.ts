import * as THREE from 'three';

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let plane: THREE.Mesh;
let mouse: THREE.Vector2;
let raycaster: THREE.Raycaster;
let isShiftDown = false;

let rollOverMesh: THREE.Mesh;
let rollOverMaterial: THREE.MeshBasicMaterial;
let cubeGeo: THREE.BoxBufferGeometry;
let cubeMaterial: THREE.MeshLambertMaterial;

const objects: THREE.Object3D[] = [];

init();
render();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(500, 800, 1300);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // roll-over helpers
  const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // cubes
  cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
  });

  // grid
  const gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);

  //
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const geometry = new THREE.PlaneBufferGeometry(1000, 1000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);

  objects.push(plane);

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('keydown', onDocumentKeyDown, false);
  document.addEventListener('keyup', onDocumentKeyUp, false);

  //
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0 && intersects[0].face) {
    rollOverMesh.position
      .copy(intersects[0].point)
      .add(intersects[0].face.normal);

    rollOverMesh.position
      .divideScalar(50)
      .floor()
      .multiplyScalar(50)
      .addScalar(25);
  }

  render();
}

function onDocumentMouseDown(event: MouseEvent) {
  event.preventDefault();

  mouse.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    // delete cube

    if (isShiftDown) {
      if (intersect.object !== plane) {
        scene.remove(intersect.object);

        objects.splice(objects.indexOf(intersect.object), 1);
      }

      // create cube
    } else if (intersect.face) {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      voxel.position.copy(intersect.point).add(intersect.face.normal);
      voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      scene.add(voxel);

      objects.push(voxel);
    }

    render();
  }
}

function onDocumentKeyDown(event: KeyboardEvent) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = true;
      break;
  }
}

function onDocumentKeyUp(event: KeyboardEvent) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = false;
      break;
  }
}

function render() {
  renderer.render(scene, camera);
}
