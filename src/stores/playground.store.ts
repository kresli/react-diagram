import { types, Instance, destroy, cast } from "mobx-state-tree";
import { NodeStore, ConnectionStore, IConnectionStore } from ".";

export const PlaygroundStore = types
  .model({
    nodes: types.array(NodeStore),
    connections: types.array(ConnectionStore),
  })
  .volatile(() => ({
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
    deleteConnection(connection: IConnectionStore) {
      console.log("delete");
      self.connections = cast(
        self.connections.filter(({ id }) => id === connection.id)
      );
      destroy(connection);
    },
  }));
export interface IPlaygroundStore extends Instance<typeof PlaygroundStore> {}
