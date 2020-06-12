import React, { useEffect, useRef } from "react";
import { INodeStore, IPortStore } from "../../stores";
import "./ports.scss";
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
    {node.portsOut.length > 0 && <div className="ports-separator" />}
    <div className="ports-out">
      {node.portsOut.map((port) => (
        <Port key={port.id} port={port} onPortClick={() => onPortClick(port)} />
      ))}
    </div>
  </div>
);

const Port: React.FunctionComponent<{
  port: IPortStore;
  onPortClick(): void;
}> = ({ port, onPortClick }) => {
  const gateRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    port.setGateRef(gateRef.current);
  }, [gateRef]);
  return (
    <div className="Port" id={port.id}>
      {port.isIn && (
        <div
          className="gate"
          id={port.gateId}
          onClick={onPortClick}
          ref={gateRef}
        />
      )}
      <div className="label">{port.label}</div>
      {port.isOut && (
        <div
          className="gate"
          id={port.gateId}
          onClick={onPortClick}
          ref={gateRef}
        />
      )}
    </div>
  );
};
