<script setup lang="ts">
useHead({
  title: 'Модуль 3 — Практические аспекты администрирования',
  meta: [
    {
      name: 'description',
      content:
        'Практические аспекты администрирования корпоративной инфраструктуры: импорт пользователей из CSV, SSL/TLS на ГОСТ, IPsec VPN, межсетевой экран, CUPS, rsyslog, Ansible, защита SSH (fail2ban) и резервное копирование CyberBackup.',
    },
  ],
})

const sections = [
  { id: 'csv', label: 'Импорт пользователей (CSV)', icon: 'i-lucide-users' },
  { id: 'ssl', label: 'SSL/TLS с ГОСТ', icon: 'i-lucide-shield-check' },
  { id: 'ipsec', label: 'IPsec VPN', icon: 'i-lucide-cable' },
  { id: 'firewall', label: 'Межсетевой экран', icon: 'i-lucide-shield' },
  { id: 'cups', label: 'Печать (CUPS)', icon: 'i-lucide-printer' },
  { id: 'rsyslog', label: 'Логирование', icon: 'i-lucide-scroll-text' },
  { id: 'ansible', label: 'Ansible playbook', icon: 'i-lucide-settings-2' },
  { id: 'ssh', label: 'Защита SSH (fail2ban)', icon: 'i-lucide-shield-alert' },
  { id: 'backup', label: 'Резервное копирование', icon: 'i-lucide-database-backup' },
]

const active = ref('csv')

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

// --- Команды (хранятся как константы из-за смешанных кавычек) ---

// 1. CSV
const cCsvPrep = `# Удаление некорректных символов и кодировка
iconv -f UTF-8 -t UTF-8//IGNORE Users.csv > /home/user/Users_fixed.csv
# Проверка содержимого
head -n1 /home/user/Users_fixed.csv
wc -l /home/user/Users_fixed.csv`

const cCsvImport = `#!/bin/bash
csv_file="$1"
# Извлечение уникальных подразделений (OU)
awk -F":" 'NR>1 {print $5}' "$csv_file" | sort -u | while read ou;
do
    samba-tool ou add OU="$ou",DC=au-team,DC=irpo
done

# Создание пользователей
while IFS=";" read -r first_name last_name role phone ou street zip city country password; do
    # Пропуск заголовка
    if [ "$first_name" == "First Name" ]; then
        continue
    fi

    # Формирование имени пользователя
    username="\${first_name,,}.\${last_name,,}"

    # Создание учетной записи
    samba-tool user add "$username" "P@ssw0rd1" \\
        --given-name="$first_name" \\
        --surname="$last_name" \\
        --telephone-number="$phone" \\
        --job-title="$role" \\
        --userou="OU=$ou"

    # Установка бессрочного пароля
    samba-tool user setexpiry "$username" --noexpiry
done < "$csv_file"`

const cCsvRun = `chmod +x import_user.sh
bash import_user.sh Users_fixed.csv`

// 2. SSL/TLS ГОСТ
const cSslServer = `# Установка необходимых пакетов
apt-get install -y openssl-gost-engine
# Включение движка ГОСТ
systemctl enable openssl-gost
# Генерация закрытого ключа CA
openssl genpkey -algorithm gost2012_256 -pkeyopt paramset:TCB -out ca.key
# Создание самоподписанного сертификата CA
openssl req -new -x509 -md_gost12_256 -days 30 -key ca.key -out ca.cer
# Копирование сертификата на клиент
scp ca.cer user@hq-cli.au-team.irpo:/home/user/`

const cSslClient = `# Добавление сертификата в доверенные
cp /home/user/ca.cer /etc/pki/ca-trust/source/anchors/
update-ca-trust

# Установка CryptoPro
cd /home/user/Загрузки/linux-amd64
apt-get install -y cryptopro-preinstall
./install_gui.sh`

