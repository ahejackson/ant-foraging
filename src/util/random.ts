import seedrandom from 'seedrandom';

export default class Random {
  rng: seedrandom.prng;

  constructor(readonly seed: string) {
    this.rng = seedrandom(seed);
  }

  next() {
    return this.rng();
  }
}
