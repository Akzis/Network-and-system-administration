<script setup lang="ts">
useHead({
  title: 'Модуль 5 — Службы: Samba, NFS, Ansible, Docker, Web',
  meta: [
    {
      name: 'description',
      content:
        'Настройка служб стенда: учётные записи и группы Samba (AD), права NFS, Ansible (ansible.cfg и inventory), развёртывание Docker, веб-сайт на Apache и базе MariaDB.',
    },
  ],
})

const sections = [
  { id: 'samba', label: 'BR-SRV · Samba', icon: 'i-lucide-users' },
  { id: 'nfs', label: 'HQ-SRV · NFS', icon: 'i-lucide-hard-drive' },
  { id: 'ansible', label: 'BR-SRV · Ansible', icon: 'i-lucide-list-checks' },
  { id: 'docker', label: 'Настройка Docker', icon: 'i-lucide-container' },
  { id: 'br-cli', label: 'BR-CLI · проверка', icon: 'i-lucide-globe' },
  { id: 'apache', label: 'Apache · MariaDB', icon: 'i-lucide-database' },
]

const active = ref('samba')

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.value = e.target.id
      }
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
  )
  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
  onBeforeUnmount(() => observer.disconnect())
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// --- Команды (хранятся как константы) ---
const cSamba = `samba-tool user add hquser1 P@ssw0rd
samba-tool user add hquser2 P@ssw0rd
samba-tool user add hquser3 P@ssw0rd
samba-tool user add hquser4 P@ssw0rd
samba-tool user add hquser5 P@ssw0rd
samba-tool user add bruser1 P@ssw0rd
samba-tool user add bruser2 P@ssw0rd
samba-tool user add bruser3 P@ssw0rd
samba-tool user add bruser4 P@ssw0rd
samba-tool user add bruser5 P@ssw0rd
samba-tool group add hq
samba-tool group add br
samba-tool group addmembers hq hquser1
samba-tool group addmembers hq hquser2
samba-tool group addmembers hq hquser3
samba-tool group addmembers hq hquser4
samba-tool group addmembers hq hquser5
samba-tool group addmembers br bruser1
samba-tool group addmembers br bruser2
samba-tool group addmembers br bruser3
samba-tool group addmembers br bruser4
samba-tool group addmembers br bruser5
systemctl restart samba`

const cNfs = `chmod -R 777 /raid/nfs`

const cDocker = `cd /home/user
ls
mount -o loop,ro -t iso9660 /home/user/Additional.iso /mnt/
ls /mnt/`

const cApache = `mount -o ro -t iso9660 /home/user/Additional.iso /mnt/cd-rom/
ls -la /mnt/cd-rom/
cd /mnt/cd-rom/web/
ls
cp index.php /var/www/html/
cp logo.png /var/www/html/
ls /var/www/html
systemctl enable --now mariadb
mariadb -u root`
</script>

