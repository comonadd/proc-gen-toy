<script>
  import keyBy from "lodash/keyBy";
  import SimpleTab from "./SimpleTab.svelte";
  import CustomTab from "./CustomTab.svelte";
  import cn from "classnames";

  export const tabs = [
    { id: 1, text: "Simple" },
    { id: 2, text: "Custom" },
  ];

  const tabsById = keyBy(tabs, "id");

  // Or simply use document.location.pathname
  // if your app isn't sapper.
  export let path = document.location.pathname;

  export let current = 1;

  export let selectedTab = tabsById[current];
  export let selectedTabControl = selectedTab.controls;

  export const onTabClick = (tabId) => {
    current = tabId;
  };
</script>

<main class="flex flex-col h-screen w-screen overflow-x-hidden w-screen">
  <header class="header px-6 py-4 bg-stone-800 flex flex-row space-x-4">
    <div class="font-bold text-white">NoiseGen</div>
    <div class="flex-1" />
    <a href="https://github.com/comonadd" class="text-cyan-400 text-md"
      >GitHub</a
    >
    <a href="https://twitter.com/comonadd" class="text-cyan-400 text-md"
      >Twitter</a
    >
  </header>

  <div class="flex flex-row p-4 space-x-2">
    {#each tabs as tab (tab.id)}
      <div
        class={cn("px-4 py-1 border-b-4 ", {
          "border-black": current !== tab.id,
          "border-indigo-600": current === tab.id,
        })}
        on:click={() => onTabClick(tab.id)}
      >
        {tab.text}
      </div>
    {/each}
  </div>

  <div class="flex flex-row h-full box-border w-full flex-1">
    {#if current === 1}
      <SimpleTab />
    {:else if current === 2}
      <CustomTab />
    {/if}
  </div>
</main>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
