import { IPlaygroundStore, INodeStore } from "../stores";
import { action, observable, computed } from "mobx";
import { computedAlive } from "./util";

class NodeDrag {
  private start: {
    worldX: number;
    worldY: number;
    mouseClientX: number;
    mouseClientY: number;
    scale: number;
  };
  constructor(
    private config: {
      store: INodeStore;
      mouseClientX: number;
      mouseClientY: number;
      scale: number;
    }
  ) {
    this.start = {
      worldX: config.store.posX,
      worldY: config.store.posY,
      mouseClientX: config.mouseClientX,
      mouseClientY: config.mouseClientY,
      scale: config.scale,
    };
  }
  @action.bound
  setClientPosition(mouseClientX: number, mouseClientY: number) {
    const dragOffset = {
      x: (mouseClientX - this.start.mouseClientX) / this.start.scale,
      y: (mouseClientY - this.start.mouseClientY) / this.start.scale,
    };
    const x = dragOffset.x + this.start.worldX;
    const y = dragOffset.y + this.start.worldY;
    this.config.store.setPosition(x, y);
  }
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

  @action getClientPosition({
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
  @observable canvasDrag: CanvasDrag | null = null;
  @observable nodeDrag: NodeDrag | null = null;
  @observable mouse = {
    buttons: 0,
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
  };

  constructor(private playgroundStore: IPlaygroundStore) {}

  @action
  private dragCanvas() {
    if (!this.canvasDrag) return;
    const { clientX, clientY } = this.mouse;
    const { boundX, boundY } = this.canvasDrag.getClientPosition({
      clientX,
      clientY,
    });
    this.canvas.boundX = boundX;
    this.canvas.boundY = boundY;
  }
  @action
  private dragNode() {
    if (!this.nodeDrag) return;
    const { clientX, clientY } = this.mouse;
    this.nodeDrag.setClientPosition(clientX, clientY);
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
    if (this.mouse.buttons !== 1) return;
    this.dragCanvas();
    this.dragNode();
  }
  @action.bound
  onMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.mouse.buttons = evt.buttons;
    if (!this.nodeDrag) this.setDragCanvas();
  }
  @action.bound
  onMouseUp(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    this.mouse.buttons = evt.buttons;
    this.canvasDrag = null;
    this.nodeDrag = null;
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
  setDragCanvas() {
    const { clientX, clientY } = this.mouse;
    const { boundX, boundY } = this.canvas;
    this.canvasDrag = new CanvasDrag({
      mouseClientX: clientX,
      mouseClientY: clientY,
      canvasBoundX: boundX,
      canvasBoundY: boundY,
    });
  }
  @action.bound
  setDragNode(node: INodeStore) {
    const { clientX, clientY } = this.mouse;
    this.nodeDrag = new NodeDrag({
      store: node,
      mouseClientX: clientX,
      mouseClientY: clientY,
      scale: this.scale,
    });
  }
}
