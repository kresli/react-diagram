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
  const gatePointStyle = {
    background: "rgba(0,0,255, 1)",
    width: 1,
    height: 1,
  };
  const gateRef = useRef<HTMLDivElement>(null);
  const gate = (
    <div className="gate" onClick={onPortClick}>
      <div style={gatePointStyle} ref={gateRef} id={port.gateId} />
    </div>
  );
  useEffect(() => {
    port.setGateRef(gateRef.current);
  }, [gateRef]);
  return (
    <div className="Port" id={port.id}>
      {port.isIn && gate}
      <div className="label">{port.label}</div>
      {port.isOut && gate}
    </div>
  );
};
