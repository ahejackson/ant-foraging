export interface AntMap {
  width: number;
  height: number;
  colonies?: { x: number; y: number }[];
  food?: { x: number; y: number }[];
  terrain?: string;
  terrainCompressed?: string;
}
