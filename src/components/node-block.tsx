import { observer } from "mobx-react";
import { useRef } from "react";
import React from "react";
import { NodePosition, INodeStore, IPortStore } from "../stores/index";

interface NodeProps {
  node: INodeStore;
  onDragStart(offset: NodePosition): void;
}

export const NodeBlock: React.FunctionComponent<NodeProps> = observer(
  ({ node, onDragStart }) => {
    const style = {
      background: "white",
      position: "absolute",
      top: `${node.posY}px`,
      left: `${node.posX}px`,
      userSelect: "none"
    } as const;
    return (
      <div style={style}>
        <DragHandler node={node} onDragStart={onDragStart} />
        <Connections node={node} />
      </div>
    );
  }
);

const Connections: React.FunctionComponent<{ node: INodeStore }> = ({
  node
}) => (
  <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
    {node.portsIn.map(port => (
      <Port key={port.id} port={port} />
    ))}
    {node.portsOut.map(port => (
      <Port key={port.id} port={port} />
    ))}
  </div>
);

const Port: React.FunctionComponent<{ port: IPortStore }> = ({ port }) => (
  <div style={{ display: "flex", flex: 1 }}>
    {port.isIn && <div style={{ width: 10, height: 10, background: "red" }} />}
    <div style={{ flex: 1 }}>{port.label}</div>
    {port.isOut && <div style={{ width: 10, height: 10, background: "red" }} />}
  </div>
);

const DragHandler: React.FunctionComponent<{
  node: INodeStore;
  onDragStart: NodeProps["onDragStart"];
}> = observer(({ onDragStart, node }) => {
  const ref = useRef<HTMLDivElement>(null);
  const style = {
    padding: "1em",
    background: "green",
    userSelect: "none"
  } as const;
  const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const { x, y } = ref.current.getBoundingClientRect();
    const offset = {
      x: evt.pageX - x,
      y: evt.pageY - y
    };
    onDragStart(offset);
  };
  return (
    <div ref={ref} style={style} onMouseDown={onMouseDown}>
      {node.label}
    </div>
  );
});
