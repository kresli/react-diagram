import { types, getType, Instance } from "mobx-state-tree";
import { PortStore, IPortStore } from ".";
import { v4 } from "uuid";

const ConnectionTargetType = types.union(
  types.reference(PortStore),
  types.model({
    posX: types.optional(types.number, 0),
    posY: types.optional(types.number, 0),
  })
);

export const ConnectionStore = types
  .model({
    id: types.optional(types.identifier, () => v4()),
    label: types.optional(types.string, "Port"),
    start: ConnectionTargetType,
    end: ConnectionTargetType,
  })
  .views((self) => ({
    get startGateCanvasPosition(): { x: number; y: number } | null {
      const { start } = self;
      const port = getType(start) === PortStore ? (start as IPortStore) : null;
      return port?.gateCanvasPosition || null;
    },
    get endGateCanvasPosition(): { x: number; y: number } | null {
      const { end } = self;
      return getType(end) === PortStore
        ? (end as IPortStore).gateCanvasPosition
        : null;
    },
  }));
export interface IConnectionStore extends Instance<typeof ConnectionStore> {}
