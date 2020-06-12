import { types, Instance, destroy, cast } from "mobx-state-tree";
import { NodeStore, ConnectionStore, IConnectionStore } from ".";
import { Eventor as Canvas } from "../utils";

export const PlaygroundStore = types
  .model({
    nodes: types.array(NodeStore),
    connections: types.array(ConnectionStore),
  })
  .volatile(() => ({
    canvas: new Canvas(),
  }));
export interface IPlaygroundStore extends Instance<typeof PlaygroundStore> {}
