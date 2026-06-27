<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/974b33ab-b991-48d0-b466-9d1c564a832e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key
3. Run the app:
   `npm run dev`

## Local Database

The backend uses SQLite through Node's built-in `node:sqlite` module. By default it creates `data/app.sqlite`.

Optional `.env` setting:

`DATABASE_PATH="data/app.sqlite"`

Health check:

`curl http://localhost:3000/api/health`

State API:

`GET /api/state`, `PUT /api/state/:key`, `POST /api/state/bulk`, `DELETE /api/state/:key`

## Production Deployment

This project is deployed as two services:

- Netlify: static React frontend.
- Render: Express API backend with SQLite persistence.

Netlify uses `netlify.toml` to proxy `/api/*` to the Render backend:

`https://cuo-le-me-api.onrender.com/api/*`

Render uses `render.yaml` and needs these environment variables:

- `GEMINI_API_KEY`: set in the Render dashboard, never commit it.
- `GEMINI_MODEL`: defaults to `gemini-2.5-flash-lite`.
- `GEMINI_MODEL_FALLBACKS`: optional comma-separated fallback models, defaults to `gemini-2.5-flash,gemini-2.0-flash`.
- `DATABASE_PATH`: `/var/data/app.sqlite`.
- `NODE_VERSION`: `24.16.0`.

After deployment, verify:

`curl https://cuo-le-me.netlify.app/api/health`

Then test an AI endpoint:

`curl -X POST https://cuo-le-me.netlify.app/api/ai-start-writing -H "Content-Type: application/json" -d '{"contentType":"what","rawInput":"部署检测"}'`

## AI Interaction Flow

Quick note, analysis, and 5Why review now share one backend AI draft endpoint:

`POST /api/ai-assist-note`

The frontend sends the user's text, voice transcript, pain/emotion selections, and uploaded attachment context. Image attachments are compressed in the browser and sent as Gemini `inlineData`; text-like files are sent as short text excerpts; other files are sent as metadata.

The backend calls Gemini with `GEMINI_API_KEY` and returns an editable draft containing:

- quick-note polished text
- emotion and body-signal suggestions
- objective facts
- 5Why draft causes
- improvement strategy
- principle-card trigger, warning signal, and next action

If Gemini is unavailable, times out, or quota is exhausted, the API returns the same JSON shape with `isSimulated: true`, so the app still works and the user can keep editing.
# Deployment trigger Thu Jun 25 18:18:32 CST 2026
