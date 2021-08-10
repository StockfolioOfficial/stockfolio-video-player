import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { RepeatProvider } from "contexts/repeatStore";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <RepeatProvider>
      <App />
    </RepeatProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
