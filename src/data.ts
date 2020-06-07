import { v4 } from "uuid";
import { PlaygroundStore, NodeScopeType, PortDirection } from "./stores/index";

const uuid = Array.from({ length: 10 }).map(() => v4());

export const data = PlaygroundStore.create({
  nodes: [
    {
      id: v4(),
      type: NodeScopeType.ACTION,
      label: "Random Number",
      posX: 200,
      posY: 100,
      ports: [
        // {
        //   id: v4(),
        //   direction: PortDirection.IN,
        //   label: "Min",
        // },
        // {
        //   id: v4(),
        //   direction: PortDirection.IN,
        //   label: "Max",
        // },
        {
          id: uuid[0],
          direction: PortDirection.OUT,
          label: "B",
        },
      ],
    },
    {
      id: v4(),
      type: NodeScopeType.ACTION,
      label: "open google",
      posX: 800,
      posY: 400,
      ports: [
        {
          id: uuid[1],
          direction: PortDirection.IN,
          label: "A",
        },
      ],
    },
  ],
  connections: [
    {
      id: v4(),
      label: "my-label",
      start: uuid[0],
      end: uuid[1],
    },
  ],
});
