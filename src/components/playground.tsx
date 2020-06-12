import React, { useRef, FunctionComponent, useEffect } from "react";
import { IPlaygroundStore, INodeStore, IConnectionStore } from "../stores";
import { NodeBlock } from ".";
import { observer } from "mobx-react";
import { Grid } from ".";
interface PlaygroundProps {
  playground: IPlaygroundStore;
}

export const Playground: FunctionComponent<PlaygroundProps> = observer(
  ({ playground }) => {
    const { nodes, eventor } = playground;
    const canvasSize = {
      width: 100,
      height: 100,
    };
    const canvasRef = useRef<HTMLDivElement>(null);
    const playgroundRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const {
        width,
        height,
        x: boundX,
        y: boundY,
      } = playgroundRef.current?.getBoundingClientRect()!;
      eventor.setPlaygroundBounds({ width, height, boundX, boundY });
    }, []);
    useEffect(() => {
      eventor.setCanvasBounds(canvasRef.current);
    }, []);

    const style = {
      display: "flex",
      background: "grey",
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
    } as const;
    const canvasStyle = {
      background: "rgba(255, 0,0, 0.1)",
      width: canvasSize.width,
      height: canvasSize.height,
      transformOrigin: "0 0",
      position: "absolute",
      left: eventor.canvasPosition.x,
      top: eventor.canvasPosition.y,
      transform: `scale(${eventor.scale})`,
    } as const;
    return (
      <div
        style={style}
        onMouseMove={eventor.onMouseMove}
        onMouseDown={eventor.onMouseDown}
        onMouseUp={eventor.onMouseUp}
        onWheel={eventor.onWheel}
        ref={playgroundRef}
      >
        <Grid size={15} />
        <div className="Canvas" style={canvasStyle} ref={canvasRef}>
          <Connectors playground={playground} />
          <Nodes playground={playground} setDrag={eventor.setDragNode} />
        </div>
      </div>
    );
  }
);

const Nodes: FunctionComponent<{
  playground: IPlaygroundStore;
  setDrag(
    node: INodeStore,
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void;
}> = observer(({ playground, setDrag }) => (
  <>
    {playground.nodes.map((node) => (
      <NodeBlock
        key={node.id}
        node={node}
        onDragStart={(evt) => setDrag(node, evt)}
        onConnectionDelete={() => {}}
      />
    ))}
  </>
));

const Connectors: FunctionComponent<{
  playground: IPlaygroundStore;
}> = observer(({ playground }) => {
  return (
    <svg
      style={{
        overflow: "visible",
        position: "absolute",
        top: 0,
        left: 0,
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
