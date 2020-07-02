import * as THREE from 'three';
import * as Settings from './sim/settings';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PickHelper from './util/pick-helper';
import AntSim from './sim/ant-sim';

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
scene.background = new THREE.Color(0xdddddd);

const sim: AntSim = new AntSim(scene);
const pickHelper = new PickHelper(canvas);

let running = true;
let previousTime = 0;

function main() {
  // create ambient light
  const color = 0xffffff;
  const intesntiy = 1;
  const light = new THREE.AmbientLight(color, intesntiy);
  scene.add(light);

  camera.position.set(Settings.WIDTH / 2, 30, 0);
  const controls = new MapControls(camera, renderer.domElement);
  controls.target.set(Settings.WIDTH / 2, 0, Settings.HEIGHT / 2);
  controls.update();

  document.addEventListener('mousedown', (e) => pickCell());
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

  sim.update(delta);
  renderer.render(scene, camera);

  if (running) {
    requestAnimationFrame(render);
  }
}

function start() {
  requestAnimationFrame(render);
}

// Temporary function to add pheremone to a cell
function pickCell() {
  let cell = pickHelper.pick(
    pickHelper.mouse,
    sim.world.pheremones[0].mesh,
    camera
  );

  if (cell) {
    console.log(`Cell: (${cell.x}, ${cell.y})`);
    sim.world.pheremones[0].pheremoneAt(cell.x, cell.y)[0] =
      Settings.HOME_PHEREMONE_MAX;
    sim.world.pheremones[0].pheremoneAt(cell.x, cell.y)[1] = 0;
  }
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