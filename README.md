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
    │   └── pwa_feature.js     ← Validates PWA manifests exist at startup.
    ├── models/
    │   ├── User.js            ← Mongoose schema: username, bcrypt hashes, display name.
    │   └── JournalEntry.js    ← Schema: title, content, incidentDate, attachments[].
    ├── lib/
    │   ├── db.js              ← Cached Mongoose connection (survives hot reloads).
    │   ├── withAuth.js        ← getServerSideProps wrapper — protects pages.
    │   ├── requireAuth.js     ← API route wrapper — enforces auth on endpoints.
    │   ├── gridfs.js          ← Lazy GridFS bucket helper (journal_attachments).
    │   └── multerHelper.js    ← Multer adapter for Next.js: memoryStorage, 50MB, MIME guard.
    ├── middleware/
    │   └── securityHeaders.js ← Cache-prevention + security headers for auth routes.
    ├── hooks/
    │   ├── usePrivacyMode.js  ← SW registration, history lock, session wipe on hide.
    │   └── useChat.js         ← Socket.io client hook: connect, join room, messages.
    ├── components/
    │   ├── PanicExit.jsx      ← Always-on quick-exit (Escape / triple-tap / button).
    │   └── ChatRoom.jsx       ← Anonymous real-time chat UI.
    ├── pages/
    │   ├── _app.jsx           ← Global CSS import.
    │   ├── index.jsx          ← Landing page: describes app, links to 3 PWA installs.
    │   ├── login.jsx          ← Login / Register page (toggles between modes).
    │   ├── app/
    │   │   └── [theme].jsx    ← Auth-gated app shell for calculator | news | weather.
    │   ├── api/auth/
    │   │   ├── register.js
    │   │   ├── login.js
    │   │   └── logout.js
    │   └── api/journal/
    │       ├── index.js           ← GET (list, paginated) + POST (create entry)
    │       ├── [id].js            ← GET / PUT / DELETE a single entry
    │       └── attachment/
    │           ├── index.js       ← POST upload (multipart/form-data)
    │           └── [fileId].js    ← GET stream + DELETE a file
    └── styles/
        ├── globals.css           ← CSS custom properties, resets. Updated at Figma handoff.
        ├── Landing.module.css    ← Landing page styles. Updated at Figma handoff.
        ├── Login.module.css      ← Login/Register page styles. Updated at Figma handoff.
        └── ChatRoom.module.css   ← Chat UI styles. Updated at Figma handoff.
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
        └── config.features.enable_journal   → JournalFeature.init()
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

> **Location tracking**: Not blocked by default. Geolocation will be needed for the panic/report feature. Decision deferred to the safety alert feature implementation.

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
