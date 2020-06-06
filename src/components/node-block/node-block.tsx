import { observer } from "mobx-react";
import { useRef } from "react";
import React from "react";
import { NodePosition, INodeStore } from "../../stores";
import { Ports } from "./ports";
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
      userSelect: "none",
    } as const;
    return (
      <div style={style} id={node.id}>
        <DragHandler node={node} onDragStart={onDragStart} />
        <Ports node={node} />
      </div>
    );
  }
);

const DragHandler: React.FunctionComponent<{
  node: INodeStore;
  onDragStart: NodeProps["onDragStart"];
}> = observer(({ onDragStart, node }) => {
  const ref = useRef<HTMLDivElement>(null);
  const style = {
    padding: "1em",
    background: "green",
    userSelect: "none",
  } as const;
  const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const { x, y } = ref.current.getBoundingClientRect();
    const offset = {
      x: evt.pageX - x,
      y: evt.pageY - y,
    };
    onDragStart(offset);
  };
  return (
    <div ref={ref} style={style} onMouseDown={onMouseDown}>
      {node.label}
    </div>
  );
});
