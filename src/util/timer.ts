export default class Timer {
  time = 0;

  update(delta: number) {
    this.time += delta;
  }

  reset() {
    this.time = 0;
  }
}
