# julz-command-center — Standing Rules

## REGRESSION GATE (non-negotiable, Julz 2026-06-11)
This repo serves Julz's LIVE link-in-bio page (GitHub Pages -> /link/). A Playwright
suite encodes her locked design decisions (tests/link.spec.ts).

1. **BEFORE any design/content change to link/**: run `npx playwright test` — confirm GREEN baseline.
2. **AFTER the change, BEFORE `git push`**: run `npx playwright test` again — ALL GREEN or do not push.
3. Never push on red. Fix or revert first. Never edit tests to make a regression pass —
   tests change ONLY when Julz changes a locked decision (her review comments).
4. Never touch link/comments.js data or Julz's browser comment storage (her QA system).

Deploys go via GitHub Actions on push to main (.github/workflows/pages.yml).
