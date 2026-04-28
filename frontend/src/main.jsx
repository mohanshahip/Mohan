// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ ADD THIS

import "./styles/global.css";
import "./styles/force-ltr.css";
import "./i18n";

document.documentElement.setAttribute("dir", "ltr");
document.documentElement.style.direction = "ltr";
document.body.setAttribute("dir", "ltr");
document.body.style.direction = "ltr";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>   {/* ✅ WRAP HERE */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);