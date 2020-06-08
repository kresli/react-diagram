import * as React from "react";
import "./app.css";
import { IPlaygroundStore } from "../stores/index";
import { Playground } from "./index";
import { Eventor } from "../utils";

export const App: React.FunctionComponent<{
  data: IPlaygroundStore;
}> = ({ data }) => {
  const eventor = new Eventor(window);
  return (
    <div className="App">
      <div style={{ padding: "3em", display: "flex", flex: 1, height: "100%" }}>
        <Playground playground={data} eventor={eventor} />
      </div>
    </div>
  );
};
