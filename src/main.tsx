import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuthListener } from "@/store/auth";

// Démarre l'écouteur Firebase Auth dès le chargement de l'app
initAuthListener();

createRoot(document.getElementById("root")!).render(<App />);
