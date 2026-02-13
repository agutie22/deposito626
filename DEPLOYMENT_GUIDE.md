# Production Deployment & Cutover Guide

This guide provides the exact steps to move your project from local development to a production environment using **Cloudflare Pages** and a **remote Supabase project**.

---

## 1. Cloudflare Pages Setup

Cloudflare Pages manages environment variables at build-time. Since this is a **Vite** project, all public variables **MUST** be prefixed with `VITE_`.

### Environment Variables
Set these in the **Cloudflare Pages Dashboard > Settings > Environment Variables**.

| Variable Name | Value Type | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | String | Your Remote Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | String | Your Remote Supabase `anon` (public) key |

### Production vs. Preview
- **Production**: Set these in the "Production" environment variables tab.
- **Preview**: You can set different keys if you have a separate "Staging" Supabase project, or use the same ones for both.

> [!NOTE]
> Cloudflare Pages ignores your `.env.production` file by default when deploying via Git. You must set these variables in the Cloudflare dashboard.

---

## 2. Remote Migrations Strategy

To ensure your production database matches your local schema, you must apply your migrations to the remote project.

### Option A: Manual (Local Machine) - Recommended for First Time
Use this for the initial setup or one-off changes.

1.  **Link your project**:
    ```bash
    pnpm dlx supabase link --project-ref <YOUR_PROJECT_ID>
    ```
    *(You will be prompted for your Database Password)*.
2.  **Push migrations**:
    ```bash
    pnpm dlx supabase db push
    ```
3.  **Verify**: Check your production project in the Supabase Dashboard to see if the tables exist.

### Option B: Automatic (GitHub Actions)
Use this for a repeatable, safe CI/CD workflow. See [.github/workflows/supabase-migrate.yml](file:///home/alexguti/projects/deposito626/.github/workflows/supabase-migrate.yml).

**Required GitHub Secrets:**
- `SUPABASE_ACCESS_TOKEN`: [Generate here](https://supabase.com/dashboard/account/tokens).
- `SUPABASE_PROJECT_ID`: Found in Project Settings > General.
- `SUPABASE_DB_PASSWORD`: The password you set when creating the project.

---

## 3. Cutover Checklist

Follow this order of operations to ensure a smooth deployment with no downtime.

### Pre-Flight (Supabase Dashboard)
1.  [ ] **Apply Migrations**: Push your local migrations to the remote project.
2.  [ ] **Auth Settings**:
    - Set **Site URL** to your Cloudflare Pages production URL (e.g., `https://your-app.pages.dev`).
    - Add **Redirect URLs** for local dev (`http://localhost:5173`) and your preview URLs.
3.  [ ] **Storage**: Create any buckets (e.g., `product-images`) and ensure the RLS policies match your local setup.

### Deployment (Cloudflare Dashboard)
4.  [ ] **Set Env Vars**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Cloudflare dashboard.
5.  [ ] **Redeploy**: Go to the "Deployments" tab and trigger a new deployment (or push a commit).

### Smoke Test
6.  [ ] **Login**: Can you log in as admin with your new password?
7.  [ ] **Menu**: Are products loading from the remote database?
8.  [ ] **Orders**: Can you place a test order?
9.  [ ] **Inventory**: Does stock decrease correctly on the remote DB?

---

## Common Gotchas
- **CORS**: Usually handled automatically by Supabase, but ensure your Cloudflare URL is allowed if you see "Origin not allowed" errors.
- **RLS**: If data isn't showing, check that your `profiles` table has the correct data and your RLS policies are enabled on all tables.
- **Images**: If images aren't loading, check that the `image_url` in the database matches your production storage bucket path.