<template>
  <div class="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6">
    <!-- Sidebar -->
    <aside class="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 overflow-y-auto py-8 lg:block">
      <nav class="space-y-1">
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Содержание
        </p>
        <button
          v-for="(s, i) in sections"
          :key="s.id"
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition"
          :class="
            active === s.id
              ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
          "
          @click="scrollTo(s.id)"
        >
          <span class="text-xs tabular-nums text-zinc-400">{{ i + 1 }}</span>
          <span :class="s.icon" class="size-4" />
          <span>{{ s.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main -->
    <main class="min-w-0 flex-1 py-10">
      <!-- Hero -->
      <div class="mb-10">
        <p class="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span class="i-lucide-book-open size-3.5" /> Конспект-шпаргалка
        </p>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Службы стенда: Samba, NFS, Ansible, Docker, Web
        </h1>
        <div class="mt-4 max-w-3xl rounded-lg border-l-4 border-emerald-500 bg-emerald-50/60 p-4 text-zinc-600 dark:bg-emerald-500/5 dark:text-zinc-300">
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Аннотация</p>
          <p class="mt-1">
            Настройка прикладных служб стенда: создание учётных записей и групп
            пользователей в Samba (Active Directory) на BR-SRV, права доступа к NFS на
            HQ-SRV, конфигурация Ansible (файл <code>ansible.cfg</code> и инвентарь
            <code>hosts</code>), развёртывание контейнеров через Docker, проверка веб-сайта
            с BR-CLI и публикация сайта на Apache с базой данных MariaDB.
          </p>
        </div>

        <!-- Mobile nav -->
        <div class="mt-6 flex flex-wrap gap-2 lg:hidden">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
            @click="scrollTo(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- 1. BR-SRV — Samba -->
      <section :id="sections[0].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
          BR-SRV — пользователи и группы Samba
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          На <strong>BR-SRV</strong> создаём учётные записи доменных пользователей,
          группы <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">hq</code>
          и <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">br</code>,
          добавляем пользователей в группы и перезапускаем службу.
        </p>
        <CodeBlock title="BR-SRV · bash" :code="cSamba" />
      </section>

      <!-- 2. HQ-SRV — NFS -->
      <section :id="sections[1].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
          HQ-SRV — права доступа NFS
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          На <strong>HQ-SRV</strong> задаём права на каталог общего ресурса NFS.
        </p>
        <CodeBlock title="HQ-SRV · bash" :code="cNfs" />
        <Figure src="/images/m5_img1.png" caption="Установка прав на каталог /raid/nfs" />
      </section>

      <!-- 3. BR-SRV — Ansible -->
      <section :id="sections[2].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
          BR-SRV — настройка Ansible
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Устанавливаем Ansible на <strong>BR-SRV</strong>.
        </p>
        <Figure src="/images/m5_img2.png" caption="Установка Ansible" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.1. ansible.cfg</h3>
        <CodeBlock title="BR-SRV · bash" code="vim /etc/ansible/ansible.cfg" />
        <Figure src="/images/m5_img3.png" caption="Файл /etc/ansible/ansible.cfg" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.2. Инвентарь hosts</h3>
        <CodeBlock title="BR-SRV · bash" code="vim /etc/ansible/hosts" />
        <Figure src="/images/m5_img4.png" caption="Файл инвентаря /etc/ansible/hosts" />
      </section>

      <!-- 4. Docker -->
      <section :id="sections[3].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
          Настройка Docker
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Монтируем образ <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Additional.iso</code>
          и проверяем его содержимое (каталоги
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">docker</code>,
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">playbook</code>,
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">web</code> и
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Users.csv</code>).
        </p>
        <CodeBlock title="BR-SRV · bash" :code="cDocker" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Тип файловой системы образа — <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">iso9660</code>.
          Без указания типа монтирование завершается ошибкой
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">unknown filesystem type '9660'</code>.
        </p>
        <Figure src="/images/m5_img5.png" caption="Монтирование Additional.iso и просмотр содержимого" />
      </section>

      <!-- 5. BR-CLI — проверка -->
      <section :id="sections[4].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">5</span>
          BR-CLI — проверка веб-сайта
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          С <strong>BR-CLI</strong> проверяем, что сайт доступен по адресу
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">10.20.20.2:8080</code>.
        </p>
        <Figure src="/images/m5_img6.png" caption="Сайт доступен в браузере на BR-CLI" />
      </section>

      <!-- 6. Apache + MariaDB -->
      <section :id="sections[5].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">6</span>
          Apache и MariaDB
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Монтируем образ, копируем файлы сайта (<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">index.php</code>,
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">logo.png</code>)
          в каталог Apache <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/var/www/html</code>,
          включаем и запускаем MariaDB.
        </p>
        <CodeBlock title="HQ-SRV · bash" :code="cApache" />
        <Figure src="/images/m5_img7.png" caption="Монтирование образа и просмотр содержимого /mnt/cd-rom" />
        <Figure src="/images/m5_img8.png" caption="Копирование файлов сайта и запуск MariaDB" />
      </section>

      <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Службы стенда · конспект
      </footer>
    </main>
  </div>
</template>
