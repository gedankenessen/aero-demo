# Aero demo

This Next.js app demonstrates the Aero `0.0.1` prototype. The public pages serve sample Content from `aero/content`, and the Editor creates and publishes Releases through GitHub.

## Run locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open [the demo](http://localhost:3000). To use `/editor` against this repository, copy `.env.template` to `.env.local` and set `AERO_GITHUB_TOKEN` to a GitHub token with Contents read/write access to `gedankenessen/aero-demo`.

To use the Editor with a local checkout, add `source: "git"` to the settings in `aero.config.ts` and start Next.js from a branch with committed Content.

## Deploy

Import the GitHub repository into Vercel with the Next.js preset and `main` as the production branch. Set `AERO_GITHUB_TOKEN` and `AERO_EDITOR_PASSWORD` in Production. The Editor uses the token to publish Content to `main`, which triggers a new deployment. Unpublished demo Content is visible in the public `aero/releases/*` branches. The public site updates after the production deployment succeeds.

## Verify

```sh
npm run build
npm run test:content
```
