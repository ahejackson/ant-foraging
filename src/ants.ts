import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Ant from './ant/ant';

// init
const canvas = document.querySelector<HTMLCanvasElement>('#ants')!;
const renderer = new THREE.WebGLRenderer({ canvas });
const camera = createCamera();
const scene = new THREE.Scene();
let running = true;
let previousTime = 0;
let ants: Ant[] = [];

function main() {
  const width = 20;
  const height = 20;

  createWorld(width, height);
  createAnt(0, 0);
  createAnt(19, 19);
  createColony(10, 10);
  createFood(17, 3);

  // create ambient light
  const color = 0xffffff;
  const intesntiy = 1;
  const light = new THREE.AmbientLight(color, intesntiy);
  scene.add(light);

  camera.position.set(width / 2, 30, 0);
  const controls = new MapControls(camera, renderer.domElement);
  controls.target.set(width / 2, 0, height / 2);
  controls.update();
}

function createWorld(width: number, height: number) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'https://threejsfundamentals.org/threejs/resources/images/checker.png'
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.repeat.set(width / 2, height / 2);

  const worldGeo = new THREE.PlaneBufferGeometry(width, height);
  const worldMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const worldMesh = new THREE.Mesh(worldGeo, worldMat);
  worldMesh.rotation.x = Math.PI * -0.5;
  worldMesh.position.x = (width - 1) / 2;
  worldMesh.position.z = (height - 1) / 2;
  console.log(worldMesh.position);
  scene.add(worldMesh);
}

function createAnt(x: number, y: number) {
  const ant = new Ant(x, y);
  scene.add(ant.mesh);
  ants.push(ant);
}

function createColony(x: number, y: number) {
  const geometry = new THREE.BoxGeometry(2, 1, 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const colony = new THREE.Mesh(geometry, material);
  scene.add(colony);
  colony.position.x = x;
  colony.position.z = y;
  colony.position.y = 0.5;
}

function createFood(x: number, y: number) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xdddd00 });
  const colony = new THREE.Mesh(geometry, material);
  scene.add(colony);
  colony.position.x = x;
  colony.position.z = y;
  colony.position.y = 0.5;
}

// render loop
function render(time: number) {
  // calculate the elapsed time
  let delta = time - previousTime;
  previousTime = time;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  update(delta);

  renderer.render(scene, camera);

  if (running) {
    requestAnimationFrame(render);
  }
}

function update(delta: number) {
  ants.forEach((ant) => ant.update(delta));
}

function start() {
  requestAnimationFrame(render);
}

// Keep the display responsive
function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needsResize = canvas.width !== width || canvas.height !== height;
  if (needsResize) {
    renderer.setSize(width, height, false);
  }
  return needsResize;
}

// Create the camera
function createCamera() {
  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

main();
start();
