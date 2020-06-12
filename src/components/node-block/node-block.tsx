import { observer } from "mobx-react";
import { useRef, useEffect } from "react";
import React from "react";
import { INodeStore, IPortStore, IConnectionStore } from "../../stores";
import { Ports } from "./ports";
import "./node-block.scss";
import { DragHandler } from "./drag-handler";

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
      top: `${node.posY}px`,
      left: `${node.posX}px`,
    } as const;
    return (
      <div className="NodeBlock" style={style} id={node.id} ref={ref}>
        <DragHandler node={node} onDragStart={onDragStart} />
        <Ports node={node} onPortClick={onPortClick} />
      </div>
    );
  }
);
