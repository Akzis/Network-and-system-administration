<script setup lang="ts">
useHead({
  title: 'Модуль 4 — Настройка устройств стенда',
  meta: [
    {
      name: 'description',
      content:
        'Пошаговая настройка устройств стенда: сеть BR-CLI, межсетевой экран Ideco (BR-FW), адресация серверов, маршруты, SSH, GRE-туннель, OSPF, NAT и DNS (bind).',
    },
  ],
})

const sections = [
  { id: 'br-cli', label: 'BR-CLI · сеть', icon: 'i-lucide-monitor' },
  { id: 'br-fw', label: 'BR-FW · Ideco', icon: 'i-lucide-shield' },
  { id: 'srv-ip', label: 'Серверы · сеть', icon: 'i-lucide-server' },
  { id: 'routes', label: 'Маршруты по умолчанию', icon: 'i-lucide-route' },
  { id: 'ssh', label: 'Настройка SSH', icon: 'i-lucide-key-round' },
  { id: 'gre', label: 'GRE туннель', icon: 'i-lucide-cable' },
  { id: 'ospf', label: 'Настройка OSPF', icon: 'i-lucide-share-2' },
  { id: 'nat', label: 'Настройка NAT', icon: 'i-lucide-shuffle' },
  { id: 'dns', label: 'DNS (bind)', icon: 'i-lucide-globe' },
]

const active = ref('br-cli')

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
const cBrCli = `vim /etc/net/ifaces/ens3/options
TYPE=eth
BOOTPROTO=static

vim /etc/net/ifaces/ens3/ipv4address
10.20.30.2/30

vim /etc/net/ifaces/ens3/ipv4route
default via 10.20.30.1`

const cHqSrvIp = `vim /etc/net/ifaces/ens3/ipv4address
10.10.100.2/27

vim /etc/net/ifaces/ens3/ipv4route
default via 10.10.100.1

system restart network`

const cBrSrvIp = `vim /etc/net/ifaces/ens3/ipv4address
10.20.20.2/28

vim /etc/net/ifaces/ens3/ipv4route
default via 10.20.20.1

system restart network`

const cHqRtrRoute = `ip route 0.0.0.0/0 172.16.1.1`
const cBrRtrRoute = `ip route 0.0.0.0/0 172.16.2.1`

const cSsh = `vim /etc/openssh/sshd_config
MaxAuthTries 2
Banner /etc/openssh/banner

vim /etc/openssh/banner
Authorized access only

systemctl restart sshd`

const cHqRtrGre = `int tunnel.0
description «GRE»
ip address 10.10.10.1/30
ip tunnel 172.16.1.2 172.16.2.2 mode gre`

const cBrRtrGre = `int tunnel.0
description «GRE»
ip address 10.10.10.2/30
ip tunnel 172.16.2.2 172.16.1.2 mode gre`

const cHqRtrOspf = `router ospf 1
ospf router-id 10.10.10.1
passive-interface default
no passive-interface tunnel.0
network 10.10.100.0/27 area 0
network 10.10.200.0/28 area 0
network 10.10.30.0/29 area 0
network 10.10.10.0/30 area 0
exit
interface tunnel.0
ip ospf authentication message-digest
ip ospf message-digest-key 1 md 5 P@ssw0rd
exit
write memory`

const cBrRtrOspf = `router ospf 1
ospf router-id 10.10.10.2
passive-interface default
no passive-interface tunnel.0
no passive-interface fw
network 10.10.10.0/30 area 0
network 10.20.10.1/30 area 0
exit
interface tunnel.0
ip ospf authentication message-digest
ip ospf message-digest-key 1 md 5 P@ssw0rd
exit
interface fw
ip ospf authentication message-digest
ip ospf message-digest-key 1 md 5 P@ssw0rd
exit
write memory`

const cIspNat = `iptables -t nat -A POSTROUTING -s 172.16.1.0/28 -o ens3 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 172.16.2.0/28 -o ens3 -j MASQUERADE
iptables-save >> /etc/sysconfig/iptables
systemctl enable --now iptables
systemctl restart network`

