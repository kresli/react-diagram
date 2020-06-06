import { FunctionComponent, useState, useEffect } from "react";
import React from "react";
export const Grid: FunctionComponent<{ size: number }> = ({ size }) => {
  const [lines, setLines] = useState<number[]>([]);

  useEffect(() => {
    const recalculate = () => {
      const { innerHeight, innerWidth } = window;
      const length = Math.floor(
        (innerHeight > innerWidth ? innerHeight : innerWidth) / size
      );
      const lines = Array.from({ length }).map((_, i) => i * size);
      setLines(lines);
    };
    window.addEventListener("resize", recalculate);
    recalculate();
    return () => window.removeEventListener("resize", recalculate);
  }, [size]);

  return (
    <div style={{ width: "100%" }}>
      {lines.map(x => (
        <Line key={x} offset={x} vertical />
      ))}
      {lines.map(y => (
        <Line key={y} offset={y} />
      ))}
    </div>
  );
};

const Line: FunctionComponent<{ offset: number; vertical?: boolean }> = ({
  offset,
  vertical
}) => (
  <div
    style={{
      userSelect: "none" as "none",
      top: vertical ? 0 : offset,
      left: vertical ? offset : 0,
      width: vertical ? 1 : "100%",
      height: vertical ? "100%" : 1,
      position: "absolute",
      background: "rgba(0,0,0,0.2)"
    }}
  />
);
