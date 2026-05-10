# Safe Harbor — HackDavis 2026

A privacy-first web platform for survivors of domestic violence. The real app is disguised as one of three everyday utilities (Calculator, News, Weather) to protect survivors on shared or monitored devices.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend / SSR | Next.js 14 (Pages Router) |
| Backend | Node.js + custom HTTP server |
| Real-time | Socket.io |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in HTTP-only session cookies |
| PWA | Web App Manifests + custom Service Worker |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd "HackDavis 2026"
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in each value. Instructions for every key are in `.env.example`. The minimum required to boot:

| Key | How to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers. Ask Lead for the org invite. |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NEXT_PUBLIC_SAFE_EXIT_URL` | Any safe redirect URL (default: `https://www.google.com`) |

### 3. Run

```bash
npm run dev        # development (http://localhost:3000)
npm run build      # production build
npm start          # production server
```

### 4. Verify startup

A healthy boot prints this sequence to the terminal:

```
[PwaFeature] PWA ready. Safe-exit URL: ...
[AuthFeature] Zero-trace auth system initialized.
[ChatFeature] Anonymous chat enabled.
[JournalFeature] Private evidence journal initialized.
[JournalFeature] Attachment storage: MongoDB GridFS (journal_attachments).
[AiChatFeature] AI support chat initialized.
[BookmarkFeature] Bookmark system initialized.
[BookmarkFeature] Attachment storage: MongoDB GridFS (bookmark_attachments).
[ButtonFeature] Discrete SOS chat button enabled.
[GeolocationFeature] Opt-in latest-location storage enabled.
> Ready on http://localhost:3000 [dev]
[AuthFeature] MongoDB connected.
```

If you see `JWT_SECRET is missing` or `MONGODB_URI is missing`, your `.env` is incomplete.

---

## Project Structure

