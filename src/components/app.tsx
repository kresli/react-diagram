import * as React from "react";
import "./app.css";
import { IPlaygroundStore } from "../stores/index";
import { Playground } from "./index";

export const App: React.FunctionComponent<{
  data: IPlaygroundStore;
}> = ({ data }) => (
  <div className="App">
    <div style={{ padding: "3em", display: "flex", flex: 1, height: "100%" }}>
      <Playground playgroundStore={data} />
    </div>
  </div>
);
