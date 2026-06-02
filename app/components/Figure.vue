<script setup lang="ts">
defineProps<{
  src: string
  caption?: string
}>()
</script>

<template>
  <figure class="my-4">
    <div class="inline-block overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <img :src="src" :alt="caption || ''" class="max-w-full rounded" loading="lazy">
    </div>
    <figcaption v-if="caption" class="mt-2 text-sm italic text-zinc-500 dark:text-zinc-400">
      {{ caption }}
    </figcaption>
  </figure>
</template>
