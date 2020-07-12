import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PickHelper from './util/pick-helper';
import AntSim from './sim/ant-sim';
import { loadDefaultMap, saveMap } from './util/map-utils';
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
scene.background = new THREE.Color(0xdddddd);

const sim: AntSim = new AntSim(scene);
const pickHelper = new PickHelper(canvas);

let running = true;
let stepOnce = false;
let previousTime = 0;
let displayPheromone: null | 'HOME' | 'FOOD' | 'STRONGEST' = null;

function init() {
  // TODO - not sure how to position camera for variable sized map
  const map = loadDefaultMap();

  // set camera position
  camera.position.set(map.width / 2, 30, 0);
  const controls = new MapControls(camera, renderer.domElement);
  controls.target.set(map.width / 2, 0, map.height / 2);
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
        case 'KeyP':
          cycleDisplayPheromone();
          break;
        case 'KeyE':
          saveMap(sim.world);
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

// Temporary function to add pheromone to a cell
function pickCell() {
  let cell = pickHelper.pick(
    pickHelper.mouse,
    sim.world.pheromones.mesh,
    camera
  );

  if (cell) {
    console.log(`Cell: (${cell.x}, ${cell.y})`);

    // if there's no obstacle in this square, add one
    if (sim.world.isCellPassable(cell.x, cell.y)) {
      sim.world.createObstacle(cell.x, cell.y);
    } else {
      // otherwise remove the obstacle that is there
      sim.world.removeObstacle(cell.x, cell.y);
    }
  }
}

function cycleDisplayPheromone() {
  switch (displayPheromone) {
    case null:
      displayPheromone = 'STRONGEST';
      console.log(`Showing the strongest pheromone`);
      break;
    case 'STRONGEST':
      displayPheromone = 'HOME';
      console.log(`Showing home pheromone`);
      break;
    case 'HOME':
      displayPheromone = 'FOOD';
      console.log(`Showing food pheromone`);
      break;
    case 'FOOD':
      displayPheromone = null;
      console.log(`Not showing any pheromone`);
      break;
  }
  sim.world.pheromones.displayPheromone = displayPheromone;
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
