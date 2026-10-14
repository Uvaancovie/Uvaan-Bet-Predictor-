# Cloudflare Pages Deployment Fix & Configuration Guide

Resolve the `bun.lock` `UnknownLockfileVersion` build failure and successfully deploy Uvaan's Bet Predictor to Cloudflare Pages for public access.

---

### User Review & Root Cause Diagnosis

> [!CAUTION]
> **Why the Cloudflare build failed**:
> 1. **Bun Lockfile Mismatch**: Cloudflare Pages detected `bun.lock` in the repository root and automatically executed:
>    ```bash
>    bun install --frozen-lockfile
>    ```
> 2. **`UnknownLockfileVersion` on line 2**: The repo's `bun.lock` uses `"lockfileVersion": 2`. Cloudflare's build image is running `bun@1.2.15`, which does not recognize lockfile version 2 and warns `Ignoring lockfile`.
> 3. **Frozen Lockfile Enforcement**: Because Cloudflare passes `--frozen-lockfile`, Bun detects that the lockfile could not be parsed and halts immediately with:
>    ```
>    error: lockfile had changes, but lockfile is frozen
>    Failed: error occurred while installing tools or dependencies
>    ```
> 4. **The Project is Already npm-Native**: The repository contains a complete, verified `package-lock.json` and `package.json`. It does not require Bun to build or run.

---

### 1. Proposed Implementation Steps

#### Step 1: Remove `bun.lock` from the Repository
- Delete `bun.lock` from the project root.
- Cloudflare Pages will detect `package-lock.json` instead and automatically use `npm ci` with Node.js.
- This eliminates the Bun parser error permanently without any custom install flags.

#### Step 2: Add Cloudflare SPA Redirects (`public/_redirects`)
- Single Page Applications built with Vite/Vue require a fallback redirect rule so that direct links and page refreshes don't return 404 on Cloudflare Pages.
- Create `public/_redirects`:
  ```
  /*  /index.html  200
  ```
- Vite automatically copies the `public/` directory into `dist/` during `npm run build`.

#### Step 3: Verify Local & Production Build
- Run `npm run build` locally to confirm the `dist/` directory compiles with zero warnings or errors.
- Confirm all Firebase and Odds API imports compile cleanly.

---

### 2. Cloudflare Pages Dashboard Configuration

When setting up or updating the project in the **Cloudflare Pages** dashboard, use these exact settings:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Framework preset** | `Vite` (or `None`) | Pre-configures Vite build defaults |
| **Build command** | `npm run build` | Compiles Vue 3 + Tailwind into static assets |
| **Build output directory** | `dist` | Default Vite output directory |
| **Root directory** | `/` (leave empty or slash) | Root of the repository |

#### Required Environment Variables in Cloudflare Pages:
In your Cloudflare Pages project, navigate to **Settings** → **Environment variables** → **Production (and Preview)**:

1. **`NODE_VERSION`**: `20` (or `22`)
   *Forces Cloudflare's build environment to use modern LTS Node.js.*
2. **`VITE_ODDS_API_KEY`**: `b59370b4edcfdb8e3ef4104f2ca72dac`
   *Ensures the Odds API key is available during client build and runtime.*

---

### 3. Alternative Option: If You Prefer Using Bun on Cloudflare
If you explicitly want Cloudflare Pages to use Bun instead of npm:
1. In Cloudflare Pages **Settings** → **Environment variables**, set:
   - `BUN_VERSION`: `latest` (or `1.2.4`+)
2. In the project root, run `bun install` locally to ensure `bun.lock` is cleanly aligned before committing.

*(Recommended approach is using standard `npm` as configured in Step 1 for stability and zero deployment friction).*

---

### 4. Verification & Testing Checklist
- [ ] Remove `bun.lock` from workspace.
- [ ] Create `public/_redirects` for SPA routing.
- [ ] Run `compile_applet` to verify compilation.
- [ ] Deploy to Cloudflare Pages and confirm successful build status.
- [ ] Test live Odds API fetching, PSL/EPL fixtures, and Firebase connection in production URL.
