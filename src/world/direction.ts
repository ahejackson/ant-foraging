import { Vector2 } from 'three';

export enum Direction {
  NORTH,
  NORTH_EAST,
  EAST,
  SOUTH_EAST,
  SOUTH,
  SOUTH_WEST,
  WEST,
  NORTH_WEST,
}

export const directions = [
  Direction.NORTH,
  Direction.NORTH_EAST,
  Direction.EAST,
  Direction.SOUTH_EAST,
  Direction.SOUTH,
  Direction.SOUTH_WEST,
  Direction.WEST,
  Direction.NORTH_WEST,
];

export const directionNames = [
  'NORTH',
  'NORTH_EAST',
  'EAST',
  'SOUTH_EAST',
  'SOUTH',
  'SOUTH_WEST',
  'WEST',
  'NORTH_WEST',
];

export const directionVectors = [
  new Vector2(0, -1),
  new Vector2(1, -1),
  new Vector2(1, 0),
  new Vector2(1, 1),
  new Vector2(0, 1),
  new Vector2(-1, 1),
  new Vector2(-1, 0),
  new Vector2(-1, -1),
];

export function directionsForward(d: Direction): Direction[] {
  return [(d + 7) % 8, d, (d + 1) % 8];
}

export function directionLeft(d: Direction): Direction {
  return (d + 6) % 8;
}

export function directionRight(d: Direction): Direction {
  return (d + 2) % 8;
}

export function directionsForwardsSide(d: Direction): Direction[] {
  return [(d + 6) % 8, (d + 7) % 8, d, (d + 1) % 8, (d + 2) % 8];
}

export function directionReverse(d: Direction): Direction {
  return (d + 4) % 8;
}

export function directionsBackward(d: Direction): Direction[] {
  return [(d + 3) % 8, (d + 4) % 8, (d + 5) % 8];
}

export function directionsBackwardSide(d: Direction): Direction[] {
  return [(d + 2) % 8, (d + 3) % 8, (d + 4) % 8, (d + 5) % 8, (d + 6) % 8];
}

// utility to print enum names
export function getDirectionNames(dir: Direction | Direction[]) {
  return Array.isArray(dir)
    ? dir.map((d) => directionNames[d])
    : directionNames[dir];
}
