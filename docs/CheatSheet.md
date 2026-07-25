# 🛠️ Шпаргалка по инфраструктуре и командам

## Docker Compose
* `docker compose up -d` — Запустить все контейнеры в фоновом режиме (detach).
* `docker compose stop` — Остановить контейнеры без удаления данных.
* `docker compose start` — Запустить остановленные контейнеры.
* `docker ps` — Посмотреть список активных контейнеров.

### Доступы
* **MongoDB:** `mongodb://localhost:27017`
* **Mongo Express:** `http://localhost:8081` (Логин: `admin` | Пароль: `pass`)

## pnpm & Turborepo
* `pnpm --filter scraper add tsx -D` — Установить dev-зависимость только в пакет scraper.
* `pnpm --filter scraper dev` — Запустить dev-скрипт в конкретном приложении.
* `pnpm build` — Запустить сборку всех проектов через Turborepo.