```
HackDavis 2026/
├── server.js                  ← Entry point. Boots Next.js + Socket.io + features.
├── next.config.js             ← Security headers, reactStrictMode.
├── package.json
├── .env                       ← Local secrets. NEVER commit.
├── .env.example               ← Committed template with instructions per key.
│
├── public/
│   ├── manifests/
│   │   ├── calculator.json    ← PWA manifest: "Calculator Pro"
│   │   ├── news.json          ← PWA manifest: "Daily News Reader"
│   │   └── weather.json       ← PWA manifest: "Weather Now"
│   ├── sw.js                  ← Privacy-first service worker (network-only, no cache)
│   └── resources/images/logos/ ← App icons (32, 48, 192, 512px per theme)
│
└── src/
    ├── app.js                 ← Feature orchestrator. Only place features are activated.
    ├── config/
    │   ├── config.json        ← Public feature toggles. Safe to commit.
    │   └── config.js          ← Singleton bridge: merges config.json + .env.
    ├── features/
    │   ├── auth_feature.js    ← Zero-trace auth: register, login, logout controllers.
    │   ├── chat_feature.js    ← Anonymous Socket.io chat rooms.
    │   ├── journal_feature.js ← Private evidence journal init + readiness logging.
    │   ├── ai_chat_feature.js ← AI support chat init (validates CLAUDE_API_KEY).
    │   ├── bookmark_feature.js← Bookmark system init + readiness logging.
    │   ├── geolocation_feature.js ← Opt-in latest-location storage readiness logging.
    │   ├── button.js          ← Discrete SOS chat access button readiness logging.
    │   └── pwa_feature.js     ← Validates PWA manifests exist at startup.
    ├── models/
    │   ├── User.js            ← Mongoose schema: username, bcrypt hashes, display name.
    │   ├── JournalEntry.js    ← Schema: title, content, incidentDate, attachments[].
    │   ├── Bookmark.js        ← Schema: content, title, type, image, tags.
    │   └── UserLocation.js    ← Schema: one latest GeoJSON location per user.
    ├── lib/
    │   ├── db.js              ← Cached Mongoose connection (survives hot reloads).
    │   ├── withAuth.js        ← getServerSideProps wrapper — protects pages.
    │   ├── requireAuth.js     ← API route wrapper — enforces auth on endpoints.
    │   ├── gridfs.js          ← Lazy GridFS buckets: journal_attachments + bookmark_attachments.
    │   ├── multerHelper.js    ← Multer adapter for Next.js: memoryStorage, 50MB, MIME guard.
    │   └── anthropic.js       ← Lazy Anthropic client singleton (reads CLAUDE_API_KEY).
    ├── middleware/
    │   └── securityHeaders.js ← Cache-prevention + security headers for auth routes.
    ├── hooks/
    │   ├── usePrivacyMode.js  ← SW registration, history lock, session wipe on hide.
    │   ├── useChat.js         ← Socket.io client hook: connect, join room, messages.
    │   ├── useSpeechToText.js ← Web Speech API hook. ⚠ NOT YET WORKING — needs investigation.
    │   └── useGeolocation.js  ← Browser watchPosition + latest-location API calls.
    ├── components/
    │   ├── PanicExit.jsx      ← Always-on quick-exit (Escape / triple-tap / button).
    │   ├── ChatRoom.jsx       ← Anonymous real-time chat UI.
    │   ├── LocationCapture.jsx ← Live coordinate tester + clear control.
    │   ├── Button.jsx         ← Discrete SOS chat access control.
    │   ├── CalculatorCover.jsx ← Calculator disguise UI.
    │   ├── NewsCover.jsx      ← News disguise UI.
    │   └── WeatherCover.jsx   ← Weather disguise UI.
    ├── pages/
    │   ├── _app.jsx           ← Global CSS import.
    │   ├── index.jsx          ← Landing page: describes app, links to 3 PWA installs.
    │   ├── login.jsx          ← Login / Register page (toggles between modes).
    │   ├── dev-test.jsx       ← ⚠ DEV ONLY — delete before shipping. Tests AI chat, bookmarks, STT.
    │   ├── app/
    │   │   └── [theme].jsx    ← Auth-gated app shell for calculator | news | weather.
    │   ├── api/auth/
    │   │   ├── register.js
    │   │   ├── login.js
    │   │   └── logout.js
    │   ├── api/journal/
    │   │   ├── index.js           ← GET (list, paginated) + POST (create entry)
    │   │   ├── [id].js            ← GET / PUT / DELETE a single entry
    │   │   └── attachment/
    │   │       ├── index.js       ← POST upload (multipart/form-data)
    │   │       └── [fileId].js    ← GET stream + DELETE a file
    │   ├── api/ai-chat/
    │   │   └── index.js           ← POST — sends conversation to Claude, returns response
    │   ├── api/bookmarks/
    │   │   ├── index.js           ← GET (list, paginated + type filter) + POST (create)
    │   │   ├── [id].js            ← GET / PUT / DELETE a single bookmark
    │   │   ├── from-chat.js       ← POST — auto-creates bookmark from an AI response
    │   │   └── image/
    │   │       ├── index.js       ← POST upload image (images only, replaces previous)
    │   │       └── [fileId].js    ← GET inline stream + DELETE
    │   ├── api/geolocation/
    │   │   └── index.js       ← GET latest + POST upsert + DELETE clear.
    │   ├── api/news/
    │   │   └── headlines.js   ← News cover headline API.
    └── styles/
        ├── globals.css           ← CSS custom properties, resets. Updated at Figma handoff.
        ├── Landing.module.css    ← Landing page styles. Updated at Figma handoff.
        ├── Login.module.css      ← Login/Register page styles. Updated at Figma handoff.
        ├── ChatRoom.module.css   ← Chat UI styles. Updated at Figma handoff.
        ├── CalculatorCover.module.css
        ├── NewsCover.module.css
        └── WeatherCover.module.css
```

---

## Feature Toggle Architecture

All feature flags live in `src/config/config.json`. Set a flag to `true` to activate a feature, `false` to disable it completely — no code from a disabled feature ever executes.

```json
{
  "features": {
    "enable_pwa": true,
    "enable_auth_system": true,
    "enable_anonymous_chat": true,
    "enable_journal": true,
    "enable_ai_chat": true,
    "enable_bookmarks": true,
    "enable_button": true,
    "enable_geolocation": true,
    "enable_safety_alert": false,
    "enable_resource_directory": false,
    "enable_crisis_escalation": false
  }
}
```

### How the pipeline works

```
server.js
  └── src/app.js (orchestrator)
        ├── config.features.enable_pwa       → PwaFeature.init()
        ├── config.features.enable_auth      → AuthFeature.init()
        ├── config.features.enable_chat      → ChatFeature.init(io)
        ├── config.features.enable_journal   → JournalFeature.init()
        ├── config.features.enable_ai_chat   → AiChatFeature.init()
        ├── config.features.enable_bookmarks → BookmarkFeature.init()
        ├── config.features.enable_button    → ButtonFeature.init()
        └── config.features.enable_geolocation → GeolocationFeature.init()
```

