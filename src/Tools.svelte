<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { escape } from "lodash-es";
  let code = "// Code will appear here";

  function tryParse(htmlStr: string) {
    const doc = new DOMParser().parseFromString(htmlStr, "text/html");
    const getText = (el: any) => el?.innerText;
    if (doc.querySelector(".clash-info-container")) {
      const rows = Array.from(
        doc.querySelectorAll(".clash-info-container")
      ).map((row) => {
        const nickname = row.querySelector("a")?.innerText;
        const userId = row
          .querySelector("a")
          ?.getAttribute("href")
          ?.match(/\/profile\/([^?#]+)/)?.[1];
        const score = getText(row.querySelector(".score .info-value"));
        const duration = getText(row.querySelector(".duration .info-value"));
        const language = getText(row.querySelector(".language .info-value"));
        const criterion = getText(row.querySelector(".criterion .info-value"));
        return {
          nickname,
          userId,
          score,
          duration,
          language,
          criterion,
        };
      });
      console.log(rows);
      return `game.play(${JSON.stringify(rows, null, 2)})`;
    }
    if (doc.querySelector(".statement-body")) {
      const statement = doc.querySelector(".statement-body")!;
      const output = [];
      let mode = "normal";
      let characterStyle = "normal";
      const traverse = (el: any) => {
        if (el.nodeType === 3) {
          if (
            !output.length ||
            output[output.length - 1].mode !== mode ||
            (output[output.length - 1].closed &&
              output[output.length - 1].mode !== "pre")
          ) {
            output.push({
              mode,
              spans: [],
              closed: false,
            });
          }
          if (
            output[output.length - 1].closed &&
            output[output.length - 1].mode === "pre"
          ) {
            output[output.length - 1].spans.push({
              text: "\n",
              style: "normal",
            });
          }
          const spans = output[output.length - 1].spans;
          if (
            !spans.length ||
            spans[spans.length - 1].style !== characterStyle
          ) {
            spans.push({
              style: characterStyle,
              text: "",
            });
          }
          spans[spans.length - 1].text += el.nodeValue;
        }
        if (el.nodeType === 1) {
          let nextMode = mode;
          let nextCharacterStyle = characterStyle;
          if (el.matches("h2, .title")) {
            nextMode = "header";
          } else if (el.matches("pre")) {
            nextMode = "pre";
          } else if (el.matches("var")) {
            nextCharacterStyle = "var";
          } else if (el.matches("const")) {
            nextCharacterStyle = "const";
          } else if (el.matches("strong")) {
            nextCharacterStyle = "bold";
          } else if (el.matches("br")) {
            if (output.length) {
              output[output.length - 1].closed = true;
            }
          }
          const previousMode = mode;
          const previousCharacterStyle = characterStyle;
          mode = nextMode;
          characterStyle = nextCharacterStyle;
          try {
            el.childNodes.forEach((child) => traverse(child));
          } finally {
            mode = previousMode;
            characterStyle = previousCharacterStyle;
          }
        }
      };
      traverse(statement);
      const lines: string[] = [];
      for (const row of output) {
        const text = () => {
          return row.spans
            .map((s) => {
              if (s.style === "var") {
                return '<span data-style="var">' + escape(s.text) + "</span>";
              } else if (s.style === "const") {
                return '<span data-style="const">' + escape(s.text) + "</span>";
              } else if (s.style === "bold") {
                return "**" + escape(s.text) + "**";
              }
              return escape(s.text);
            })
            .join("");
        };
        const rawText = () => {
          return row.spans.map((s) => s.text).join("");
        };
        if (row.mode === "header") {
          lines.push("", `## ${text().trim()}`, "");
        } else if (row.mode === "pre") {
          lines.push("```", rawText(), "```");
        } else {
          lines.push(text() + (row.closed ? " \\" : ""));
        }
      }
      return lines.join("\n");
    }
  }

  const onPaste = (e: ClipboardEvent) => {
    const result =
      tryParse(e.clipboardData.getData("text/html")) ||
      tryParse(e.clipboardData.getData("text/plain")) ||
      "// Nothing found";
    if (result) {
      code = result;
    }
  };

  onMount(() => {
    document.addEventListener("paste", onPaste);
  });
  onDestroy(() => {
    document.removeEventListener("paste", onPaste);
  });
</script>

<div class="p-4">
  <h1 class="font-bold">Tools</h1>
  <p>Paste a CodinGame web page contents to get code.</p>
  <div>
    <textarea
      value={code}
      readonly
      class="text-sm w-full border border-slate-500 bg-slate-900 p-2 rounded h-[16em]"
    />
  </div>
</div>
