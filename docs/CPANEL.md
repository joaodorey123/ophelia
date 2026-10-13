# Hosting on cPanel

The live site, **callmeophelia.com**, runs on the cPanel hosting as a Node.js app.

```
push to main (or publish in /builder)
   └─ GitHub Actions: .github/workflows/deploy.yml
        ├─ npm ci && next build (output: standalone)
        ├─ upload over FTPS to the app folder (only changed files)
        └─ touch tmp/restart.txt → Passenger restarts the app
```

The build runs on GitHub, not on the hosting: the hosting caps memory at 2 GB
and a Next.js build can exceed that. The running site uses about 170 MB.

## The app folder (`/home/callmeophelia/ophelia-app`)

| Path | What it is |
| --- | --- |
| `app.js` | Startup file (cPanel → Setup Node.js App). Loads `.env.production`, starts the server |
| `.env.production` | Server-only settings, written from the `ENV_FILE` secret on every deploy |
| `server/` | Next.js standalone server with its own `node_modules` |
| `tmp/restart.txt` | Touched at the end of each deploy so Passenger restarts |

The server sits in `server/` because CloudLinux's Node selector reserves
`node_modules` in the app root for its own environment.

## cPanel → Setup Node.js App

- Node.js version: 22
- Application mode: Production
- Application root: `ophelia-app`
- Application URL: `callmeophelia.com`
- Application startup file: `app.js`

Leave "Run NPM Install" alone — the upload already contains everything.

## GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Value |
| --- | --- |
| `FTP_SERVER` | `callmeophelia.com` |
| `FTP_USERNAME` | the FTP account whose home is `ophelia-app` |
| `FTP_PASSWORD` | its password |
| `ENV_FILE` | the lines of the server's `.env` (Shopify, editor, GitHub token, site URL) |

Changing a setting means updating `ENV_FILE` and re-running the workflow
(Actions → Deploy to cPanel → Run workflow).

## Following a publish

The workflow posts a `deploy/cpanel` commit status (pending → success or
failure). The editor at `/builder` reads it to say when an edit is live.