`src/config/config.js` is the **singleton bridge** — it merges `config.json` (public flags, committed) with `.env` (private secrets, local-only). Every `require('./config/config')` across the app returns the same cached object.

### Adding a new feature

1. Create `src/features/your_feature.js` with a `static init()` method.
2. Add `"enable_your_feature": false` to `src/config/config.json`.
3. Add the toggle + init call to `src/app.js` (follow the existing pattern).
4. Flip the flag to `true` when ready to test.

```javascript
// src/features/your_feature.js
class YourFeature {
  static init(io) {
    console.log('[YourFeature] Initialized.');
    // register routes, connect DB collections, set up listeners, etc.
  }
}
module.exports = { YourFeature };
```

---

## Auth System

### Endpoints

| Method | Route | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ username, password, duressPassword? }` |
| POST | `/api/auth/login` | `{ username, password }` |
| POST | `/api/auth/logout` | _(none)_ |

### Zero-trace rules

- Auth token lives in an **HTTP-only, SameSite=Strict cookie** — JavaScript cannot read it.
- Cookie has **no `Max-Age` or `Expires`** — it is deleted when the browser closes.
- `Secure` flag is set in production (HTTPS only).
- No "Remember Me", no localStorage, no sessionStorage for auth.
- All auth routes return `Cache-Control: no-store` so responses are never cached.

### Duress password

Each user can optionally set a second password. When the duress password is used at login:
- The JWT payload carries `{ duressMode: true }`.
- The client can use this to silently wipe sensitive content or show a decoy screen.
- The abuser sees a normal-looking app. The survivor gets a safe view.

### Protecting pages — `withAuth`

Wrap `getServerSideProps` on any page that requires a valid session:

```javascript
const { withAuth } = require('../../lib/withAuth');

export const getServerSideProps = withAuth(async (context, session) => {
  // session = { sub, displayName, duressMode }
  return { props: { anything: true } };
});
```

Redirects to `/login` if the cookie is missing or expired. On expiry, clears the stale cookie automatically.

### Protecting API routes — `requireAuth`

Wrap any API route handler that needs a verified session:

```javascript
const { requireAuth } = require('../../../lib/requireAuth');

export default requireAuth(async (req, res) => {
  const { sub, displayName } = req.session;
  res.json({ displayName });
});
```

Returns `401` with a JSON error if the token is missing or invalid.

### User flow

```
/ (landing)
  └── /app/[theme]  →  withAuth check
        ↓ no valid cookie
      /login  →  POST /api/auth/login  →  cookie set
        ↓ success
      /app/[theme]  (authenticated)
```

The login page also skips itself if a valid cookie already exists (redirects straight to `/app/calculator`).

---

## PWA & Privacy Architecture

### Three cover identities

| Cover name | Start URL | Manifest |
|---|---|---|
| Calculator Pro | `/app/calculator` | `public/manifests/calculator.json` |
| Daily News Reader | `/app/news` | `public/manifests/news.json` |
| Weather Now | `/app/weather` | `public/manifests/weather.json` |

Chrome distinguishes the three as separate installed apps via the `"id"` field in each manifest.

### Installing on a device

1. Open `http://localhost:3000` (or the deployed URL).
2. Tap one of the three app cards.
3. The browser navigates to `/app/[theme]` which links the correct manifest.
4. Chrome/Safari shows "Add to Home Screen" — install from there.
5. The app appears on the home screen with its cover icon and name.

### Privacy protections active in the app shell

| Protection | Implementation |
|---|---|
| No caching | Service worker (`public/sw.js`) uses network-only fetch; HTTP headers add `no-store` |
| Cache purge on hide | `usePrivacyMode` posts `PURGE_CACHE` to SW when tab is backgrounded |
| History lock | `usePrivacyMode` traps `popstate` — the back button goes nowhere |
| Session wipe on hide | `sessionStorage.clear()` fires on `visibilitychange: hidden` |
| Panic exit — Escape key | Single keypress redirects immediately |
| Panic exit — triple-tap | Three taps within 600ms on any touch surface |
| Panic exit — corner button | Discreet fixed `✕` button, bottom-right |
| Panic redirect | Calls `POST /api/auth/logout` (`keepalive: true`) to clear the auth cookie, then `window.location.replace(NEXT_PUBLIC_SAFE_EXIT_URL)` — removes history entry |
| No indexing | `<meta name="robots" content="noindex, nofollow">` on app shell pages |
| No referrer leakage | `Referrer-Policy: no-referrer` site-wide |
| No autofill | `autocomplete="off"` / `autocomplete="new-password"` on all auth inputs |
| Password visibility toggle | Show/Hide button on each password field — no clipboard or autofill exposure |
| Opt-in geolocation | Browser permission required; latest location stored only after user action |

