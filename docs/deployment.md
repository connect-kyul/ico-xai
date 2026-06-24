# Web Deployment

## Production build

```powershell
npm.cmd install
npm.cmd run build --workspace @ico-xai/web
npm.cmd run start --workspace @ico-xai/web -- --hostname 0.0.0.0 --port 3000
```

## Vercel settings

- Framework preset: Next.js
- Root directory: `apps/web`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave empty/default

The web app includes `apps/web/vercel.json` with these settings. Vercel will automatically serve the Next.js output, so do not override the Output Directory to `public`.

If you deploy from the repository root instead, use:

- Install command: `npm install`
- Build command: `npm run build --workspace @ico-xai/web`
- Output directory: leave empty/default for Next.js unless Vercel asks for a custom output.

## Required environment variables

Copy `apps/web/.env.example` and set real values in the deployment provider.

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

## OAuth callback URLs

Register these redirect URLs in the provider dashboards.

For production:

- Google: `https://your-domain.example/api/auth/callback/google`
- Discord: `https://your-domain.example/api/auth/callback/discord`

For local testing:

- Google: `http://localhost:3000/api/auth/callback/google`
- Discord: `http://localhost:3000/api/auth/callback/discord`

For Vercel preview deployments, add the preview domain callback too when testing OAuth on previews:

- Google: `https://your-preview-url.vercel.app/api/auth/callback/google`
- Discord: `https://your-preview-url.vercel.app/api/auth/callback/discord`

## Login behavior

The app uses NextAuth with JWT sessions. Google and Discord providers are enabled only when their client ID and secret environment variables are present. This lets production deploys fail closed instead of exposing broken provider configuration.

## Secret handling note

The onboarding screen intentionally does not persist API keys yet. For production use, API keys should be encrypted server-side with a database and KMS/secret manager. Do not store provider keys in browser local storage.

## CSS check

After deployment, open the page source and verify that the linked file under `/_next/static/css/` returns `200`. If local CSS appears missing during development, stop old Node processes and remove `apps/web/.next`, then rebuild.
