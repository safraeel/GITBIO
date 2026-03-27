# GITBIO

[![Deploy Frontend](https://github.com/safraeel/GITBIO/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/safraeel/GITBIO/actions/workflows/deploy-frontend.yml)
[![Docs Deploy](https://github.com/safraeel/GITBIO/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/safraeel/GITBIO/actions/workflows/deploy-docs.yml)

This repository contains a Vite + React frontend and a Node backend. Below are quick instructions for the two supported GitHub Pages deployment methods included in this repo.

Deployment options
- Option A — GitHub Pages via Actions (recommended): uses `actions/deploy-pages` (workflow: `.github/workflows/deploy-frontend.yml`). This does not commit build artifacts into the repository.
- Option B — Docs folder (alternative): builds `frontend` and commits the static output into the `docs/` folder on `main` (workflow: `.github/workflows/deploy-docs.yml`). Useful if you prefer the built site checked into the repo. The `deploy-docs` workflow ignores `docs/**` to avoid loops.

Local build & preview
```bash
cd frontend
npm ci
npm run build
# serve locally (install serve globally or use any static server)
npx serve -s dist
```

Vite `base` setting
- The frontend is configured for a project site. See `frontend/vite.config.ts` (base is set to `/GITBIO/`). If you rename the repository, update `base` accordingly before building for GitHub Pages.

Enable GitHub Pages
- Option A (deploy-pages): No repo Pages source changes required; Actions will publish using the Pages API when the workflow runs.
- Option B (docs folder): Go to repository Settings → Pages → Build and deployment, set `Source` to `Branch: main` and `Folder: /docs`.

Notes
- Badges above reflect workflow status for the repo `safraeel/GITBIO`.
- The `deploy-docs` workflow commits with `[skip ci]` in the message to reduce CI noise and is configured to ignore pushes that only change `docs/**` so it won't retrigger itself.
