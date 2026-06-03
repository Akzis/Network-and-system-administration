<script setup lang="ts">
const modules = [
  { to: '/', label: 'Модуль 1', sub: 'Настройка сети и системы' },
  { to: '/module-2', label: 'Модуль 2', sub: 'Корпоративная ИТ-инфраструктура' },
  { to: '/module-3', label: 'Модуль 3', sub: 'Практические аспекты администрирования' },
]

const route = useRoute()
function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const colorMode = useColorMode()
function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
    <header
      class="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <span class="i-lucide-terminal size-5" />
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-semibold leading-tight">Сетевое и системное администрирование</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Конспект по модулям</p>
          </div>
        </div>

        <nav class="flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          <NuxtLink
            v-for="m in modules"
            :key="m.to"
            :to="m.to"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="
              isActive(m.to)
                ? 'bg-emerald-500 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            "
          >
            {{ m.label }}
          </NuxtLink>
        </nav>

        <button
          type="button"
          class="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Переключить тему"
          @click="toggleTheme"
        >
          <span class="size-5 i-lucide-sun dark:i-lucide-moon" />
        </button>
      </div>
    </header>

    <slot />
  </div>
</template>
