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

## 4. 4444Studios org transfer (post-move checklist)

Repository: `https://github.com/4444Studios/deposito626`

### GitHub (done)
- [x] Repo transferred to `4444Studios/deposito626`
- [x] Local clone remote updated
- [ ] **`SUPABASE_ACCESS_TOKEN` secret** — migration CI failed with `Unauthorized` on 2026-07-03; [regenerate a token](https://supabase.com/dashboard/account/tokens) and update the repo secret, then re-run **Remote Migrations**

### Cloudflare Pages (manual — required)
Git integration breaks when a repo moves orgs.

1. Cloudflare dashboard → **Workers & Pages** → your `deposito626` project
2. **Settings → Builds** → reconnect Git → select **`4444Studios/deposito626`**
3. Confirm build command `pnpm run build`, output `dist`, and env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are still set
4. Trigger a manual production deploy

### Supabase dashboard (manual)
Confirm **Authentication → URL configuration** includes:
- `https://deposito626.com` (production)
- Your Cloudflare Pages URL if used
- `http://localhost:5173` (local dev)

Site URL should use the production domain, not `agutie22.github.io`.

### DNS note
`deposito626.com` currently resolves to `198.135.184.22` (Hostinger), not GitHub/Cloudflare IPs. If production is Hostinger, update the VPS git remote:

```bash
git remote set-url origin git@github.com:4444Studios/deposito626.git
```

If production is Cloudflare Pages, ensure DNS points at Cloudflare instead.

---
- **CORS**: Usually handled automatically by Supabase, but ensure your Cloudflare URL is allowed if you see "Origin not allowed" errors.
- **RLS**: If data isn't showing, check that your `profiles` table has the correct data and your RLS policies are enabled on all tables.
- **Images**: If images aren't loading, check that the `image_url` in the database matches your production storage bucket path.
