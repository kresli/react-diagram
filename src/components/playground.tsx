import React, { useRef, useState, FunctionComponent } from "react";
import { NodePosition, IPlaygroundStore, INodeStore } from "../stores";
import { NodeBlock } from ".";
import { observer } from "mobx-react";
import { Grid } from ".";
interface PlaygroundProps {
  playgroundStore: IPlaygroundStore;
}

function getMousePosParent(
  evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
  parent: HTMLDivElement
) {
  const { x, y } = parent.getBoundingClientRect();
  return {
    x: evt.pageX - x,
    y: evt.pageY - y
  };
}

export const Playground: FunctionComponent<PlaygroundProps> = observer(
  ({ playgroundStore }) => {
    const { nodes } = playgroundStore;
    const canvasSize = {
      width: 800,
      height: 800
    };
    const canvasRef = useRef<HTMLDivElement>(null);
    const playgroundRef = useRef<HTMLDivElement>(null);

    const [{ dragNode, dragOffset }, setDragNode] = useState<{
      dragNode: INodeStore | null;
      dragOffset: NodePosition | null;
    }>({ dragNode: null, dragOffset: null });

    const [{ isPan, panOffset }, setPan] = useState<{
      isPan: boolean;
      panOffset: NodePosition;
    }>({ isPan: false, panOffset: { x: 0, y: 0 } });

    const [canasZoom, setCanasZoom] = useState(1);

    interface SetDrag {
      (isDragging: true, node: INodeStore, offset: NodePosition): void;
      (isDragging: false): void;
    }
    const setDrag: SetDrag = (
      isDragging: boolean,
      node?: INodeStore,
      offset?: NodePosition
    ) => {
      if (isDragging) {
        const dragRelativeOffset = offset;
        const dragOffset = {
          x: dragRelativeOffset!.x / canasZoom,
          y: dragRelativeOffset!.y / canasZoom
        };

        setDragNode({ dragNode: node!, dragOffset: dragOffset! });
      } else {
        setDragNode({ dragNode: null, dragOffset: null });
      }
    };

    const moveNode = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!dragNode || !canvasRef.current || !dragOffset) return;
      if (dragNode && evt.buttons === 0) setDrag(false);
      const dragRelativeOffset = getMousePosParent(evt!, canvasRef.current);
      const x = dragRelativeOffset.x / canasZoom;
      const y = dragRelativeOffset.y / canasZoom;
      dragNode.updatePosition(x - dragOffset.x, y - dragOffset.y);
    };

    const moveCanvas = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isPan) return;
      if (isPan && evt.buttons === 0) {
        setPan({ isPan: false, panOffset: panOffset });
        return;
      }
      const { movementX, movementY } = evt;
      const { x, y } = panOffset;
      setPan({
        isPan: true,
        panOffset: { x: x + movementX, y: y + movementY }
      });
    };

    const onMouseMove = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      moveNode(evt);
      moveCanvas(evt);
    };

    const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const elem = document.elementsFromPoint(evt.clientX, evt.clientY);
      if (elem[0] !== canvasRef.current) return;
      setPan({ isPan: true, panOffset });
    };

    const onWheel = (evt: React.WheelEvent<HTMLDivElement>) => {
      const { deltaY } = evt;
      if (deltaY > 0 && canasZoom < 0.3) return;
      const scaleFactor = deltaY / 1000;
      const { x, y } = getMousePosParent(evt, canvasRef.current!);

      const zoom = canasZoom - scaleFactor;

      setCanasZoom(zoom);
      setPan({
        isPan: false,
        panOffset: {
          x:
            panOffset.x +
            ((canvasSize.width * scaleFactor) / 100) *
              (x / canasZoom / (canvasSize.width / 100)),
          y:
            panOffset.y +
            ((canvasSize.height * scaleFactor) / 100) *
              (y / canasZoom / (canvasSize.height / 100))
        }
      });
    };

    const style = {
      display: "flex",
      background: "grey",
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden"
    } as const;
    const canvasStyle = {
      background: "transparent",
      width: canvasSize.width,
      height: canvasSize.height,
      transformOrigin: "0 0",
      position: "absolute",
      left: panOffset.x,
      top: panOffset.y,
      transform: `scale(${canasZoom})`
    } as const;
    return (
      <div
        style={style}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
        ref={playgroundRef}
      >
        <Grid size={15} />
        <div style={canvasStyle} ref={canvasRef}>
          {nodes.map(node => (
            <NodeBlock
              key={node.id}
              node={node}
              onDragStart={evt => setDrag(true, node, evt)}
            />
          ))}
        </div>
      </div>
    );
  }
);