const cSslCerts = `# Генерация ключей
openssl genpkey -algorithm gost2012_256 -pkeyopt paramset:A -out web.au-team.irpo.key
openssl genpkey -algorithm gost2012_256 -pkeyopt paramset:A -out docker.au-team.irpo.key

# Создание запросов на подпись (CSR)
openssl req -new -md_gost12_256 -key web.au-team.irpo.key -out web.au-team.irpo.csr
openssl req -new -md_gost12_256 -key docker.au-team.irpo.key -out docker.au-team.irpo.csr

# Подписание сертификатов
openssl x509 -req -in web.au-team.irpo.csr -CA ca.cer -CAkey ca.key \\
    -CAcreateserial -out web.au-team.irpo.cer -days 30

openssl x509 -req -in docker.au-team.irpo.csr -CA ca.cer -CAkey ca.key \\
    -CAcreateserial -out docker.au-team.irpo.cer -days 30

# Копирование на веб-сервер
scp web.au-team.irpo.key root@172.16.1.1:~/
scp web.au-team.irpo.cer root@172.16.1.1:~/
scp docker.au-team.irpo.key root@172.16.1.1:~/
scp docker.au-team.irpo.cer root@172.16.1.1:~/`

const cSslNginxCmd = `# Создание директории для SSL
mkdir /etc/nginx/ssl
cp web.au-team.irpo.* /etc/nginx/ssl/
cp docker.au-team.irpo.* /etc/nginx/ssl/

# Редактирование конфигурации
vim /etc/nginx/sites-available/default.conf`

const cSslNginxConf = `ssl_certificate /etc/nginx/ssl/web.au-team.irpo.cer;
ssl_certificate_key /etc/nginx/ssl/web.au-team.irpo.key;
ssl_ciphers GOST2012-GOST8912-GOST8912:HIGH:MEDIUM;
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;`

const cSslNginxRestart = `nginx -t
systemctl restart nginx`

// 3. IPsec VPN
const cIpsecA = `Router-A(config)# crypto-ipsec ike enable
Router-A(config)# crypto-ipsec profile CIPROFILE ike-v2
Router-A(config-ipsec-ikev2)# mode tunnel
Router-A(config-ipsec-ikev2)# ike-phase1
Router-A(config-ipsec-ikev2-ph1)# proposal aes256-sha256-modp2048
Router-A(config-ipsec-ikev2-ph1)# auth pre-shared-key P@ssw0rd
Router-A(config-ipsec-ikev2-ph1)# exit
Router-A(config-ipsec-ikev2)# ike-phase2
Router-A(config-ipsec-ikev2-ph2)# protocol esp
Router-A(config-ipsec-ikev2-ph2)# proposal aes256-sha256
Router-A(config-ipsec-ikev2-ph2)# local-ts 172.16.1.2
Router-A(config-ipsec-ikev2-ph2)# remote-ts 172.16.2.2
Router-A(config-ipsec-ikev2-ph2)# exit
Router-A(config-ipsec-ikev2)# exit

Router-A(config)# crypto-map CMAP 10
Router-A(config-crypto-map)# match peer 172.16.2.2
Router-A(config-crypto-map)# set crypto-ipsec profile CIPROFILE
Router-A(config-crypto-map)# exit

Router-A(config)# filter-map ipv4 FMAP 5
Router-A(config-filter-map-ipv4)# match gre host 172.16.1.2 host 172.16.2.2
Router-A(config-filter-map-ipv4)# set crypto-map CMAP peer 172.16.2.2
Router-A(config-filter-map-ipv4)# exit

Router-A(config)# filter-map ipv4 FMAP 10
Router-A(config-filter-map-ipv4)# match udp host 172.16.2.2 eq 4500 host 172.16.1.2 eq 4500
Router-A(config-filter-map-ipv4)# set crypto-map CMAP peer 172.16.2.2
Router-A(config-filter-map-ipv4)# exit

Router-A(config)# filter-map ipv4 FMAP 15
Router-A(config-filter-map-ipv4)# match any any
Router-A(config-filter-map-ipv4)# set accept
Router-A(config-filter-map-ipv4)# exit

Router-A(config)# interface isp
Router-A(config-if)# set filter-map in FMAP 10
Router-A(config-if)# exit

Router-A(config)# interface tunnel.0
Router-A(config-if-tunnel)# set filter-map in FMAP 10
Router-A(config-if-tunnel)# exit

Router-A(config)# write memory`

