import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Make sure Tailwind is imported here


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);