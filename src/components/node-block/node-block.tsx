import { observer } from "mobx-react";
import { useRef, useEffect } from "react";
import React from "react";
import {
  NodePosition,
  INodeStore,
  IPortStore,
  IConnectionStore,
} from "../../stores";
import { Ports } from "./ports";
interface NodeProps {
  node: INodeStore;
  onDragStart(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onConnectionDelete(connection: IConnectionStore): void;
}

export const NodeBlock: React.FunctionComponent<NodeProps> = observer(
  ({ node, onDragStart, onConnectionDelete }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      node.setRef(ref.current);
    }, [ref]);

    const onPortClick = (port: IPortStore) => {
      console.log("onClick");
      if (port.connection) {
        onConnectionDelete(port.connection);
      }
    };
    const style = {
      position: "absolute",
      top: `${node.posY}px`,
      left: `${node.posX}px`,
    } as const;
    return (
      <div style={style} id={node.id} ref={ref}>
        <DragHandler node={node} onDragStart={onDragStart} />
        <Ports node={node} onPortClick={onPortClick} />
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
    whiteSpace: "nowrap",
  } as const;
  const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const { x, y } = ref.current.getBoundingClientRect();
    const offset = {
      x: evt.pageX - x,
      y: evt.pageY - y,
    };
    onDragStart(evt);
  };
  return (
    <div ref={ref} style={style} onMouseDown={onMouseDown}>
      {node.label}
    </div>
  );
});
