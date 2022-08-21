import "./app.css";
import "@fontsource/jetbrains-mono/variable-full.css";
import "@fontsource/jetbrains-mono/variable-full-italic.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
