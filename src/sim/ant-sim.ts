import Random from '../util/random';

import RNG from '../util/random';

export default class AntSim {
  static readonly N = 50; // the number of ants
  static readonly WIDTH = 200;
  static readonly HEIGHT = 200;

  rng: RNG;

  constructor() {
    // 1. Setup the log
    console.log('Ant Simulation');

    // 2. Setup the random number generator
    const seed = 'antsim';
    this.rng = new RNG(seed);
    console.log(`seed=${this.rng.seed}`);

    // 3. Setup the world map

    // 4. Setup the world
  }
}
