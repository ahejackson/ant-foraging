import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import World from './world/world';

/*
 * The main file
 * Anything to do with running the model, interacting with it, playing and pausing
 * All goes here
 */

// init
const canvas = document.querySelector<HTMLCanvasElement>('#ants')!;
const renderer = new THREE.WebGLRenderer({ canvas });
const camera = createCamera();
const scene = new THREE.Scene();

// world
const width = 20;
const height = 20;
const world = new World(width, height, scene);

let running = true;
let previousTime = 0;

function main() {
  world.createTerrain(0, 0, width, height);
  world.createAnt(0, 0);
  world.createAnt(19, 19);
  world.createColony(10, 10);
  world.createFood(17, 3);
  world.createPheremone(0, 0, width, height);

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
  world.update(delta);
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
