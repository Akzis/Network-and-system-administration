<script setup lang="ts">
const props = defineProps<{
  code: string
  title?: string
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <div class="group relative my-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70">
    <div
      v-if="title"
      class="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400"
    >
      <span class="i-lucide-terminal size-3.5" />
      {{ title }}
    </div>
    <button
      type="button"
      class="absolute right-2 top-2 z-10 rounded-md border border-zinc-300 bg-white/80 px-2 py-1 text-xs text-zinc-600 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:text-emerald-400"
      :class="{ 'top-9': title }"
      @click="copy"
    >
      {{ copied ? '✓ Скопировано' : 'Копировать' }}
    </button>
    <pre class="overflow-x-auto p-4 text-[13px] leading-relaxed"><code class="font-mono text-zinc-800 dark:text-zinc-100">{{ code }}</code></pre>
  </div>
</template>
