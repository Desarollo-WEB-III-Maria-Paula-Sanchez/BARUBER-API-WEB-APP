import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuth } from "./store/auth";

function Root() {
  // Hidratar Zustand una sola vez al inicio
  useEffect(() => {
    useAuth.getState().hydrate(); // <<< Carga token de localStorage
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