---

## Git Workflow

### Branch naming

```bash
git checkout -b feature/feature_name   # new feature
git checkout -b fix/bug_description    # bug fix
```

### Committing and pushing

```bash
git add <specific files>              # never use git add -A blindly
git commit -m "type: brief description"
git push origin feature/feature_name
```

### Pull Requests

All code enters `main` through a PR — never push directly to `main`. Open the PR on GitHub and request a review from the Lead before merging.

### Branch cleanup (after PR is merged)

```bash
git branch -d feature/feature_name          # safe delete
git branch -D feature/feature_name          # force delete — ask Lead first
```

### Commit types

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `refactor:` | Code change with no behavior change |
| `docs:` | README, comments only |

---

## Anonymous Chat

The chat system is live end-to-end. Rooms are ephemeral — they exist only while sockets are connected and no messages are persisted.

### How it works

| Layer | File | Responsibility |
|---|---|---|
| Server events | `src/features/chat_feature.js` | `join_room`, `send_message`, `disconnect` handlers |
| Client hook | `src/hooks/useChat.js` | Socket.io connection, room join, message state |
| UI component | `src/components/ChatRoom.jsx` | Message list, composer, own/other bubble detection |

### Socket events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join_room` | `{ roomId }` |
| Client → Server | `send_message` | `{ roomId, message }` |
| Server → Client | `receive_message` | `{ senderId, message, timestamp }` |
| Server → Client | `user_joined` | `{ roomId }` |

Message ownership is determined by comparing `msg.senderId` to the socket's own ephemeral `socket.id`. No persistent user identity is used.

### Using ChatRoom in a page

```jsx
import ChatRoom from '../components/ChatRoom';

// session.displayName comes from withAuth → JWT payload
<ChatRoom roomId="general" displayName={session.displayName} />
```

Room IDs are arbitrary strings. Future features (resource directory, crisis escalation) will use specific room IDs per resource or counselor session.

---

## AI Support Chat

Survivors can have a private conversation with a Claude-powered assistant that provides emotional support, safety planning, and local resource referrals (lawyers, shelters, therapists, hotlines).

### Env var required

```
CLAUDE_API_KEY=sk-ant-...
```

Add this to `.env` locally and to Railway environment variables in production. Get a key from the shared Anthropic workspace or create one at console.anthropic.com.

### API

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai-chat` | Send conversation history, receive assistant reply |

**Request body:**
```json
{ "messages": [{ "role": "user", "content": "I need help finding a lawyer in Sacramento" }] }
```

**Response:**
```json
{ "message": "Here are some legal aid options in Sacramento...", "role": "assistant" }
```

### System prompt behavior

The assistant is instructed to:
- Be trauma-informed and non-judgmental
- Surface the National DV Hotline (`1-800-799-7233`) when immediate danger is mentioned
- Ask for city/state when suggesting local resources
- Never diagnose mental health conditions
- Keep responses concise (survivors may be reading quickly)

The system prompt is server-side only — never exposed to the client.

### Model

`claude-haiku-4-5-20251001` — fast and cost-efficient for a support chat context.

---

## Bookmarks

Survivors can save AI suggestions, resource links, and personal notes. Each bookmark can optionally have an image attachment.

### API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/bookmarks` | Paginated list (`?page=&limit=&type=`) |
| POST | `/api/bookmarks` | Create bookmark (`{ content, title?, type?, tags? }`) |
| GET | `/api/bookmarks/:id` | Fetch single bookmark |
| PUT | `/api/bookmarks/:id` | Update title, content, tags |
| DELETE | `/api/bookmarks/:id` | Delete bookmark + image from GridFS |
| POST | `/api/bookmarks/from-chat` | Auto-create bookmark from an AI response (title auto-generated) |
| POST | `/api/bookmarks/image?bookmarkId=` | Upload image (images only, replaces previous) |
| GET | `/api/bookmarks/image/:fileId` | Serve image inline |
| DELETE | `/api/bookmarks/image/:fileId` | Remove image |

### Bookmark types

