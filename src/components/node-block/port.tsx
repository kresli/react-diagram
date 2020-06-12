import { IPortStore } from "../../stores";
import { useRef, useEffect } from "react";
import React from "react";

export const Port: React.FunctionComponent<{
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
