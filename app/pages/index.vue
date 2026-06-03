<script setup lang="ts">
useHead({
  title: 'Модуль 1 — Сетевое и системное администрирование',
  meta: [
    {
      name: 'description',
      content:
        'Конспект по настройке сети и системному администрированию: хост, IPv4, пользователи, OVS, SSH, GRE, OSPF, NAT, DHCP, NTP.',
    },
  ],
})

const sections = [
  { id: 'host', label: 'Настройка хоста', icon: 'i-lucide-server' },
  { id: 'ipv4', label: 'Настройка IPv4', icon: 'i-lucide-network' },
  { id: 'user', label: 'Настройка пользователя', icon: 'i-lucide-user-cog' },
  { id: 'switch', label: 'Коммутатор (OVS)', icon: 'i-lucide-git-fork' },
  { id: 'ssh', label: 'Настройка SSH', icon: 'i-lucide-key-round' },
  { id: 'gre', label: 'GRE туннель', icon: 'i-lucide-cable' },
  { id: 'ospf', label: 'Настройка OSPF', icon: 'i-lucide-route' },
  { id: 'nat', label: 'Настройка NAT', icon: 'i-lucide-shuffle' },
  { id: 'dhcp', label: 'DHCP (nmcli)', icon: 'i-lucide-wifi' },
  { id: 'ntp', label: 'Часовой пояс', icon: 'i-lucide-clock' },
]

