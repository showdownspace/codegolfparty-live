<script lang="ts">
  import type { Lang, Modifier } from "./model";

  import {
    bonusClass,
    buffClass,
    mysteryClass,
    nerfClass,
    view,
  } from "./viewModel";
  function formatSize(x: number) {
    if (!Number.isFinite(x)) {
      return "---";
    }
    return Math.round(x);
  }
  function formatName(n: string) {
    return n || "---";
  }
  function modifierClass(m: Modifier["type"]) {
    if (m === "buff") return buffClass;
    if (m === "nerf") return nerfClass;
    if (m === "bonus") return bonusClass;
    if (m === "mystery") return mysteryClass;
    return "";
  }
</script>

<div class="fixed inset-0 flex flex-col">
  <div class="flex flex-auto flex-col gap-8 items-center justify-center">
    {#if view.type === "text"}
      <div class="text-4xl whitespace-pre-line">
        {view.text}
      </div>
    {:else if view.type === "round-info"}
      <h1 class="text-2xl">Set {view.setNumber}, Round {view.roundNumber}</h1>

      {#each view.modifiers as mod}
        <span class="text-4xl font-bold {modifierClass(mod.type)}">
          {mod.name}
        </span>
      {:else}
        <span class="text-4xl">No modifiers</span>
      {/each}
    {:else if view.type === "round-result"}
      <h1 class="text-2xl">Set {view.setNumber}, Round {view.roundNumber}</h1>
      <table class="text-4xl font-extralight">
        <thead>
          <tr>
            <th class="uppercase opacity-60 text-left text-xl">Name</th>
            <th class="uppercase opacity-60 text-center text-xl">Language</th>
            <th class="uppercase opacity-60 text-center text-xl">Tests</th>
            <th class="uppercase opacity-60 text-center text-xl" colspan="3">
              Code Length
            </th>
            <th class="uppercase opacity-60 text-center text-xl">Time</th>
            <th class="uppercase opacity-60 text-center text-xl" colspan="3">
              Round Score
            </th>
          </tr>
        </thead>
        <tbody>
          {#each view.results as row}
            <tr>
              <td class="pr-3">
                {formatName(row.nickname)}
              </td>
              <td class="px-6 text-center">
                {row.displayLanguage}
              </td>
              <td class="px-6 text-center">
                {row.score}
              </td>

              <td class="pl-3 text-center text-[0.75em]">
                <span
                  class:opacity-0={row.originalCount === row.adjustedCount}
                  class={modifierClass(
                    row.adjustedCount > row.originalCount ? "nerf" : "buff"
                  )}
                >
                  {formatSize(row.originalCount)}
                </span>
              </td>
              <td class="px-1 text-center opacity-50 text-[0.75em]">
                <span class:opacity-0={row.originalCount === row.adjustedCount}>
                  &rarr;
                </span>
              </td>
              <td class="text-center">
                {formatSize(row.adjustedCount)}
              </td>

              <td class="px-8 text-center">
                {row.duration.slice(3)}
              </td>

              <td class="pl-6 text-center text-[0.75em]">
                <span
                  class:opacity-0={row.baseScore === row.adjustedScore}
                  class={modifierClass("bonus")}
                >
                  {row.baseScore}
                </span>
              </td>
              <td class="px-1 text-center opacity-50 text-[0.75em]">
                <span class:opacity-0={row.baseScore === row.adjustedScore}>
                  &rarr;
                </span>
              </td>
              <td class="text-center">
                {row.adjustedScore}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div>
        <span>Active modifiers:</span>
        {#each view.modifiers as mod}
          <span class="pl-4 font-bold {modifierClass(mod.type)}"
            >{mod.name}</span
          >
        {:else}
          None
        {/each}
      </div>
    {:else if view.type === "set-ranking"}
      <h1 class="text-2xl">Set {view.setNumber}</h1>
      <table class="text-4xl font-extralight">
        <thead>
          <tr>
            <th class="uppercase opacity-60 text-left text-xl">Name</th>
            <th class="uppercase opacity-60 text-right text-xl" colspan="2">
              Total Points
            </th>
          </tr>
        </thead>
        <tbody>
          {#each view.entries as row}
            <tr>
              <td class="pr-3">
                {formatName(row.name)}
              </td>
              <td class="pl-4 text-right">
                {row.points}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else if view.type === "overall-ranking"}
      <h1 class="text-2xl">Overall ranking</h1>
      <table class="text-4xl font-extralight">
        <thead>
          <tr>
            <th class="uppercase opacity-60 text-left text-xl">Name</th>
            {#each view.sets as set}
              <th class="uppercase opacity-60 text-right text-xl pl-4">
                Set {set}
              </th>
            {/each}
            <th class="uppercase opacity-60 text-right text-xl pl-4">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {#each view.entries as row}
            <tr>
              <td class="pr-3">
                {formatName(row.name)}
              </td>
              {#each view.sets as set}
                <td class="pl-8 text-right">
                  {row.pointsBySet[set]}
                </td>
              {/each}
              <td class="pl-8 text-right">
                <strong>{row.points}</strong>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
