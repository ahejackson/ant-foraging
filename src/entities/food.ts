import type { Mesh } from "three";
import { createFoodMesh } from "../util/mesh-utils";

export default class Food {
	mesh: Mesh;

	constructor(x: number, y: number) {
		this.mesh = createFoodMesh();
		this.mesh.position.set(x, 0.5, y);
	}

	update(delta: number) {}
}