const active = ref('host')

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
            <span class="i-lucide-book-open size-3.5" /> Конспект / шпаргалка
          </p>
          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
            Настройка сети и системы
          </h1>
          <p class="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
            Пошаговое руководство по базовой настройке инфраструктуры: хост, адресация
            IPv4, пользователи, коммутация OVS, SSH, GRE-туннели, OSPF, NAT, DHCP и
            синхронизация времени. Команды для Linux (ALT/RHEL-семейство) и роутеров
            EcoRouter.
          </p>

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

        <!-- 1. Настройка хоста -->
        <section :id="sections[0].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
            Настройка хоста
          </h2>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Linux</h3>
          <CodeBlock title="bash" :code='`Hostnamectl set-hostname "имя хоста"; exec bash`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Имя хоста заполняется в формате <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">имя_хоста.домен</code>
            (например <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">isp.ledi-gaga.com</code>).
          </p>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверить:</p>
          <CodeBlock title="bash" code="hostname -f" />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">EcoRouter</h3>
          <CodeBlock
            title="EcoRouter CLI"
            :code='`hostname "имя хоста"\nip domain-name "домен"`'
          />
        </section>

        <!-- 2. Настройка IPv4 -->
        <section :id="sections[1].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
            Настройка IPv4
          </h2>
          <p class="mt-4 text-zinc-600 dark:text-zinc-300">
            На всех устройствах необходимо сконфигурировать IPv4:
          </p>
          <ul class="mt-3 space-y-2">
            <li v-for="(item, i) in [
              'Локальная сеть в сторону VLAN 100 — необходимо выделить сеть размером не более 32 адресов из адресного пространства 10.10.100.0/27.',
              'Локальная сеть в сторону VLAN 200 — необходимо выделить сеть размером не более 16 адресов из адресного пространства 10.10.200.0/28.',
              'Локальная сеть для управления VLAN 999 — необходимо выделить сеть размером не более 8 адресов из адресного пространства 10.10.30.0/29.',
              'В локальной сети в сторону сервера — необходимо выделить сеть размером не более 16 адресов из адресного пространства 10.20.20.0/28.',
              'В локальной сети в сторону компьютера — необходимо выделить сеть размером не более 8 адресов из адресного пространства 10.20.30.0/29.',
            ]" :key="i" class="flex gap-3 text-zinc-600 dark:text-zinc-300">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{{ item }}</span>
            </li>
          </ul>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Linux</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверить адреса интерфейсов:</p>
          <CodeBlock title="bash" code="ip -br a" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Основные директории для редактирования конфигурации интерфейса:
          </p>
          <CodeBlock code="/etc/net/ifaces/ensX/options" />
          <Figure src="/images/img1.jpeg" caption="Пример содержимого файла options" />
          <ul class="mt-3 space-y-2 text-zinc-600 dark:text-zinc-300">
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Type</code> — тип подключения.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Config wireless</code> — конфигурировать ли беспроводную сеть.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Bootproto</code> — использование статического адреса или dhcp.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Config_ipv4</code> — конфигурировать ли ipv4.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Disabled</code> — отключен интерфейс или нет.</li>
          </ul>
          <p class="mt-3 text-zinc-600 dark:text-zinc-300">
            В <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/net/ifaces/ensX/ipv4address</code>
            содержится адрес интерфейса в формате:
          </p>
          <CodeBlock code="172.16.1.1/28    # ip address / маска подсети" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            После внесения изменений в конфигурацию сети, чтобы изменения вступили в силу,
            необходимо перезапустить службу <strong>network</strong>:
          </p>
          <CodeBlock title="bash" code="systemctl restart network" />
        </section>

        <!-- 3. Настройка пользователя -->
        <section :id="sections[2].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
            Настройка пользователя
          </h2>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Linux</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Перед тем как редактировать или добавлять пользователя, необходимо проверить,
            существует ли он:
          </p>
          <CodeBlock title="bash" code="cat /etc/psswd | grep hahauser" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Для того чтобы добавить пользователя, необходимо ввести следующую команду:
          </p>
          <CodeBlock title="bash" :code='`useradd -u 2026 hahauser\nuseradd -u идентификатор_пользователя имя_пользователя`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Для того чтобы поменять или назначить пароль пользователю:
          </p>
          <CodeBlock title="bash" :code='`passwd hahauser\npasswd имя_пользователя`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Для того чтобы проверить идентификатор пользователя:
          </p>
          <CodeBlock title="bash" :code='`id sshuser -u\nid имя_пользователя -u`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Чтобы добавить пользователя в группу суперпользователей:
          </p>
          <CodeBlock title="bash" :code='`usermod -aG wheel hahauser\nusermod -aG wheel имя_пользователя`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Для того чтобы проверить, может ли пользователь пользоваться sudo без ввода
            пароля, следует сначала проверить файл по следующей директории:
          </p>
          <CodeBlock title="bash" code="cat /etc/sudoers | grep hahauser" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Если его там нет, проверить следующую директорию:
          </p>
          <CodeBlock title="bash" :code='`ls /etc/sudoers.d/\nls /etc/sudoers.d/ | grep hahauser`' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            И проверить содержимое файла, если он там есть:
          </p>
          <CodeBlock title="bash" code="cat /etc/sudoers.d/hahauser" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Пример вывода:</p>
          <CodeBlock code="hahauser ALL=(ALL) NOPSSWD: ALL" />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">EcoRouter</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Чтобы проверить список созданных пользователей:
          </p>
          <CodeBlock title="EcoRouter CLI" code="show users localdb" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Если пользователя нет, можно создать следующими командами.
          </p>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Создание пользователя:</p>
          <CodeBlock title="EcoRouter CLI" code="Router_a(config)#username haha_root" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Назначение пароля пользователю:</p>
          <CodeBlock title="EcoRouter CLI" code="Router_a(config-user)#password Pa$$w0rd" />
        </section>

        <!-- 4. Коммутатор OVS -->
        <section :id="sections[3].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
            Настройка коммутатора через утилиту OVS
          </h2>
          <p class="mt-4 text-zinc-600 dark:text-zinc-300">
            Чтобы посмотреть, что настроено на коммутаторе, нужно ввести команду:
          </p>
          <CodeBlock title="bash" code="ovs-vsctl show" />
          <ul class="mt-3 space-y-2 text-zinc-600 dark:text-zinc-300">
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Port</code> — физический порт.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Tag</code> — какому VLAN принадлежит порт.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Interface</code> — логический интерфейс.</li>
            <li><code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">Type</code> — тип интерфейса, указывается, если он логический.</li>
          </ul>
          <p class="mt-3 text-zinc-600 dark:text-zinc-300">
            Чтобы добавить мост, необходимо вписать команду:
          </p>
          <CodeBlock title="bash" code='ovs-vsctl add-br "название моста"' />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Для того чтобы добавить порт к мосту:
          </p>
          <CodeBlock
            title="bash"
            :code='`ovs-vsctl add-port "название_моста" "название_порта"\novs-vsctl add-port "название_моста" "название_порта" tag="влан_тег"`'
          />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            По аналогии вы также добавляете всё остальное.
          </p>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Также необходимо проверить интерфейс менеджмента (MGMT) по пути
            <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/net/ifaces/MGMT/options</code>,
            адрес <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/net/ifaces/MGMT/ipv4address</code>
            и маршрут по умолчанию <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/net/ifaces/MGMT/ipv4route</code>.
          </p>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            <Figure src="/images/img2.jpeg" caption="MGMT / options" />
            <Figure src="/images/img3.jpeg" caption="MGMT / ipv4address" />
            <Figure src="/images/img4.jpeg" caption="MGMT / ipv4route" />
          </div>
        </section>

        <!-- 5. SSH -->
        <section :id="sections[4].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">5</span>
            Настройка SSH
          </h2>
          <p class="mt-4 text-zinc-600 dark:text-zinc-300">
            Для настройки конфига необходимо перейти в директорию:
          </p>
          <CodeBlock code="/etc/openssh/sshd_config" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Чтобы ограничить количество попыток, необходимо найти следующий параметр и
            указать кол-во попыток:
          </p>
          <CodeBlock code="MaxAuthTries 2" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Чтобы настроить баннер, необходимо найти или ввести в документ следующую
            строку, указав путь до баннера:
          </p>
          <CodeBlock code="Banner /etc/openssh/banner" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Путь может быть любым, но должен быть абсолютным. Затем создаём файл с
            необходимой надписью внутри него:
          </p>
          <CodeBlock title="bash" code="vim /etc/openssh/banner" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">После чего перезапускаем службу:</p>
          <CodeBlock title="bash" code="systemctl restart sshd" />
        </section>

        <!-- 6. GRE -->
        <section :id="sections[5].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">6</span>
            Настройка GRE туннеля
          </h2>
          <p class="mt-4 text-zinc-600 dark:text-zinc-300">Router-a (с комментариями):</p>
          <CodeBlock
            title="EcoRouter CLI — Router-a"
            :code='`router-a(config)#interface tunnel.0                       # создаём интерфейс\nrouter-a(config-if-tunnel)#description "GRE"               # даём название интерфейсу\nrouter-a(config-if-tunnel)#ip address 10.10.10.1/30        # назначаем адрес интерфейсу\nrouter-a(config-if-tunnel)#ip tunnel 172.16.1.2 172.16.2.2 mode gre\n# адреса роутера, из которого идёт трафик, и в который мы будем посылать трафик`'
          />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Аналогично делаем на другом роутере:</p>
          <CodeBlock
            title="EcoRouter CLI — Router-b"
            :code='`router-b(config)#interface tunnel.0\nrouter-b(config-if-tunnel)#description "GRE"\nrouter-b(config-if-tunnel)#ip address 10.10.10.2/30\nrouter-b(config-if-tunnel)#ip tunnel 172.16.2.2 172.16.1.2 mode gre\nrouter-b(config-if-tunnel)#exit\nrouter-b(config)#write memory`'
          />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Также не забудьте поставить маршрут по умолчанию:
          </p>
          <CodeBlock
            title="EcoRouter CLI"
            :code='`router-b(config)#ip route 0.0.0.0/0 172.16.2.1\nrouter-a(config)#ip route 0.0.0.0/0 172.16.1.1`'
          />
        </section>

        <!-- 7. OSPF -->
        <section :id="sections[6].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">7</span>
            Настройка OSPF
          </h2>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Firewall</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            В левом столбце выбираем <strong>Маршрутизация → OSPF</strong>:
          </p>
          <Figure src="/images/img5.jpeg" caption="Меню: Маршрутизация → OSPF" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            В основных задаём параметры аутентификации соседей:
          </p>
          <Figure src="/images/img6.jpeg" caption="Параметры аутентификации соседей" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Добавляем локальный интерфейс:</p>
          <Figure src="/images/img7.jpeg" caption="Добавление локального интерфейса" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">
            Перейдя в дополнительные настройки, смотрим, чтобы всё было проставлено как на
            скриншоте.
          </p>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Router-a</h3>
          <CodeBlock
            title="EcoRouter CLI — Router-a"
            :code='`Router-a(config)#router ospf 1\nRouter-a(config-router)#ospf router-id 10.10.10.1\nRouter-a(config-router)#passive-interface default\nRouter-a(config-router)#no passive-interface tunnel.0\nRouter-a(config-router)#network 10.10.100.0/27 area 0\nRouter-a(config-router)#network 10.10.200.0/28 area 0\nRouter-a(config-router)#network 10.10.30.0/29 area 0\nRouter-a(config-router)#network 10.10.10.0/30 area 0\nRouter-a(config-router)#exit\nRouter-a(config-router)#interface tunnel.0\nRouter-a(config-if-tunnel)#ip ospf authentication message-digest\nRouter-a(config-if-tunnel)#ip ospf message-digest-key 1 md5 P@ssw0rd`'
          />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Router-b</h3>
          <CodeBlock
            title="EcoRouter CLI — Router-b"
            :code='`Router-b(config)#router ospf 1\nRouter-b(config-router)#ospf router-id 10.10.10.2\nRouter-b(config-router)#passive-interface default\nRouter-b(config-router)#no passive-interface tunnel.0\nRouter-b(config-router)#no passive-interface fw\nRouter-b(config-router)#network 10.10.10.0/30 area 0\nRouter-b(config-router)#network 10.20.10.1/30 area 0\nRouter-b(config-router)#exit\nRouter-b(config)#interface tunnel.0\nRouter-b(config-if-tunnel)#ip ospf authentication message-digest\nRouter-b(config-if-tunnel)#ip ospf message-digest-key 1 md5 P@ssw0rd\nRouter-b(config)#exit\nRouter-b(config)#interface fw\nRouter-b(config-if)#ip ospf authentication message-digest\nRouter-b(config-if)#ip ospf message-digest-key 1 md5 P@ssw0rd`'
          />
        </section>

        <!-- 8. NAT -->
        <section :id="sections[7].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">8</span>
            Настройка NAT
          </h2>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">ISP</h3>
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверяем переадресацию:</p>
          <CodeBlock
            title="bash"
            :code='`[root@isp ~]# sysctl -a | grep ip_forward\nnet.ipv4.ip_forward = 1\nnet.ipv4.ip_forward_update_priority = 1\nnet.ipv4.ip_forward_use_pmtu = 0`'
          />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Настраиваем NAT с помощью iptables:</p>
          <CodeBlock
            title="bash"
            :code='`[root@isp ~]# iptables -t nat -A POSTROUTING -s 172.16.1.0/28 -o ens3 -j MASQUERADE\n[root@isp ~]# iptables -t nat -A POSTROUTING -s 172.16.2.0/28 -o ens3 -j MASQUERADE`'
          />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Сохраняем конфигурацию:</p>
          <CodeBlock title="bash" code="[root@isp ~]# iptables-save >> /etc/sysconfig/iptables" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Активируем службу:</p>
          <CodeBlock title="bash" code="[root@isp ~]# systemctl enable --now iptables" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Перезапускаем службу:</p>
          <CodeBlock title="bash" code="[root@isp ~]# systemctl restart network" />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Router-a</h3>
          <CodeBlock
            title="EcoRouter CLI — Router-a"
            :code='`Router-a(config)#interface isp\nRouter-a(config-if)#ip nat outside\nRouter-a(config-if)#ex\nRouter-a(config)#interface vl100\nRouter-a(config-if)#ip nat inside\nRouter-a(config-if)#ex\nRouter-a(config)#interface vl200\nRouter-a(config-if)#ip nat inside\nRouter-a(config-if)#ex\nRouter-a(config)#interface vl999\nRouter-a(config-if)#ip nat inside\nRouter-a(config)#ip nat pool INTERNET 10.10.100.1-10.10.100.32,10.10.200.1-10.10.200.16,10.10.30.1-10.10.30.8\nRouter-a(config)#ip nat source dynamic inside-to-outside pool INTERNET overload interface isp`'
          />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Router-b</h3>
          <CodeBlock
            title="EcoRouter CLI — Router-b"
            :code='`Router-b(config)#interface isp\nRouter-b(config-if)#ip nat outside\nRouter-b(config)#interface fw\nRouter-b(config-if)#ip nat inside\nRouter-b(config)#ip nat pool INTERNET 10.20.10.1-10.20.10.2,10.20.20.1-10.20.20.14,10.20.30.1-10.20.30.6\nRouter-b(config)#ip nat source dynamic inside-to-outside pool INTERNET overload interface isp`'
          />
        </section>

        <!-- 9. DHCP -->
        <section :id="sections[8].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">9</span>
            Настройка DHCP с помощью nmcli
          </h2>
          <p class="mt-4 text-zinc-600 dark:text-zinc-300">Смотрим наши подключения:</p>
          <CodeBlock title="bash" code="nmcli connection show" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">Удаляем подключение:</p>
          <CodeBlock title="bash" code="[root@cli ~]# nmcli connection delete uuid b311a571-ca77-37d3-8f68-50e9e4b2a577" />
          <p class="mt-2 text-zinc-600 dark:text-zinc-300">И добавляем новое:</p>
          <CodeBlock
            title="bash"
            code="[root@cli ~]# nmcli connection add ifname ens3 type ethernet autoconnect yes con-name dhcp ipv4.method auto"
          />
        </section>

        <!-- 10. NTP / Часовой пояс -->
        <section :id="sections[9].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 class="flex items-center gap-3 text-2xl font-bold">
            <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">10</span>
            Настройка часового пояса
          </h2>

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">EcoRouter</h3>
          <CodeBlock
            title="EcoRouter CLI"
            :code='`Router_a(config)#ntp timezone utc+3\nrouter_a(config)#do show ntp timezone\nSystem Time zone: Europe/Moscow\nRouter_a(config)#`'
          />

          <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Linux</h3>
          <CodeBlock
            title="bash"
            :code='`timedatectl\n[root@srv ~]# timedatectl set-timezone Europe/Moscow`'
          />
        </section>

        <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
          Модуль 1 · Сетевое и системное администрирование · конспект
        </footer>
      </main>
  </div>
</template>
