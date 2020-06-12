import { Instance, types } from "mobx-state-tree";
import { v4 } from "uuid";
import { PortStore } from ".";

export const NodeScopeType = {
  ACTION: "ACTION",
  ASSERT: "ASSERT",
} as const;

export const NodeStore = types
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
  .volatile((self) => ({
    ref: null as HTMLDivElement | null,
  }))
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
    setRef(ref: HTMLDivElement | null) {
      self.ref = ref;
    },
    setPosition(x: number, y: number) {
      self.posX = x;
      self.posY = y;
      // self.ports.forEach((port) => port.updatePosition());
    },
  }));
export interface INodeStore extends Instance<typeof NodeStore> {}
