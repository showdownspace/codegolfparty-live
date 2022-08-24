<script lang="ts">
  export let title: string;
  export let src: string;
</script>

<div>
  {title}
  <div class="w-[480px] h-[270px] border border-slate-500 overflow-hidden">
    <iframe
      {src}
      width={1920}
      height={1080}
      class="block origin-top-left"
      style="transform: scale(0.25)"
      title={src}
    />
  </div>
</div>
