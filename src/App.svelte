<script lang="ts">
  import { game } from "./viewModel";
</script>

{#if game.view.type === "round"}
  <div class="fixed inset-0 flex flex-col">
    <div class="flex flex-auto items-center justify-center">
      <table class="text-4xl font-extralight">
        <thead>
          <tr>
            <th class="text-left text-xl">Name</th>
            <th class="text-center text-xl">Language</th>
            <th class="text-center text-xl">Tests</th>
            <th class="text-center text-xl">Time</th>
            <th class="text-right text-xl" colspan="2">Length</th>
            <th class="text-right text-xl" colspan="2">Score</th>
          </tr>
        </thead>
        <tbody>
          {#each game.view.results as row}
            <tr>
              <td class="pr-3">
                {row.nickname}
              </td>
              <td class="px-3 text-center">
                {row.language}
              </td>
              <td class="px-3 text-center">
                {row.score}
              </td>
              <td class="px-3 text-center">
                {row.duration.slice(3)}
              </td>
              <td class="pl-3 text-right opacity-50 text-[0.75em]">
                <s class:opacity-0={row.originalCount === row.adjustedCount}
                  >{Math.round(row.originalCount)}</s
                >
              </td>
              <td class="pl-4 text-right">
                {Math.round(row.adjustedCount)}
              </td>
              <td class="pl-6 text-right opacity-50 text-[0.75em]">
                <s class:opacity-0={row.baseScore === row.adjustedScore}
                  >{row.baseScore}</s
                >
              </td>
              <td class="pl-4 text-right">
                {row.adjustedScore}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
