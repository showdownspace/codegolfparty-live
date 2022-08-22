<script lang="ts">
  import { view } from "./viewModel";
  const mapLang = {
    "Python 3": "Python",
    JavaScript: "JS",
  };
  function formatSize(x: number) {
    if (!Number.isFinite(x)) {
      return "---";
    }
    return Math.round(x);
  }
  function formatName(n: string) {
    return n || "---";
  }
</script>

{#if view.type === "round"}
  <div class="fixed inset-0 flex flex-col">
    <div class="flex flex-auto flex-col gap-8 items-center justify-center">
      <h1 class="text-2xl">Round {view.roundNumber}</h1>
      <table class="text-4xl font-extralight">
        <thead>
          <tr>
            <th class="uppercase opacity-60 text-left text-xl">Name</th>
            <th class="uppercase opacity-60 text-center text-xl">Language</th>
            <th class="uppercase opacity-60 text-center text-xl">Tests</th>
            <th class="uppercase opacity-60 text-center text-xl" colspan="3"
              >Code Length</th
            >
            <th class="uppercase opacity-60 text-center text-xl">Time</th>
            <th class="uppercase opacity-60 text-center text-xl" colspan="3"
              >Round Score</th
            >
          </tr>
        </thead>
        <tbody>
          {#each view.results as row}
            <tr>
              <td class="pr-3">
                {formatName(row.nickname)}
              </td>
              <td class="px-6 text-center">
                {mapLang[row.language] || row.language}
              </td>
              <td class="px-6 text-center">
                {row.score}
              </td>

              <td class="pl-3 text-center opacity-50 text-[0.75em]">
                <span class:opacity-0={row.originalCount === row.adjustedCount}>
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

              <td class="pl-6 text-center opacity-50 text-[0.75em]">
                <span class:opacity-0={row.baseScore === row.adjustedScore}>
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
          <span class="pl-4 text-slate-400 font-bold">{mod}</span>
        {:else}
          None
        {/each}
      </div>
    </div>
  </div>
{:else if view.type === "set-ranking"}
  <div class="fixed inset-0 flex flex-col">
    <div class="flex flex-auto flex-col gap-8 items-center justify-center">
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
    </div>
  </div>
{/if}