const cIpsecB = `Router-B(config)# crypto-ipsec ike enable
Router-B(config)# crypto-ipsec profile CIPROFILE ike-v2
Router-B(config-ipsec-ikev2)# mode tunnel
Router-B(config-ipsec-ikev2)# ike-phase1
Router-B(config-ipsec-ikev2-ph1)# proposal aes256-sha256-modp2048
Router-B(config-ipsec-ikev2-ph1)# auth pre-shared-key P@ssw0rd
Router-B(config-ipsec-ikev2-ph1)# exit
Router-B(config-ipsec-ikev2)# ike-phase2
Router-B(config-ipsec-ikev2-ph2)# protocol esp
Router-B(config-ipsec-ikev2-ph2)# proposal aes256-sha256
Router-B(config-ipsec-ikev2-ph2)# local-ts 172.16.2.2
Router-B(config-ipsec-ikev2-ph2)# remote-ts 172.16.1.2
Router-B(config-ipsec-ikev2-ph2)# exit
Router-B(config-ipsec-ikev2)# exit

Router-B(config)# crypto-map CMAP 10
Router-B(config-crypto-map)# match peer 172.16.1.2
Router-B(config-crypto-map)# set crypto-ipsec profile CIPROFILE
Router-B(config-crypto-map)# exit

Router-B(config)# filter-map ipv4 FMAP 5
Router-B(config-filter-map-ipv4)# match gre host 172.16.2.2 host 172.16.1.2
Router-B(config-filter-map-ipv4)# set crypto-map CMAP peer 172.16.1.2
Router-B(config-filter-map-ipv4)# exit

Router-B(config)# filter-map ipv4 FMAP 10
Router-B(config-filter-map-ipv4)# match udp host 172.16.1.2 eq 4500 host 172.16.2.2 eq 4500
Router-B(config-filter-map-ipv4)# set crypto-map CMAP peer 172.16.1.2
Router-B(config-filter-map-ipv4)# exit

Router-B(config)# filter-map ipv4 FMAP 15
Router-B(config-filter-map-ipv4)# match any any
Router-B(config-filter-map-ipv4)# set accept
Router-B(config-filter-map-ipv4)# exit

Router-B(config)# interface isp
Router-B(config-if)# set filter-map in FMAP 10
Router-B(config-if)# exit

Router-B(config)# interface tunnel.0
Router-B(config-if-tunnel)# set filter-map in FMAP 10
Router-B(config-if-tunnel)# exit

Router-B(config)# write memory`

// 4. Firewall
const cFwRules = `(config)# no filter-map ipv4 FMAP 30

# Правила для Kerberos, LDAP, DNS
filter-map ipv4 FMAP 21
match tcp any any eq 88
match udp any any eq 88
match udp any any dns
match tcp any any range 3268 3269
match tcp any any eq 389
match tcp any any eq 464
match udp any any eq 464
match tcp any any eq 636
match tcp any any eq 445
match udp any any range 137 138
set accept
# Правила для веб-сервисов и управления
filter-map ipv4 FMAP 22
match icmp any any
match ospf any any
match tcp any any eq 8080
match tcp any any http
match tcp any any eq 2026
match tcp any any range 32768 60999
match udp any any range 32768 60999
match tcp any any eq https
match udp any any eq 123
set accept`

// 5. CUPS
const cCups = `# Установка CUPS
apt-get update && apt-get install -y cups cups-pdf

# Включение и запуск службы
systemctl enable --now cups
# Настройка общего доступа
cupsctl --share-printers --remote-any`

// 6. rsyslog
const cRsyslogInstall = `# Установка rsyslog
apt-get install -y rsyslog

# Создание конфигурации
vim /etc/rsyslog.conf.d/custom.conf`

const cRsyslogConf = `module(load="imudp")
module(load="imuxsock")

authpriv.* /var/log/auth.log
input(type="imudp" port="514")

if $fromhost-ip contains '192.168.100.1' then {
    *.warn /opt/Router-A/router.log
}

if $fromhost-ip contains '10.10.10.2' then {
    *.warn /opt/Router-B/router.log
}

if $fromhost-ip contains '192.168.0.2' then {
    *.warn /opt/br-srv/server.log
}`

const cRsyslogStart = `systemctl enable --now rsyslog`

const cRsyslogRouters = `Router-A(config)# rsyslog host 192.168.100.2
Router-B(config)# rsyslog host 192.168.100.2`

const cRsyslogBrsrv = `$ModLoad imuxsock
$ModLoad imjournal
*.warn @@192.168.100.2:514`

const cRsyslogCheck = `logger -p warn "atencion"`

const cLogrotateInstall = `# Установка logrotate
apt-get install -y logrotate
# Настройка
vim /etc/logrotate.conf`

