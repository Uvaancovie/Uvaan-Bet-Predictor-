# Cloudflare Pages Build Fix — Immediate Resolution Guide

Cloudflare Pages is failing because it detects `bun.lock` in your repository and attempts to run `bun install --frozen-lockfile`. 

Here are the **two instant ways** to resolve this error:

---

### Solution A: The 2-Minute Cloudflare Dashboard Fix (No Git needed!)

You can tell Cloudflare to ignore Bun and use `npm` directly from the Cloudflare Dashboard:

1. In the **Cloudflare Dashboard**, open your project under **Workers & Pages**.
2. Go to **Settings** → **Builds & deployments**.
3. Under **Build configurations**, click **Edit configuration**:
   - Change **Build command** to:
     ```bash
     npm install && npm run build
     ```
   - Make sure **Build output directory** is: `dist`
   - Click **Save**.
4. Now go to **Settings** → **Environment variables**:
   - Click **Add variable** (under Production):
     - **Variable name**: `SKIP_DEPENDENCY_INSTALL`
     - **Value**: `true`
   - Click **Add variable**:
     - **Variable name**: `NODE_VERSION`
     - **Value**: `20`
   - Click **Add variable** (optional, recommended):
     - **Variable name**: `VITE_ODDS_API_KEY`
     - **Value**: `b59370b4edcfdb8e3ef4104f2ca72dac`
   - Click **Save**.
5. Go to the **Deployments** tab, find the failed deployment, click the three dots (`...`), and click **Retry deployment**.
   - Cloudflare will skip the broken `bun install` step and run `npm install && npm run build` successfully.

---

### Solution B: Delete `bun.lock` from the Repository (Permanent Fix)

Because this project is built for Node.js & npm (it already has `package.json` and `package-lock.json`), `bun.lock` is unnecessary.

#### On GitHub:
1. Open your repository on GitHub.
2. Click on the file `bun.lock`.
3. Click the **Trash icon** (Delete this file) in the top-right corner.
4. Click **Commit changes**.
5. Cloudflare Pages will automatically detect the new commit, see `package-lock.json`, and run `npm ci` cleanly.

#### In This Workspace (Ready to execute upon plan approval):
1. Delete `/bun.lock`.
2. Create `/public/_redirects` containing:
   ```
   /*  /index.html  200
   ```
   *(This ensures that clicking refresh or direct linking to tabs on Cloudflare Pages doesn't return a 404).*
3. Verify compilation with `npm run build`.

---

### Verification Checklist Once Deployed
- [ ] Build succeeds on Cloudflare Pages (green checkmark).
- [ ] Visit your Cloudflare Pages URL (e.g. `https://your-project.pages.dev`).
- [ ] Verify the odds dashboard loads live fixtures (Premier League, PSL, Champions League).
- [ ] Verify test bet placement and bankroll simulator work smoothly.
