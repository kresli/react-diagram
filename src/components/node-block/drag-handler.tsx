import { INodeStore, IConnectionStore } from "../../stores";
import { observer } from "mobx-react";
import { useRef } from "react";
import React from "react";

interface DragHandlerProps {
  node: INodeStore;
  onDragStart(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onConnectionDelete(connection: IConnectionStore): void;
}

export const DragHandler: React.FunctionComponent<{
  node: INodeStore;
  onDragStart: DragHandlerProps["onDragStart"];
}> = observer(({ onDragStart, node }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    onDragStart(evt);
  };
  return (
    <div ref={ref} className="DragHandler" onMouseDown={onMouseDown}>
      {node.label}
    </div>
  );
});
