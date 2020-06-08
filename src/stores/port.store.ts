import { types, getParentOfType, Instance } from "mobx-state-tree";
import { v4 } from "uuid";
import {
  INodeStore,
  NodeStore,
  IPlaygroundStore,
  PlaygroundStore,
  IConnectionStore,
} from ".";
export const PortDirection = {
  IN: "IN",
  OUT: "OUT",
} as const;
export const PortStore = types
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
      return this.node.position;
    },
    get playground(): IPlaygroundStore {
      return getParentOfType(self, PlaygroundStore);
    },
    get scale(): number {
      return getParentOfType(self, PlaygroundStore).canvasScale;
    },
    // get gateCanvasPosition(): { x: number; y: number } | undefined {
    //   // following check its just to make sure this getter will watch for node move
    //   if (!this.nodePosition.x && !this.nodePosition.y) return;
    //   const {
    //     left: canvasLeft,
    //     top: canvasTop,
    //   } = this.playground.canvas?.getBoundingClientRect() || {
    //     left: 0,
    //     top: 0,
    //   };
    //   const { left: gateLeft, top: gateTop } = document
    //     .getElementById(this.gateId)
    //     ?.getBoundingClientRect() || {
    //     left: 0,
    //     top: 0,
    //   };
    //   const position = {
    //     x: (gateLeft - canvasLeft) / this.scale,
    //     y: (gateTop - canvasTop) / this.scale,
    //   };
    //   return position;
    // },
    get connection(): IConnectionStore | null {
      const predict = this.isIn
        ? (c: IConnectionStore) => c.end === self
        : (c: IConnectionStore) => c.start === self;
      return (
        Array.from(this.playground.connections.values()).find(predict) || null
      );
    },
  }));
export interface IPortStore extends Instance<typeof PortStore> {}
