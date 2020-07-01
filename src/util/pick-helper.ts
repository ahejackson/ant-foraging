import {
  Raycaster,
  Scene,
  Vector2,
  Mesh,
  MeshBasicMaterial,
  Material,
  Camera,
} from 'three';

export default class PickHelper {
  raycaster: Raycaster;
  mouse: Vector2;
  pickedObject?: Mesh;
  pickedObjectMaterial = new MeshBasicMaterial({
    color: 0xffffff,
  });
  pickedObjectSavedMaterial: Material | Material[];

  constructor(readonly canvas: HTMLCanvasElement) {
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.pickedObjectSavedMaterial = this.pickedObjectMaterial;

    document.addEventListener('mousemove', (e) => this.setPickPosition(e));
    document.addEventListener('mouseout', (e) => this.clearPickPosition(e));
    document.addEventListener('mouseleave', (e) => this.clearPickPosition(e));
    document.addEventListener(
      'touchstart',
      (event) => {
        // prevent the document from scrolling
        event.preventDefault();
        this.setPickPosition(event.touches[0]);
      },
      { passive: false }
    );

    document.addEventListener('touchmove', (event) => {
      this.setPickPosition(event.touches[0]);
    });

    document.addEventListener('touchend', this.clearPickPosition);
  }

  pick(normalizedPosition: Vector2, scene: Scene, camera: Camera) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material = this.pickedObjectSavedMaterial;
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);

    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);

    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object as Mesh;
      // save its color
      this.pickedObjectSavedMaterial = this.pickedObject.material;
      // set its emissive color to flashing red/yellow
      this.pickedObject.material = this.pickedObjectMaterial;
    }
  }

  getCanvasRelativePosition(event: MouseEvent | Touch) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * this.canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * this.canvas.height) / rect.height,
    };
  }

  setPickPosition(event: MouseEvent | Touch) {
    const pos = this.getCanvasRelativePosition(event);
    this.mouse.x = (pos.x / this.canvas.width) * 2 - 1;
    this.mouse.y = (pos.y / this.canvas.height) * -2 + 1; // note we flip Y
  }

  clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    this.mouse.set(-100000, -100000);
  }
}
