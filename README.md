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
- `DATABASE_PATH`: `/var/data/app.sqlite`.
- `NODE_VERSION`: `24.16.0`.

After deployment, verify:

`curl https://cuo-le-me.netlify.app/api/health`

Then test an AI endpoint:

`curl -X POST https://cuo-le-me.netlify.app/api/ai-start-writing -H "Content-Type: application/json" -d '{"contentType":"what","rawInput":"部署检测"}'`
# Deployment trigger Thu Jun 25 18:18:32 CST 2026
