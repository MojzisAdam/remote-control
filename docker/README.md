# Running the backend in Docker

PHP 8.4 and MySQL 8.0, matching the production server and CI.

Backend only — the React frontend runs on the host with `npm run dev`.
Not a production image.

## Requirements

[Docker Desktop](https://www.docker.com/products/docker-desktop/) with the
Compose plugin. Verify with `docker compose version`.

All commands run from the repository root. You can also `cd docker` and drop
the `-f` flag.

## First-time setup

```bash
docker compose -f docker/compose.yml up -d --build db
cp backend/.env.example backend/.env
```

Set these in `backend/.env` — `DB_HOST` must be `db`, not `127.0.0.1`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=remote_control
DB_USERNAME=remote_control
DB_PASSWORD=secret
```

Install and initialise. Use `run --rm` here, not `exec` — the app container
cannot start until these have run:

```bash
docker compose -f docker/compose.yml run --rm app composer install
docker compose -f docker/compose.yml run --rm app php artisan key:generate
docker compose -f docker/compose.yml run --rm app php artisan migrate
```

Start it:

```bash
docker compose -f docker/compose.yml up -d
docker compose -f docker/compose.yml exec app php artisan test
```

The API is on <http://localhost:8000>. Point the frontend at it with
`VITE_API_URL=http://localhost:8000/api` in `frontend/.env`.

## Daily use

```bash
docker compose -f docker/compose.yml up -d          # start
docker compose -f docker/compose.yml down           # stop (database survives)
docker compose -f docker/compose.yml logs -f app    # follow the log
```

Artisan and shell access:

```bash
docker compose -f docker/compose.yml exec app php artisan route:list
docker compose -f docker/compose.yml exec app bash
```

Use `run --rm` instead of `exec` whenever the app container is not running.

## Queue worker

Off by default; the app uses `QUEUE_CONNECTION=database`:

```bash
docker compose -f docker/compose.yml --profile queue up -d
```

## Database client

Host `127.0.0.1`, port **3307**, user `remote_control`, password `secret`.

## Reset

```bash
docker compose -f docker/compose.yml down -v    # also deletes the database
```