const cBrRtrNat = `int isp
ip nat outside
exit
int fw
ip nat inside
exit
ip nat pool INTERNET 10.20.10.1-10.20.10.2,10.20.20.1-10.20.20.14,10.20.30.1-10.20.30.6
ip nat sourse dynamic inside-to-outside pool INTERNET overload interface isp
exit
write memory`

const cHqRtrNat = `int isp
ip nat outside
exit
int vl100
ip nat inside
exit
int vl200
ip nat inside
int vl999
ip nat inside
ip nat pool INTERNET 10.10.100.1-10.10.100.30,10.10.200.1-10.10.200.14,10.10.30.1-10.10.30.6
ip nat sourse dynamic inside-to-outside pool INTERNET overload interface isp
exit
write memory`
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
          Пошаговая настройка устройств стенда
        </h1>
        <div class="mt-4 max-w-3xl rounded-lg border-l-4 border-emerald-500 bg-emerald-50/60 p-4 text-zinc-600 dark:bg-emerald-500/5 dark:text-zinc-300">
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Аннотация</p>
          <p class="mt-1">
            Практический сценарий настройки устройств стенда «по порядку»: адресация
            BR-CLI, межсетевой экран Ideco (BR-FW), сеть серверов HQ-SRV и BR-SRV,
            маршруты по умолчанию, SSH, GRE-туннель и OSPF между HQ-RTR и BR-RTR,
            трансляция адресов (NAT) на ISP/HQ-RTR/BR-RTR и настройка DNS-сервера (bind).
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

      <!-- 1. BR-CLI -->
      <section :id="sections[0].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
          BR-CLI — настройка сети
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Задаём тип интерфейса, статический адрес и маршрут по умолчанию для клиентской
          машины филиала.
        </p>
        <CodeBlock title="BR-CLI · bash" :code="cBrCli" />
      </section>

      <!-- 2. BR-FW (Ideco) -->
      <section :id="sections[1].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
          BR-FW — межсетевой экран Ideco
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          На <strong>BR-CLI</strong> в Firefox ввести
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">10.20.30.1:8443</code>
          (далее логинимся в веб-интерфейс Ideco).
        </p>
        <ul class="mt-3 space-y-2">
          <li v-for="(item, i) in [
            'В боковой панели слева поменять название: br-fw.au-team.irpo.',
            'На панели мониторинга пролистать вниз и выключить все тумблеры.',
            'Далее в правилах трафика перейти в SNAT и выключить тумблер.',
          ]" :key="i" class="flex gap-3 text-zinc-600 dark:text-zinc-300">
            <span class="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- 3. HQ-SRV / BR-SRV — сеть -->
      <section :id="sections[2].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
          HQ-SRV и BR-SRV — настройка сети
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.1. HQ-SRV</h3>
        <CodeBlock title="HQ-SRV · bash" :code="cHqSrvIp" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.2. BR-SRV</h3>
        <CodeBlock title="BR-SRV · bash" :code="cBrSrvIp" />
      </section>

      <!-- 4. Маршруты по умолчанию -->
      <section :id="sections[3].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
          HQ-RTR и BR-RTR — маршруты по умолчанию
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.1. HQ-RTR</h3>
        <CodeBlock title="EcoRouter CLI — HQ-RTR" :code="cHqRtrRoute" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.2. BR-RTR</h3>
        <CodeBlock title="EcoRouter CLI — BR-RTR" :code="cBrRtrRoute" />
      </section>

      <!-- 5. SSH -->
      <section :id="sections[4].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">5</span>
          Настройка SSH (HQ-SRV и BR-SRV)
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Ограничиваем число попыток входа, настраиваем баннер и перезапускаем службу.
          Выполняется одинаково на обоих серверах.
        </p>
        <CodeBlock title="bash" :code="cSsh" />
      </section>

      <!-- 6. GRE -->
      <section :id="sections[5].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">6</span>
          GRE туннель (HQ-RTR ↔ BR-RTR)
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.1. HQ-RTR</h3>
        <CodeBlock title="EcoRouter CLI — HQ-RTR" :code="cHqRtrGre" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.2. BR-RTR</h3>
        <CodeBlock title="EcoRouter CLI — BR-RTR" :code="cBrRtrGre" />
      </section>

      <!-- 7. OSPF -->
      <section :id="sections[6].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">7</span>
          Настройка OSPF
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">7.1. HQ-RTR</h3>
        <CodeBlock title="EcoRouter CLI — HQ-RTR" :code="cHqRtrOspf" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">7.2. BR-RTR</h3>
        <CodeBlock title="EcoRouter CLI — BR-RTR" :code="cBrRtrOspf" />
      </section>

      <!-- 8. NAT -->
      <section :id="sections[7].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">8</span>
          Настройка NAT
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.1. ISP</h3>
        <CodeBlock title="ISP · bash" :code="cIspNat" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.2. BR-RTR</h3>
        <CodeBlock title="EcoRouter CLI — BR-RTR" :code="cBrRtrNat" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.3. HQ-RTR</h3>
        <CodeBlock title="EcoRouter CLI — HQ-RTR" :code="cHqRtrNat" />
      </section>

      <!-- 9. DNS (bind) -->
      <section :id="sections[8].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">9</span>
          Настройка DNS (bind)
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.1. HQ-SRV — прямая зона</h3>
        <CodeBlock title="HQ-SRV · bash" code="vim /etc/bind/zone/au-team.irpo.zone" />
        <Figure src="/images/m4_img1.png" caption="Файл прямой зоны au-team.irpo.zone" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.2. HQ-SRV — обратная зона</h3>
        <CodeBlock title="HQ-SRV · bash" code="vim /etc/bind/zone/10.10.in-addr.arpa" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Там где <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">NSi</code>
          — «<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">i</code>»
          нужно стереть, чтобы строчка не была красной.
        </p>
        <Figure src="/images/m4_img2.png" caption="Файл обратной зоны 10.10.in-addr.arpa" />
        <CodeBlock title="HQ-SRV · bash" code="systemctl restart bind" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.3. HQ-SRV — options.conf</h3>
        <CodeBlock title="HQ-SRV · bash" code="vim /etc/bind/options.conf" />
        <Figure src="/images/m4_img3.png" caption="Файл /etc/bind/options.conf" />
        <Figure src="/images/m4_img4.png" caption="Файл /etc/bind/options.conf (продолжение)" />
        <CodeBlock title="HQ-SRV · bash" code="systemctl restart network" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.4. HQ-SRV — resolv.conf</h3>
        <CodeBlock title="HQ-SRV · bash" code="vim /etc/net/ifaces/ens3/resolv.conf" />
        <Figure src="/images/m4_img5.png" caption="Файл /etc/net/ifaces/ens3/resolv.conf на HQ-SRV" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.5. HQ-SRV — rfc1912.conf</h3>
        <CodeBlock title="HQ-SRV · bash" code="vim /etc/bind/rfc1912.conf" />
        <Figure src="/images/m4_img6.png" caption="Файл /etc/bind/rfc1912.conf" />
        <CodeBlock
          title="HQ-SRV · bash"
          :code="`systemctl restart bind\nsystemctl enable --now bind`"
        />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.6. BR-SRV — resolv.conf</h3>
        <CodeBlock title="BR-SRV · bash" code="vim /etc/net/ifaces/ens3/resolv.conf" />
        <Figure src="/images/m4_img7.png" caption="Файл /etc/net/ifaces/ens3/resolv.conf на BR-SRV" />
        <CodeBlock title="BR-SRV · bash" code="systemctl restart network" />
      </section>

      <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Настройка устройств стенда · конспект
      </footer>
    </main>
  </div>
</template>
