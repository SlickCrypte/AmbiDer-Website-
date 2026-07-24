import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 2500,
        style: {
          background: "#ffffff",
          color: "#1747d1",
          fontWeight: "600",
          borderRadius: "12px",
          border: "1px solid #d9dfeb",
          padding: "16px"
        },

        success: {
          iconTheme: {
            primary: "#1747d1",
            secondary: "#ffffff",
          },
        },
      }}
    />

    <App />

  </StrictMode>
);