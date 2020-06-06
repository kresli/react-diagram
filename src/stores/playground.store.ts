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
    get gateCanvasPosition(): { x: number; y: number } {
      const elem = document.getElementById(this.gateId);
      console.log(this.gateId);
      //@todo
      const { x, y } = elem?.getBoundingClientRect() || { x: 0, y: 0 };
      return { x, y };
    },
    get parentNode(): INodeStore {
      return getParentOfType(self, NodeStore);
    },
    get parentNodeId(): string {
      return this.parentNode.id;
    },
  }))
  .actions((self) => {
    const observer = new MutationObserver((mutationsList, observer) => {
      console.log(mutationsList);
    });
    const afterCreate = () => {
      window.addEventListener("DOMContentLoaded", (event) => {
        console.log(document.getElementById(self.parentNodeId));
        observer.observe(document.getElementById(self.parentNodeId)!, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      });
    };
    const beforeDestroy = () => {};
    return { afterCreate, beforeDestroy };
  });
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
  }))
  .actions((self) => ({
    updatePosition(x: number, y: number) {
      self.posX = x;
      self.posY = y;
    },
  }));
export interface INodeStore extends Instance<typeof NodeStore> {}

export const PlaygroundStore = types.model({
  nodes: types.array(NodeStore),
  connections: types.array(ConnectionStore),
});
export interface IPlaygroundStore extends Instance<typeof PlaygroundStore> {}
