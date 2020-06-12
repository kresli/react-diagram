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
    gateRef: null as HTMLDivElement | null,
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
    get nodeRef(): HTMLDivElement | null {
      return this.node.ref;
    },
    get nodePosition(): { x: number; y: number } {
      return this.node.position;
    },
    get playground(): IPlaygroundStore {
      return getParentOfType(self, PlaygroundStore);
    },
    get scale(): number {
      return getParentOfType(self, PlaygroundStore).eventor.scale;
    },
    get connection(): IConnectionStore | null {
      const predict = this.isIn
        ? (c: IConnectionStore) => c.end === self
        : (c: IConnectionStore) => c.start === self;
      return (
        Array.from(this.playground.connections.values()).find(predict) || null
      );
    },
    get gateCanvasPosition(): { x: number; y: number } {
      const canvasRef = this.playground.eventor.canvas.ref;
      if (!self.gateRef || !this.node.position) return { x: 0, y: 0 };
      let el: HTMLElement | null = self.gateRef;
      let x = 0;
      let y = 0;
      while (el && el !== canvasRef) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent as HTMLElement;
      }
      return { x, y };
    },
  }))
  .actions((self) => ({
    setGateRef(ref: HTMLDivElement | null) {
      self.gateRef = ref;
    },
  }));
export interface IPortStore extends Instance<typeof PortStore> {}
