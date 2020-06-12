import React from "react";
import { INodeStore, IPortStore } from "../../stores";
import { Port } from "./port";
export const Ports: React.FunctionComponent<{
  node: INodeStore;
  onPortClick(port: IPortStore): void;
}> = ({ node, onPortClick }) => (
  <div className="Ports">
    <div className="ports-in">
      {node.portsIn.map((port) => (
        <Port key={port.id} port={port} onPortClick={() => onPortClick(port)} />
      ))}
    </div>
    <div className="ports-out">
      {node.portsOut.map((port) => (
        <Port key={port.id} port={port} onPortClick={() => onPortClick(port)} />
      ))}
    </div>
  </div>
);
