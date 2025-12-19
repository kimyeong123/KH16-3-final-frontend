import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/flatly/bootstrap.min.css";
import "bootstrap";
import "./index.css";

//axios
import "./utils/axios";

//create react app
createRoot(document.getElementById("root")).render(<App />);
