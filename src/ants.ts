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
let stepOnce = false;
let previousTime = 0;

function init() {
  // set camera position
  camera.position.set(Settings.WIDTH / 2, 30, 0);
  const controls = new MapControls(camera, renderer.domElement);
  controls.target.set(Settings.WIDTH / 2, 0, Settings.HEIGHT / 2);
  controls.update();

  // Add cell mouse picking
  document.addEventListener('mousedown', () => pickCell(), false);

  document.addEventListener(
    'keyup',
    (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          running = !running;
          console.log(`running=${running}`);
          break;
        case 'KeyS':
          stepOnce = true;
          console.log('stepping once');
          break;
      }
    },
    false
  );
}

// render loop
function render(time: number) {
  // calculate the elapsed time
  // note at the moment this is off on the first frame
  let delta = time - previousTime;
  previousTime = time;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (running || stepOnce) {
    sim.update(delta);
    stepOnce = false;
  }
  renderer.render(scene, camera);

  requestAnimationFrame(render);
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

init();
start();
