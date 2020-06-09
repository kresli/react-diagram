import { IPlaygroundStore, INodeStore } from "../stores";
import { action, observable } from "mobx";

class NodeDrag {
  constructor(
    private start: {
      worldX: number;
      worldY: number;
    }
  ) {}
}

class CanvasDrag {
  constructor(
    private start: {
      mouseClientX: number;
      mouseClientY: number;
      canvasBoundX: number;
      canvasBoundY: number;
    }
  ) {}

  @action private getPosition({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) {
    const {
      canvasBoundX,
      canvasBoundY,
      mouseClientX,
      mouseClientY,
    } = this.start;
    return {
      boundX: canvasBoundX + clientX - mouseClientX,
      boundY: canvasBoundY + clientY - mouseClientY,
    };
  }
}

export class Eventor {
  @observable private minScale = 0.3;
  @observable private scaleForce = 1000;
  @observable scale = 1;
  @observable playground = {
    width: 0,
    height: 0,
    boundX: 0, // getBoundingBox()
    boundY: 0, // getBoundingBox()
  };
  @observable canvas = {
    width: 0,
    height: 0,
    boundX: 0, // getBoundingBox()
    boundY: 0, // getBoundingBox()
  };
  @observable dragStart: null | {
    clientX: number;
    clientY: number;
    boundX: number;
    boundY: number;
  } = null;
  @observable mouse = {
    buttons: 0,
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
  };

  constructor(private playgroundStore: IPlaygroundStore) {}
  getWorldPosition(x: number, y: number) {
    return {
      x: this.canvas.boundX - this.playground.boundX + x,
      y: this.canvas.boundY - this.playground.boundY + y,
    };
  }
  @action private dragCanvas() {
    if (this.mouse.buttons !== 1) return;
    const { clientX, clientY } = this.mouse;
    if (!this.dragStart) {
      const { boundX, boundY } = this.canvas;
      this.dragStart = {
        clientX,
        clientY,
        boundX,
        boundY,
      };
    }
    const { boundX, boundY } = this.dragStart;
    this.canvas.boundX = boundX + clientX - this.dragStart.clientX;
    this.canvas.boundY = boundY + clientY - this.dragStart.clientY;
  }
  @action.bound
  onMouseMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { pageX, pageY, clientY, clientX, buttons } = evt;
    this.mouse = {
      pageX,
      pageY,
      clientX,
      clientY,
      buttons,
    };
    this.dragCanvas();
  }
  @action.bound
  onMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.mouse.buttons = evt.buttons;
  }
  @action.bound
  onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.mouse.buttons = evt.buttons;
    this.dragStart = null;
  }
  @action.bound
  onWheel(evt: React.WheelEvent<HTMLDivElement>) {
    const { deltaY, clientX, clientY } = evt;
    if (deltaY > 0 && this.scale < this.minScale) return;
    const { boundX, boundY, width, height } = this.canvas;
    const scaleFactor = deltaY / this.scaleForce;
    const x = clientX - boundX;
    const y = clientY - boundY;
    this.scale = this.scale - scaleFactor;
    this.canvas.boundX += width * scaleFactor * (x / this.scale / width);
    this.canvas.boundY += height * scaleFactor * (y / this.scale / height);
  }
  @action.bound
  setPlaygroundBounds(config: {
    width: number;
    height: number;
    boundX: number;
    boundY: number;
  }) {
    this.playground = config;
  }
  @action.bound
  setCanvasBounds(config: {
    width: number;
    height: number;
    boundX: number;
    boundY: number;
  }) {
    this.canvas = { ...config };
  }
  @action.bound
  setDragNode(node: INodeStore) {}
}