const cLogrotateConf = `/opt/Router-B/*.log
/opt/Router-A/*.log
/opt/br-srv/*.log {
    weekly
    compress
    minsize 10M
}`

const cLogrotateRun = `systemctl enable --now logrotate
logrotate -d /etc/logrotate.conf`

// 7. Ansible
const cAnsibleYml = `---
- name: Get_hostname
  hosts: srv,cli
  tasks:
    - name: Save hostname and IP
      copy:
        content: |
          Hostname: {{ ansible_hostname }}
          IP_Address: {{ ansible_default_ipv4.address }}
        dest: "/etc/inventarized/PC-INFO/{{ ansible_hostname }}.yml"
      delegate_to: localhost`

const cAnsibleRun = `ansible-playbook /etc/ansible/get_hostname_address.yml`

// 8. SSH / fail2ban
const cF2bInstall = `apt-get install -y fail2ban iptables`

const cF2bSsh = `SyslogFacility AUTHPRIV
LogLevel INFO`

const cF2bJail = `[sshd]
enabled = yes
port = 2026
logpath = /var/log/auth.log
backend = %(sshd_backend)s
maxretry = 3
bantime = 1m`

const cF2bSyslog = `authpriv.* /var/log/auth.log`

const cF2bManage = `# Запуск службы
systemctl enable --now fail2ban
# Проверка статуса
fail2ban-client status sshd

# Разблокировка всех IP
fail2ban-client unban all

# Разблокировка конкретного IP
fail2ban-client unban 192.168.0.2`