| Type | When to use |
|---|---|
| `ai_suggestion` | Saved from AI chat via `from-chat` endpoint |
| `resource` | A lawyer, shelter, hotline the user wants to remember |
| `note` | Freeform user note |

### Auto-bookmark from chat

`POST /api/bookmarks/from-chat` takes `{ content }` (the AI message text), auto-generates a title from the first sentence, sets type to `ai_suggestion`, and tags it `["chat"]`. Used by the chat UI's 📌 bookmark button.

---

## Speech to Text

⚠ **Not yet working** — hook is implemented (`src/hooks/useSpeechToText.js`) but `onresult` is not firing in testing. Needs further investigation (possible Chrome Web Speech API / network access issue). Do not block UI work on this.

### Hook API (when fixed)

```jsx
import { useSpeechToText } from '../hooks/useSpeechToText';

const { transcript, listening, supported, startListening, stopListening, clearTranscript } = useSpeechToText();
```

| Return | Type | Description |
|---|---|---|
| `transcript` | string | Accumulated text from current session |
| `listening` | boolean | True while mic is active |
| `supported` | boolean | False on Firefox / Safari — hide the button |
| `startListening()` | fn | Begin capture |
| `stopListening()` | fn | End capture |
| `clearTranscript()` | fn | Reset to `''` |

---

## Dev Test Page

`src/pages/dev-test.jsx` — **delete before shipping.**

Accessible at `/dev-test` (must be logged in). Tests AI chat with live voice input, bookmark CRUD with image upload, and standalone STT. Used during backend development before UI is designed.

---

## Geolocation

The geolocation feature is an opt-in foundation for future trusted-contact sharing. The app can request the survivor's current browser location, save the latest coordinates for their own account, and show live coordinates in the app for testing.

No friends/trusted-contact access exists yet. That sharing layer should be added later with explicit relationship and consent checks.

### API routes

All geolocation routes are protected by `requireAuth`, so requests require a valid HTTP-only auth cookie.

| Method | Route | Description |
|---|---|---|
| GET | `/api/geolocation` | Return the signed-in user's saved latest location, or `null` |
| POST | `/api/geolocation` | Upsert latest location from browser coordinates |
| DELETE | `/api/geolocation` | Clear the signed-in user's saved location |

### POST body

```json
{
  "latitude": 38.5449,
  "longitude": -121.7405,
  "accuracy": 25,
  "altitude": null,
  "altitudeAccuracy": null,
  "heading": null,
  "speed": null,
  "capturedAt": "2026-05-09T22:00:00.000Z"
}
```

Validation rules:
- `latitude` must be between `-90` and `90`.
- `longitude` must be between `-180` and `180`.
- `capturedAt` must be a valid date.
- Coordinates older than 5 minutes are rejected.
- Future timestamps more than 5 minutes ahead are rejected.

### Storage

| Data | Location |
|---|---|
| Latest location | MongoDB `userlocations` collection |
| User ownership | `userId` references the authenticated `User` |
| Coordinates | GeoJSON Point stored as `[longitude, latitude]` |
| Optional metadata | accuracy, altitude, altitudeAccuracy, heading, speed |

The model enforces one location document per user with a unique `userId`. Every save overwrites the previous location, so the app does not store a movement history.

### Client behavior

| Layer | File | Responsibility |
|---|---|---|
| Feature init | `src/features/geolocation_feature.js` | Logs readiness when enabled |
| API route | `src/pages/api/geolocation/index.js` | GET / POST / DELETE latest location |
| Model | `src/models/UserLocation.js` | Mongoose schema + GeoJSON index |
| Hook | `src/hooks/useGeolocation.js` | Uses `navigator.geolocation.watchPosition` |
| UI | `src/components/LocationCapture.jsx` | Live coordinates, stop live, clear |

The UI exposes a `Live coordinates` button. It starts `watchPosition`, displays latitude/longitude, and posts each browser-provided update to `/api/geolocation`.

There is no fixed update interval. Browsers send `watchPosition` updates when the device/location provider has a new reading. On laptops, updates may be infrequent; on phones, updates are more likely while moving.

### Privacy notes

- Browser location permission is required before coordinates are collected.
- The app does not load third-party map tiles for this feature.
- Only the latest location is stored.
- `DELETE /api/geolocation` clears the saved location.
- Friend/trusted-contact sharing is not implemented yet.

---

## Evidence Journal

Survivors can privately document experiences and attach proof-of-abuse media. All data is user-scoped — no entry or file is accessible by any other account.

