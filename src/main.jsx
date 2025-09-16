import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.jsx";

// Import Bootstrap styles and scripts first
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import custom styles
import "./index.css";

// Render the main App component inside the root element
ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
