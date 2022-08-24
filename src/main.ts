import "./app.css";
import "@fontsource/jetbrains-mono/variable-full.css";
import "@fontsource/jetbrains-mono/variable-full-italic.css";

import App from "./App.svelte";
import Tools from "./Tools.svelte";
import Home from "./Home.svelte";

const mode = new URLSearchParams(window.location.search).get("mode") || "";

const Component =
  {
    tools: Tools,
    app: App,
  }[mode] || Home;

const app = new Component({
  target: document.getElementById("app")!,
});

export default app;
