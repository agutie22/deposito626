# Cloudflare Pages Setup Guide

This project is configured to be deployed on Cloudflare Pages.

## Configuration

1.  **Log in to the Cloudflare Dashboard.**
2.  **Go to "Workers & Pages" > "Create Application" > "Pages" > "Connect to Git".**
3.  **Select the repository `4444Studios/deposito626`.**
4.  **Configure the build settings:**

    *   **Framework preset:** `Vite` (or `None`)
    *   **Build command:** `pnpm run build`
    *   **Build output directory:** `dist`
    *   **Root directory:** `/` (default)

5.  **Environment Variables (Optional):**
    If your app requires environment variables, add them in the "Environment variables" section.

## Verification

After saving and deploying, Cloudflare Pages will build the project. Ensure the build completes successfully and the site is accessible.

## Reconnect after org transfer

If the GitHub repo was moved to the **4444Studios** organization, Cloudflare loses the Git connection. In the Pages project settings, reconnect Git and select **`4444Studios/deposito626`**, then trigger a new deployment.

## Node Version

Cloudflare Pages defaults to a recent Node version, but to ensure consistency with local development (Node 20), you can set the `NODE_VERSION` environment variable to `20` in the Cloudflare Pages project settings if needed, though modern defaults usually work fine.
