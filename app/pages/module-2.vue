<script setup lang="ts">
useHead({
  title: 'Модуль 2 — Корпоративная ИТ-инфраструктура',
  meta: [
    {
      name: 'description',
      content:
        'Настройка корпоративной ИТ-инфраструктуры: пользователи Samba, NFS, Chrony/NTP, Ansible, развёртывание веб-приложения и HTTP Basic Auth.',
    },
  ],
})

const sections = [
  { id: 'samba', label: 'Пользователи Samba', icon: 'i-lucide-users' },
  { id: 'nfs', label: 'Файловая система NFS', icon: 'i-lucide-hard-drive' },
  { id: 'chrony', label: 'Синхронизация времени', icon: 'i-lucide-clock' },
  { id: 'ansible', label: 'Автоматизация Ansible', icon: 'i-lucide-settings-2' },
  { id: 'webapp', label: 'Веб-приложение', icon: 'i-lucide-globe' },
  { id: 'auth', label: 'Веб-аутентификация', icon: 'i-lucide-lock' },
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

// --- Команды (хранятся как константы из-за смешанных кавычек) ---
const cSamba = `# Создание группы 'ab'
samba-tool group add ab

# Цикл для создания 5 пользователей (abuser1 ... abuser5)
for i in {1..5}; do
  # Создание пользователя с паролем P@ssw0rd
  samba-tool user add "abuser$i" "P@ssw0rd"
  # Отключение срока действия пароля
  samba-tool user setexpiry "abuser$i" --noexpiry
  # Добавление пользователя в группу 'ab'
  samba-tool group addmembers "ab" "abuser$i"
done`

const cNfsServer = `# Создание директории для экспорта
mkdir -p /raid/nfs
# Установка полных прав доступа (для тестовых сред)
chmod 777 /raid/nfs
# Применение изменений в конфигурации экспорта
exportfs -arv
# Включение и запуск службы NFS-сервера
systemctl enable --now nfs-server`

const cNfsClient = `# Создание точки монтирования и установка прав
mkdir -p /mnt/nfs
chmod 777 /mnt/nfs
# Добавление записи в /etc/fstab для автоматического монтирования
# Пример строки: <IP_сервера>:/raid/nfs /mnt/nfs nfs defaults,_netdev 0 0
vim /etc/fstab
# Монтирование всех файловых систем из fstab с выводом информации
mount -a -v`

const cChronyServer = `# Редактирование конфигурационного файла (раскомментировать или добавить allow и server)
vim /etc/chrony.conf
# Перезапуск службы
systemctl restart chronyd
# Проверка синхронизации
chronyc tracking`

const cChronyEco = `Ecorouter(config)# ntp server 172.16.1.1
# Проверка статуса NTP
ecorouter# show ntp status`

const cChronyLinux = `# Указание сервера времени в конфигурации
vim /etc/chrony.conf
# Добавить строку: server 172.16.1.1 iburst
# Перезапуск службы
systemctl restart chronyd
# Проверка источников времени
chronyc sources`

const cAnsibleNode = `# Обновление репозиториев и установка базовых пакетов
apt-get update && apt-get install -y ansible sshpass
# Установка необходимых зависимостей Python
apt-get install -y python3-pip
pip3 install ansible-pylibssh
# Установка коллекций для работы с сетевым оборудованием
ansible-galaxy collection install ansible.netcommon
ansible-galaxy collection install cisco.ios
# Настройка инвентаризационного файла
vim /etc/ansible/hosts`

const cAnsibleHosts = `server ansible_host=10.10.100.2 ansible_user=sshusser ansible_password=P@ssw0rd ansible_port=2026
cli ansible_host=10.10.200.2 ansible_user=root ansible_password=toor
router ansible_host=172.16.1.2 ansible_user=admin ansible_password=admin ansible_connection=network_cli ansible_network_os=ios`

const cAnsibleEco = `Ecorouter(config)# security none`

const cAnsiblePing = `# Проверка доступности всех узлов из инвентаря
ansible -m ping all`

const cWebMount = `# 1. Монтирование ISO-образа (только для чтения)
mount -o -ro -t iso9660 /home/user/additional.iso /mnt/
# 2. Копирование файлов веб-приложения
cp /mnt/web/index.php /var/www/html/
cp /mnt/web/logo.png /var/www/html/`

const cWebMaria = `# 3. Настройка СУБД MariaDB
systemctl enable --now mariadb
# Вход в консоль MariaDB под пользователем root
mariadb -u root`

const cWebMariaConsole = `# Внутри консоли MariaDB выполнить:
MariaDB [(none)]> SHOW DATABASES;
MariaDB [(none)]> USE webdb;
MariaDB [webdb]> SELECT user FROM mysql.user;
MariaDB [webdb]> ALTER USER 'web'@'localhost' IDENTIFIED BY 'P@ssw0rd';
MariaDB [webdb]> EXIT;`

const cWebVim = `# 4. Правка конфигурации веб-приложения (при необходимости)
vim /var/www/html/index.php`

const cWebRestart = `# 5. Перезапуск веб-сервера (httpd или apache2 в зависимости от дистрибутива)
systemctl restart httpd
# или systemctl restart apache2`

const cWebImport = `# 6. Импорт дампа базы данных
mariadb -u web -p'P@ssw0rd' -D webdb < /mnt/cdrom/web/dump.sql`

const cAuthInstall = `# Установка утилиты для работы с паролями (пакет apache2-utils)
apt-get install -y apache2-htpasswd
# Создание файла паролей и добавление пользователя WEB
# Флаг -c создает новый файл (использовать только при первом запуске)
htpasswd -c /etc/nginx/.htpasswd WEB`

const cAuthNginx = `# Проверка конфигурационного файла Nginx на синтаксические ошибки
nginx -t
# Перезапуск веб-сервера Nginx для применения изменений
systemctl restart nginx`
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
          Комплексное руководство по настройке корпоративной ИТ-инфраструктуры
        </h1>
        <div class="mt-4 max-w-3xl rounded-lg border-l-4 border-emerald-500 bg-emerald-50/60 p-4 text-zinc-600 dark:bg-emerald-500/5 dark:text-zinc-300">
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Аннотация</p>
          <p class="mt-1">
            В данной статье рассматриваются пошаговые инструкции по настройке ключевых
            сервисов корпоративной сети: управление пользователями Samba через скрипты,
            развёртывание сетевого хранилища NFS, синхронизация времени через Chrony/NTP,
            автоматизация управления сетевым оборудованием с помощью Ansible, а также
            развёртывание и защита веб-приложения.
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

      <!-- 1. Samba -->
      <section :id="sections[0].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
          Автоматизация настройки пользователей Samba
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Для массового создания пользователей, установки им паролей, отключения срока
          действия пароля и добавления в группу удобно использовать bash-скрипт.
        </p>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">Скрипт настройки:</p>
        <CodeBlock title="bash · скрипт настройки" :code="cSamba" />
      </section>

      <!-- 2. NFS -->
      <section :id="sections[1].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
          Настройка файловой системы NFS
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Настройка выполняется в два этапа: на стороне сервера и на стороне клиента.
        </p>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">2.1. Настройка сервера</h3>
        <CodeBlock title="bash" :code="cNfsServer" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">2.2. Настройка клиента</h3>
        <CodeBlock title="bash" :code="cNfsClient" />
      </section>

      <!-- 3. Chrony -->
      <section :id="sections[2].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
          Настройка синхронизации времени (Chrony / NTP)
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Корректное время критически важно для работы служб аутентификации и
          логирования. Настроим сервер времени на Linux и клиентов на базе Linux и
          Ecorouter.
        </p>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.1. Настройка сервера времени (Linux)</h3>
        <CodeBlock title="bash" :code="cChronyServer" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.2. Настройка клиента на маршрутизаторе Ecorouter</h3>
        <CodeBlock title="EcoRouter CLI" :code="cChronyEco" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">3.3. Настройка клиента на Linux</h3>
        <CodeBlock title="bash" :code="cChronyLinux" />
      </section>

      <!-- 4. Ansible -->
      <section :id="sections[3].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
          Настройка системы автоматизации Ansible
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Ansible позволяет централизованно управлять конфигурациями как Linux-серверов,
          так и сетевого оборудования (Ecorouter).
        </p>

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.1. Подготовка управляющей ноды (Linux)</h3>
        <CodeBlock title="bash" :code="cAnsibleNode" />
        <CodeBlock title="/etc/ansible/hosts" :code="cAnsibleHosts" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.2. Подготовка сетевого оборудования (Ecorouter)</h3>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Для работы Ansible по SSH без интерактивного подтверждения необходимо отключить
          строгие проверки безопасности (в тестовых целях):
        </p>
        <CodeBlock title="EcoRouter CLI" :code="cAnsibleEco" />

        <h3 class="mt-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">4.3. Проверка подключения</h3>
        <CodeBlock title="bash" :code="cAnsiblePing" />
      </section>

      <!-- 5. Web app -->
      <section :id="sections[4].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">5</span>
          Развёртывание веб-приложения на сервере
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Процесс включает монтирование установочного образа, копирование файлов,
          настройку базы данных и запуск веб-сервера.
        </p>
        <CodeBlock title="bash · монтирование и копирование" :code="cWebMount" />
        <CodeBlock title="bash · MariaDB" :code="cWebMaria" />
        <CodeBlock title="MariaDB консоль" :code="cWebMariaConsole" />
        <CodeBlock title="bash · правка конфигурации" :code="cWebVim" />
        <Figure src="/images/m2_img2.png" caption="Параметры подключения к БД в index.php" />
        <CodeBlock title="bash · перезапуск веб-сервера" :code="cWebRestart" />
        <CodeBlock title="bash · импорт дампа БД" :code="cWebImport" />
      </section>

      <!-- 6. Basic Auth -->
      <section :id="sections[5].id" class="scroll-mt-20 border-t border-zinc-200 py-10 dark:border-zinc-800">
        <h2 class="flex items-center gap-3 text-2xl font-bold">
          <span class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">6</span>
          Настройка базовой веб-аутентификации (HTTP Basic Auth)
        </h2>
        <p class="mt-4 text-zinc-600 dark:text-zinc-300">
          Для ограничения доступа к веб-ресурсам можно использовать механизм
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">.htpasswd</code>
          в связке с Nginx.
        </p>
        <CodeBlock title="bash" :code="cAuthInstall" />
        <CodeBlock title="bash" :code="cAuthNginx" />
      </section>

      <footer class="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Корпоративная ИТ-инфраструктура · конспект
      </footer>
    </main>
  </div>
</template>
