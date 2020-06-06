import React, { useRef, useState, FunctionComponent, useEffect } from "react";
import {
  NodePosition,
  IPlaygroundStore,
  INodeStore,
  IConnectionStore,
} from "../stores";
import { NodeBlock } from ".";
import { observer } from "mobx-react";
import { Grid } from ".";
import { getType } from "mobx-state-tree";
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
    y: evt.pageY - y,
  };
}

export const Playground: FunctionComponent<PlaygroundProps> = observer(
  ({ playgroundStore }) => {
    const { nodes } = playgroundStore;
    const canvasSize = {
      width: 1,
      height: 1,
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

    const [canvasScale, setCanvasScale] = useState(1);

    useEffect(() => {
      playgroundStore.setCanvasRef(canvasRef.current);
    }, [canvasRef]);
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
          x: dragRelativeOffset!.x / canvasScale,
          y: dragRelativeOffset!.y / canvasScale,
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
      const x = dragRelativeOffset.x / canvasScale;
      const y = dragRelativeOffset.y / canvasScale;
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
        panOffset: { x: x + movementX, y: y + movementY },
      });
    };

    const onMouseMove = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      moveNode(evt);
      moveCanvas(evt);
    };

    const onMouseDown = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setPan({ isPan: true, panOffset });
    };

    const onWheel = (evt: React.WheelEvent<HTMLDivElement>) => {
      const { deltaY } = evt;
      if (deltaY > 0 && canvasScale < 0.3) return;
      const scaleFactor = deltaY / 1000;
      const { x, y } = getMousePosParent(evt, canvasRef.current!);

      const scale = canvasScale - scaleFactor;
      playgroundStore.setCanvasScale(scale);

      setCanvasScale(scale);
      setPan({
        isPan: false,
        panOffset: {
          x:
            panOffset.x +
            ((canvasSize.width * scaleFactor) / 100) *
              (x / canvasScale / (canvasSize.width / 100)),
          y:
            panOffset.y +
            ((canvasSize.height * scaleFactor) / 100) *
              (y / canvasScale / (canvasSize.height / 100)),
        },
      });
    };

    const style = {
      display: "flex",
      background: "grey",
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
    } as const;
    const canvasStyle = {
      // userSelect: "none",
      background: "rgba(255, 0,0, 0.1)",
      width: canvasSize.width,
      height: canvasSize.height,
      transformOrigin: "0 0",
      position: "absolute",
      left: panOffset.x,
      top: panOffset.y,
      transform: `scale(${canvasScale})`,
    } as const;
    return (
      <div
        style={style}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        ref={playgroundRef}
      >
        <Grid size={15} />
        <CanvasDragger onMouseDown={onMouseDown} />
        <div className="Canvas" style={canvasStyle} ref={canvasRef}>
          <Connectors playground={playgroundStore} />
          {nodes.map((node) => (
            <NodeBlock
              key={node.id}
              node={node}
              onDragStart={(evt) => setDrag(true, node, evt)}
            />
          ))}
          {/* {connections.map((connection) => (
            <Connection key={connection.id} connection={connection} />
          ))} */}
        </div>
      </div>
    );
  }
);

const CanvasDragger: FunctionComponent<{
  onMouseDown(evt: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}> = ({ onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className="CanvasDragger"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "rgba(0,255,0, 0.1)",
      }}
    ></div>
  );
};

const Connectors: FunctionComponent<{
  playground: IPlaygroundStore;
}> = observer(({ playground }) => {
  return (
    <svg
      style={{
        overflow: "visible",
        position: "absolute",
      }}
    >
      {playground.connections.map((connection) => (
        <Connection key={connection.id} connection={connection} />
      ))}
    </svg>
  );
});

const Connection: FunctionComponent<{
  connection: IConnectionStore;
}> = observer(({ connection }) => {
  const { startGateCanvasPosition, endGateCanvasPosition } = connection;
  // console.log(document.getElementById(connection.start.id));
  return <Path start={startGateCanvasPosition!} end={endGateCanvasPosition!} />;
});

const Path: FunctionComponent<{
  start: { x: number; y: number };
  end: { x: number; y: number };
}> = observer(({ start, end }) => {
  const points = [
    [start.x, start.y],
    [start.x + 30, start.y],
    [end.x - 30, end.y],
    [end.x, end.y],
  ].join(",");
  return <polyline points={points} stroke="red" strokeWidth="3" fill="none" />;
});
