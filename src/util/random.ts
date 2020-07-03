import seedrandom from 'seedrandom';

export default class Random {
  rng: seedrandom.prng;

  constructor(readonly seed: string) {
    this.rng = seedrandom(seed);
  }

  next() {
    return this.rng();
  }

  range(min: number, max?: number) {
    if (!max) {
      return min * this.rng();
    }
    return min + (max - min) * this.rng();
  }

  pick<T>(array: T[]) {
    return array[Math.floor(array.length * this.rng())];
  }
}
