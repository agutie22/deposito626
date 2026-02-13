# Supabase Local Development Workflow

This guide explains how to develop locally with Supabase while keeping production as the source of truth.

> [!TIP]
> **Ready to deploy?** See the [Production Deployment & Cutover Guide](file:///home/alexguti/projects/deposito626/DEPLOYMENT_GUIDE.md) for step-by-step production instructions.

## 1. Environment Setup

We use different `.env` files for local development and production.

- **`.env.local`**: Use this for **local development**. It points to your local Supabase instance.
  ```bash
  # Start with localSupabase defaults
  cp .env.local.example .env.local 
  ```
- **`.env.production`**: Use this for **production builds**. It points to your hosted Supabase project.
  ```bash
  # Contains your actual production keys (DO NOT COMMIT)
  cp .env .env.production
  ```

**Important**: `.env.local` and `.env.production` are git-ignored to prevent accidental leaks.

## 2. Local Development Commands

Use these `pnpm` scripts to manage your local database. They use `pnpm dlx` so you don't need a global Supabase CLI install, but you **must have Docker running**.

| Command | Description |
| :--- | :--- |
| `pnpm db:start` | Starts the local Supabase stack (Postgres, Auth, API, etc.) |
| `pnpm db:stop` | Stops the local Supabase stack |
| `pnpm db:status` | Shows the status of local services and API URLs |
| `pnpm db:reset` | Resets the local DB: drops all data, re-applies migrations, and runs seed |
| `pnpm db:gen-types` | Generates TypeScript types from your **local** DB schema to `src/types/supabase.ts` |

### Setting up for the first time
1. Ensure Docker is running.
2. Run `pnpm db:start`.
3. If this is a fresh start, your database will be empty. Run `pnpm db:reset` to apply migrations and seed data.
4. **Login**: Use `admin@deposito626.com` / `Yz6vxc@3` (seeded automatically).

### Manual Admin Creation (If needed)
If you prefer not to use the seed or need another admin:
1. Go to **Supabase Studio** (http://localhost:54323).
2. **Authentication > Users**: creating a new user (e.g., `you@example.com`).
3. **Table Editor > `profiles`**: Find the user's row and change `role` to `admin`.

## 3. Production Workflow

**NEVER** make schema changes directly on the production dashboard. Always use migrations.

### Making Schema Changes
1. **Create a migration**:
   ```bash
   pnpm dlx supabase migration new your_change_name
   ```
2. **Edit the migration file** in `supabase/migrations/`.
3. **Apply to local**:
   ```bash
   pnpm db:reset
   # OR for non-destructive apply (if possible)
   pnpm dlx supabase db migrate
   ```
4. **Develop & Test** locally.

### Deploying to Production
1. **Commit** your migration files to Git.
2. **Push only migrations**:
   ```bash
   pnpm db:push
   ```
   *Note*: You'll need to link your project first if you haven't already:
   ```bash
   pnpm dlx supabase link --project-ref <your-project-ref>
   ```

## 4. Troubleshooting & Pitfalls

- **"Docker not running"**: Ensure Docker Desktop or Daemon is active.
- **Schema Drift**: If production has changes not in your migrations, `db:push` might fail. You may need to pull remote changes first (carefully):
  ```bash
  pnpm dlx supabase db pull
  ```
- **Port Conflicts**: Supabase Local uses port `54321` (API) and `54322` (DB) by default. If these are taken, stop the conflicting services.
- **Edge Functions**: Local edge functions can be tested with `pnpm dlx supabase functions serve`.