### API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/journal` | Paginated list of the user's entries (`?page=1&limit=20`) |
| POST | `/api/journal` | Create entry (`{ title?, content, incidentDate? }`) |
| GET | `/api/journal/:id` | Fetch a single entry |
| PUT | `/api/journal/:id` | Update text fields (`title`, `content`, `incidentDate`) |
| DELETE | `/api/journal/:id` | Delete entry and all its attachments from GridFS |
| POST | `/api/journal/attachment?entryId=` | Upload a file (multipart `file` field) |
| GET | `/api/journal/attachment/:fileId` | Stream the file to the client (force-download) |
| DELETE | `/api/journal/attachment/:fileId` | Remove a single attachment |

### Storage

| Data | Location |
|---|---|
| Entry text + metadata | MongoDB `journalentries` collection |
| Binary files | MongoDB GridFS `journal_attachments` bucket |

### File constraints

- **Max size:** 50 MB per file
- **Allowed types:** `image/*`, `video/*`, `audio/*`, `application/pdf`

### Privacy notes

- Attachment downloads use `Content-Disposition: attachment` to force a Save dialog rather than inline rendering, reducing browser history exposure.
- DELETE on an entry cascades through GridFS — no orphaned files left behind.
- All queries include `{ userId }` as a predicate; mismatched IDs return 404 (no data leakage).

### UI

Journal UI is deferred to the design handoff. All backend routes are ready and tested via API client (Postman/curl).

---

## UI / Design Handoff

All pages and components are functional placeholders. When the Figma/Open Design handoff arrives:

| File to replace | What changes |
|---|---|
| `src/styles/globals.css` | Design system tokens (colors, typography, spacing) |
| `src/styles/Landing.module.css` | Landing page layout and visual design |
| `src/styles/Login.module.css` | Login/Register form visual design |
| `src/styles/ChatRoom.module.css` | Chat UI visual design |
| `src/pages/index.jsx` | Content/copy and markup structure |
| `src/pages/app/[theme].jsx` | Cover UI (calculator/news/weather disguise screens) |

All React component logic, hooks, and API calls survive the handoff unchanged. Only CSS modules and markup structure get updated.





MORE ON OUR COVER PAGES
**Cover Pages**
The app supports three disguise cover pages through the shared `/app/[theme]` route. Each cover is selected by the `theme` URL param and keeps the protected app shell, PWA manifest, privacy hooks, panic exit, and login button behavior intact.

**Calculator Cover**
Route: `/app/calculator`

The calculator cover renders a functional basic calculator UI inside the authenticated app shell. It is built as a local React component and does not use external APIs or third-party services. The design is meant to look like a normal everyday calculator app while preserving access to the app’s privacy protections.

Key files:
```text
src/components/CalculatorCover.jsx
src/styles/CalculatorCover.module.css
public/manifests/calculator.json
```

**News Cover**
Route: `/app/news`

The news cover renders a dark, mobile-friendly news reader UI. It uses live headline data from NewsAPI.ai through a protected server-side API route, so the API key is never exposed to the browser. If the API key is missing or the request fails, the page silently falls back to static demo news content so the disguise still looks polished.

The client requests:

```text
GET /api/news/headlines?tab=today|world|sports
```

The server fetches articles from NewsAPI.ai/Event Registry, normalizes the data, and returns only the fields the UI needs:

```text
source
headline
description
content
image
url
publishedAt
```

Key files:
```text
src/components/NewsCover.jsx
src/styles/NewsCover.module.css
src/pages/api/news/headlines.js
src/config/config.js
public/manifests/news.json
```

Environment variable:
```text
NEWSAPI_AI_KEY=
```

**Weather Cover**
Route: `/app/weather`

The weather cover renders a lightweight Weather Now screen inside the authenticated app shell. It does not fetch live weather data directly. Instead, it provides a disguised weather landing page with an `Open forecast` link that sends the user to AccuWeather only when clicked. This keeps the first screen looking like a weather app without adding a new API dependency.

Key files:
```text
src/components/WeatherCover.jsx
src/styles/WeatherCover.module.css
public/manifests/weather.json
```

**Shared Route Logic**
All three covers are selected in:

```text
src/pages/app/[theme].jsx
```

Current routing behavior:

```text
/app/calculator -> CalculatorCover
/app/news       -> NewsCover
/app/weather    -> WeatherCover
```

If the user is not authenticated, `withAuth` redirects them to `/login` before showing any cover page.
