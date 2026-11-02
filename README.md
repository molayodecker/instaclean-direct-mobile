# Instaclean Admin (Expo)

Mobile admin app backed by **[Mithril](https://github.com/molayodecker/mithril)** — the same Phoenix API used by `instaclean-direct` web (`/auth/*` and `/direct/admin/*`).

## Setup

```bash
cp .env.example .env
npm install
npm start
```

All admin screens use **live Mithril data** (React Query + `/auth/*` and `/direct/admin/*`). There is no mock or offline fixture layer.

### API environment

| Where you run | Mithril host | How it is set |
|---------------|--------------|----------------|
| Local `expo start` | **Staging** | `.env` → `EXPO_PUBLIC_MITHRIL_API_URL` (`.env.example` points at staging) |
| Local Phoenix | Your machine | `EXPO_PUBLIC_MITHRIL_API_URL=http://<LAN-IP>:4000` |
| EAS `development` / `preview` | **Staging** | `eas.json` build `env` |
| EAS `production` | **Production** | `eas.json` → `https://api.tryinstaclean.com` |

Constants live in `lib/mithril/config.ts` (`MITHRIL_API_URLS`). Settings shows **Environment** and **Base URL** at runtime.

Optional overrides:

| Environment | URL |
|-------------|-----|
| Staging (default local) | `https://instaclean-mithril-staging.fly.dev` |
| Production | `https://api.tryinstaclean.com` |
| Dev (legacy hostname) | `https://dev.tryinstaclean.com` |
| Local Mithril | `http://localhost:4000` (use your machine IP on a physical device) |

EAS builds:

```bash
npx eas-cli build --profile preview    # staging API
npx eas-cli build --profile production # production API
```

## Auth

- Email/password → `POST /auth/login`, then `GET /auth/me`
- Phone OTP → `POST /auth/otp` and `POST /auth/otp/verify`
- Tokens are stored in **expo-secure-store** and refreshed via `POST /auth/refresh`
- Only users with **admin** or **reviewer** roles can use the app (checked on `/auth/me`)

Grant staff access against the Mithril database:

```bash
cd ../mithril
mix mithril.staff.grant --email you@tryinstaclean.com --role admin
```

## Live data (Mithril)

| Screen | Endpoint |
|--------|----------|
| Home / Bookings / Inbox (assignments) | `GET /direct/admin/bookings` |
| Live | `GET /direct/admin/live-jobs` |
| Inbox (requests) | `GET /direct/admin/service-requests` |
| Inbox (WhatsApp) | `GET /direct/admin/whatsapp/threads` |
| Dispatch map | `GET /direct/admin/dispatch-map` (admin) |
| Workers | `GET /direct/admin/cleaners`, `GET /direct/admin/cleaner-applications` (admin; API paths unchanged) |
| App update policy | `GET` / `POST /direct/admin/app-update-policy` (admin) |

See also `mithril/docs/mobile-admin.md`.

Regenerate OpenAPI types from staging (or set `MITHRIL_OPENAPI_URL`):

```bash
npm run api:generate
```

## Sentry

Crash and performance monitoring uses **[Sentry](https://instaclean-inc.sentry.io)** (`instaclean-inc` / project **`instaclean-direct-mobile`**).

1. In Sentry, create a **React Native** project with slug `instaclean-direct-mobile` (if it does not exist yet).
2. Copy the **DSN** into `.env`:

   ```bash
   EXPO_PUBLIC_SENTRY_DSN=https://…@…ingest.us.sentry.io/…
   ```

3. For **EAS Build** source maps, add an [organization auth token](https://sentry.io/settings/auth-tokens/) as an EAS secret:

   ```bash
   eas secret:create --name SENTRY_AUTH_TOKEN --value … --type string
   ```

   The `@sentry/react-native/expo` config plugin in `app.json` uploads debug symbols on build (`organization`: `instaclean-inc`, `project`: `instaclean-direct-mobile`).

Runtime: `lib/sentry/` initializes on startup, wraps the root layout, tags `environment` with Mithril env (staging/production), sets Sentry user to staff `user.id` after sign-in, and reports React Query failures for 5xx/transport errors only.

## Project layout

- `lib/mithril/` — API client, session storage, types
- `hooks/useMithrilAdmin.ts` — React Query hooks
- `context/AuthContext.tsx` — sign-in and token lifecycle
