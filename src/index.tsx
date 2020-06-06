import * as React from "react";
import { render } from "react-dom";
import { App } from "./components/index";
import { data } from "./data";
const rootElement = document.getElementById("root");
render(<App data={data} />, rootElement);