// 9. CyberBackup
const cBackup = `# Обновление системы
apt-get update && apt-get dist-upgrade
update-kernel
apt-get clean
reboot

# Установка зависимостей
apt-get install -y kernel-source-6.1.168 kernel-headers-modules-un-def gcc make kmod-sign

# Установка CyberBackup
chmod +x CyberBackup
./CyberBackup
# Создание директории для бэкапов
mkdir /backup
# Обновление системы
apt-get update && apt-get dist-upgrade
update-kernel

# Установка зависимостей
apt-get install -y kernel-source-6.1.168 kernel-headers-modules-un-def gcc make kmod-sign

# Копирование и установка
cd /home/user/Загрузки
cp -r cyberbackup /mnt/nfs/
chmod +x CyberBackup
./CyberBackup`
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
          Практические аспекты администрирования корпоративной инфраструктуры
        </h1>
        <div class="mt-4 max-w-3xl rounded-lg border-l-4 border-emerald-500 bg-emerald-50/60 p-4 text-zinc-600 dark:bg-emerald-500/5 dark:text-zinc-300">
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Аннотация</p>
          <p class="mt-1">
            В данной статье рассматриваются ключевые задачи системного администрирования:
            управление пользователями, настройка SSL/TLS с использованием российских
            криптографических алгоритмов, конфигурирование IPsec VPN, организация
            логирования и резервного копирования, а также защита SSH от bruteforce-атак.
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

      <!-- 1. CSV -->
      <section :id="sections[0].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
          Автоматизация импорта пользователей из CSV
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">1.1. Подготовка данных</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Для корректной обработки CSV-файла с пользователями необходимо выполнить
          предварительную обработку:
        </p>
        <CodeBlock title="bash" :code="cCsvPrep" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">1.2. Скрипт автоматического создания пользователей</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Создайте файл
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">import_user.sh</code>:
        </p>
        <CodeBlock title="bash · import_user.sh" :code="cCsvImport" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Запуск скрипта:</p>
        <CodeBlock title="bash" :code="cCsvRun" />
      </section>

      <!-- 2. SSL/TLS ГОСТ -->
      <section :id="sections[1].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
          Настройка SSL/TLS с использованием ГОСТ
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">2.1. Установка и настройка OpenSSL с поддержкой ГОСТ</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">На сервере:</p>
        <CodeBlock title="bash · сервер" :code="cSslServer" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">На клиенте:</p>
        <CodeBlock title="bash · клиент" :code="cSslClient" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">2.2. Генерация сертификатов для сервисов</h3>
        <CodeBlock title="bash" :code="cSslCerts" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">2.3. Настройка Nginx</h3>
        <CodeBlock title="bash" :code="cSslNginxCmd" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Конфигурация Nginx:</p>
        <CodeBlock title="nginx · default.conf" :code="cSslNginxConf" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверка и перезапуск:</p>
        <CodeBlock title="bash" :code="cSslNginxRestart" />
      </section>

      <!-- 3. IPsec VPN -->
      <section :id="sections[2].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
          Настройка IPsec VPN между маршрутизаторами
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.1. Конфигурация Router-A</h3>
        <CodeBlock title="EcoRouter CLI — Router-A" :code="cIpsecA" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.2. Конфигурация Router-B</h3>
        <CodeBlock title="EcoRouter CLI — Router-B" :code="cIpsecB" />
      </section>

      <!-- 4. Firewall -->
      <section :id="sections[3].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
          Настройка правил межсетевого экрана
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.1. Правила для Active Directory и служб</h3>
        <CodeBlock title="EcoRouter CLI" :code="cFwRules" />
      </section>

      <!-- 5. CUPS -->
      <section :id="sections[4].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">5</span>
          Установка и настройка CUPS
        </h2>
        <CodeBlock title="bash" :code="cCups" />
      </section>

      <!-- 6. rsyslog -->
      <section :id="sections[5].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">6</span>
          Организация централизованного логирования
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.1. Настройка rsyslog на сервере</h3>
        <CodeBlock title="bash" :code="cRsyslogInstall" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Конфигурация:</p>
        <CodeBlock title="rsyslog · custom.conf" :code="cRsyslogConf" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Запуск службы:</p>
        <CodeBlock title="bash" :code="cRsyslogStart" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.2. Настройка маршрутизаторов</h3>
        <CodeBlock title="EcoRouter CLI" :code="cRsyslogRouters" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.3. Настройка BR-SRV</h3>
        <CodeBlock title="rsyslog" :code="cRsyslogBrsrv" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверка:</p>
        <CodeBlock title="bash" :code="cRsyslogCheck" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">6.4. Настройка ротации логов</h3>
        <CodeBlock title="bash" :code="cLogrotateInstall" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Конфигурация ротации:</p>
        <CodeBlock title="logrotate · logrotate.conf" :code="cLogrotateConf" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Запуск и проверка:</p>
        <CodeBlock title="bash" :code="cLogrotateRun" />
      </section>

      <!-- 7. Ansible -->
      <section :id="sections[6].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">7</span>
          Ansible playbook для сбора информации
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Создайте файл
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/ansible/get_hostname_address.yml</code>:
        </p>
        <CodeBlock title="yaml · get_hostname_address.yml" :code="cAnsibleYml" />
        <CodeBlock title="bash" :code="cAnsibleRun" />
      </section>

      <!-- 8. SSH / fail2ban -->
      <section :id="sections[7].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">8</span>
          Защита SSH от bruteforce-атак
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.1. Установка Fail2Ban</h3>
        <CodeBlock title="bash" :code="cF2bInstall" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.2. Настройка SSH</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Отредактируйте
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/ssh/sshd_config</code>:
        </p>
        <CodeBlock title="sshd_config" :code="cF2bSsh" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.3. Конфигурация Fail2Ban</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Отредактируйте
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/etc/fail2ban/jail.conf</code>:
        </p>
        <CodeBlock title="jail.conf" :code="cF2bJail" />
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Проверка конфигурации syslog:</p>
        <CodeBlock title="rsyslog" :code="cF2bSyslog" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">8.4. Запуск и управление</h3>
        <CodeBlock title="bash" :code="cF2bManage" />
      </section>

      <!-- 9. CyberBackup -->
      <section :id="sections[8].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">9</span>
          Резервное копирование с CyberBackup
        </h2>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">9.1. Настройка сервера</h3>
        <CodeBlock title="bash" :code="cBackup" />
      </section>

      <!-- Заключение -->
      <section class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="text-2xl font-bold">Заключение</h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          В статье рассмотрены практические аспекты администрирования корпоративной
          инфраструктуры, включая автоматизацию рутинных задач, обеспечение безопасности и
          организацию мониторинга. Предложенные решения могут быть адаптированы под
          конкретные требования организации.
        </p>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          <span class="font-semibold text-emerald-700 dark:text-emerald-400">Ключевые слова:</span>
          системное администрирование, IPsec, ГОСТ, rsyslog, fail2ban, Ansible, резервное
          копирование, Active Directory.
        </p>
      </section>

      <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Практические аспекты администрирования · конспект
      </footer>
    </main>
  </div>
</template>
