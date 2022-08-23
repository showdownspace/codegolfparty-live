import "./app.css";
import "@fontsource/jetbrains-mono/variable-full.css";
import "@fontsource/jetbrains-mono/variable-full-italic.css";

import App from "./App.svelte";
import Tools from "./Tools.svelte";

const Component =
  new URLSearchParams(window.location.search).get("mode") === "tools"
    ? Tools
    : App;

const app = new Component({
  target: document.getElementById("app"),
});

export default app;
