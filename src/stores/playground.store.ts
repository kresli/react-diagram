import { types, Instance, getType, getParentOfType } from "mobx-state-tree";
import { v4 } from "uuid";

export const NodeScopeType = {
  ACTION: "ACTION",
  ASSERT: "ASSERT",
} as const;

export const PortDirection = {
  IN: "IN",
  OUT: "OUT",
} as const;

const PortStore = types
  .model({
    id: types.optional(types.identifier, () => v4()),
    label: types.maybeNull(types.string),
    direction: types.optional(
      types.enumeration(Object.keys(PortDirection)),
      PortDirection.OUT
    ),
  })
  .volatile((self) => ({
    gateCanvasPosition: {
      x: 0,
      y: 0,
    },
  }))
  .views((self) => ({
    get isIn() {
      return self.direction === PortDirection.IN;
    },
    get isOut() {
      return self.direction === PortDirection.OUT;
    },
    get gateId(): string {
      return `${self.id}-gate`;
    },
    get node(): INodeStore {
      return getParentOfType(self, NodeStore);
    },
    get nodePosition(): { x: number; y: number } {
      const { position, label } = this.node;
      return position;
    },
    get playground(): IPlaygroundStore {
      return getParentOfType(self, PlaygroundStore);
    },
    get scale(): number {
      return getParentOfType(self, PlaygroundStore).canvasScale;
    },
    get gateCanvasPosition(): { x: number; y: number } | undefined {
      if (!this.nodePosition.x && !this.nodePosition.y && !this.scale) return;
      const { x, y } = this.playground.canvas?.getBoundingClientRect() || {
        x: 0,
        y: 0,
      };
      const { left, top } = document
        .getElementById(this.gateId)
        ?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };
      const position = {
        x: (left - x) / this.scale + 5,
        y: (top - y) / this.scale + 5,
      };
      if (this.node.label === "Random Number") {
        console.log({ nodePosition: this.nodePosition });
        console.log(this.scale);
        console.log({ x, y, left, top });
      }
      return position;
    },
  }));
export interface IPortStore extends Instance<typeof PortStore> {}

const ConnectionTargetType = types.union(
  types.reference(PortStore),
  types.model({
    posX: types.optional(types.number, 0),
    posY: types.optional(types.number, 0),
  })
);

const ConnectionStore = types
  .model({
    id: types.optional(types.identifier, () => v4()),
    label: types.optional(types.string, "Port"),
    start: ConnectionTargetType,
    end: ConnectionTargetType,
  })
  .views((self) => ({
    get startGateCanvasPosition(): { x: number; y: number } | null {
      const { start } = self;
      return getType(start) === PortStore
        ? (start as IPortStore).gateCanvasPosition
        : null;
    },
    get endGateCanvasPosition(): { x: number; y: number } | null {
      const { end } = self;
      return getType(end) === PortStore
        ? (end as IPortStore).gateCanvasPosition
        : null;
    },
  }));

export interface IConnectionStore extends Instance<typeof ConnectionStore> {}

const NodeStore = types
  .model({
    id: types.optional(types.identifier, () => v4()),
    type: types.optional(
      types.enumeration(Object.keys(NodeScopeType)),
      NodeScopeType.ACTION
    ),
    label: types.optional(types.string, "Node"),
    ports: types.array(PortStore),
    posX: types.optional(types.number, 0),
    posY: types.optional(types.number, 0),
  })
  .views((self) => ({
    get portsIn() {
      return self.ports.filter(({ isIn }) => isIn);
    },
    get portsOut() {
      return self.ports.filter(({ isOut }) => isOut);
    },
    get position() {
      return { x: self.posX, y: self.posY };
    },
  }))
  .actions((self) => ({
    updatePosition(x: number, y: number) {
      self.posX = x;
      self.posY = y;
    },
  }));
export interface INodeStore extends Instance<typeof NodeStore> {}

export const PlaygroundStore = types
  .model({
    nodes: types.array(NodeStore),
    connections: types.array(ConnectionStore),
  })
  .volatile((self) => ({
    canvas: null as null | HTMLDivElement,
    canvasScale: 1,
    worldPosition: { x: 0, y: 0 },
  }))
  .actions((self) => ({
    setCanvasRef(canvas: HTMLDivElement | null = null) {
      self.canvas = canvas;
      const { x, y } = canvas?.getBoundingClientRect() || { x: 0, y: 0 };
      self.worldPosition = { x, y };
    },
    setCanvasScale(scale: number) {
      self.canvasScale = scale;
    },
  }));
export interface IPlaygroundStore extends Instance<typeof PlaygroundStore> {}
