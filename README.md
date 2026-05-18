# SafeHaven — HackDavis 2026

A privacy-first web platform for survivors of domestic violence. The real app is disguised as one of three everyday utilities (Calculator, News, Weather) to protect survivors on shared or monitored devices.

**"Safety, beautifully disguised."**

---

## Visual Design System

SafeHaven features a premium, native-feeling UI across all three cover apps.

- **Calculator:** iOS-style glassmorphism keypad with scientific mode and calculation history.
- **News:** Full Apple News-style reader — full-bleed hero images, frosted glass article modules, accent color extracted from the headline story image, live headlines via NewsAPI.ai.
- **Weather:** Lightweight cover landing page.
- **Palette:** Each cover uses its own palette; the private shell uses warm cream tones.
- **Motion:** Cubic-bezier transitions, sticky-scroll article behavior, smooth tab animations.

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
| Maps | Mapbox GL JS |

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

Open `.env` and fill in each value. The minimum required to boot:

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
[ChatFeature] Friend-gated persistent chat enabled.
[JournalFeature] Private evidence journal initialized.
[JournalFeature] Attachment storage: MongoDB GridFS (journal_attachments).
[AiChatFeature] AI support chat initialized.
[BookmarkFeature] Bookmark system initialized.
[BookmarkFeature] Attachment storage: MongoDB GridFS (bookmark_attachments).
[ButtonFeature] Discreet SOS chat button enabled.
[GeolocationFeature] Opt-in latest-location storage enabled.
[SOSFeature] Trusted-contact SOS messaging enabled.
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
    │   ├── auth_feature.js
    │   ├── chat_feature.js
    │   ├── journal_feature.js
    │   ├── journal_privacy_feature.js
    │   ├── ai_chat_feature.js
    │   ├── bookmark_feature.js
    │   ├── geolocation_feature.js
    │   ├── button_feature.js
    │   ├── friending_feature.js
    │   ├── trusted_contact_feature.js
    │   ├── sos_feature.js
    │   └── pwa_feature.js
    ├── models/
    │   ├── User.js
    │   ├── JournalEntry.js
    │   ├── Bookmark.js
    │   ├── ChatMessage.js
    │   ├── Friend.js
    │   ├── TrustedContact.js
    │   └── UserLocation.js
    ├── lib/
    │   ├── db.js              ← Cached Mongoose connection.
    │   ├── withAuth.js        ← getServerSideProps wrapper.
    │   ├── withOptionalAuth.js
    │   ├── requireAuth.js     ← API route auth guard.
    │   ├── gridfs.js
    │   ├── multerHelper.js
    │   ├── socketServer.js
    │   └── anthropic.js
    ├── middleware/
    │   └── securityHeaders.js
    ├── hooks/
    │   ├── usePrivacyMode.js
    │   ├── useCalculator.js   ← Calculator state machine (std + sci modes).
    │   ├── useChat.js
    │   ├── useSpeechToText.js
    │   └── useGeolocation.js
    ├── utils/
    │   ├── calcUtils.js       ← Pure calculator math helpers.
    │   ├── newsUtils.js       ← Article normalization, background-image helper.
    │   ├── sourceBrands.js    ← Publisher brand map (color + domain) used by story cards and article overlay.
    │   └── colorExtract.js    ← Canvas-based dominant color extraction from images.
    ├── components/
    │   ├── PanicExit.jsx
    │   ├── Button.jsx
    │   ├── WeatherCover.jsx
    │   ├── calc-mode/
    │   │   ├── CalculatorShell.jsx  ← Root calc cover; owns mode/history state.
    │   │   ├── CalculatorDisplay.jsx
    │   │   ├── StdKeypad.jsx        ← Standard keypad layout.
    │   │   ├── SciPad.jsx           ← Scientific function strip.
    │   │   ├── HistoryPanel.jsx     ← Slide-up calculation history.
    │   │   ├── Icons.jsx            ← Shared SVG icons for calc.
    │   │   └── buttonData.js        ← Key definitions for both keypads.
    │   ├── news-mode/
    │   │   ├── NewsShell.jsx        ← Root news cover; fetches all tabs in parallel.
    │   │   ├── FeedHeader.jsx       ← Sticky "Discover" / "World+" / "Sports" header.
    │   │   ├── HeroStory.jsx        ← Parallax full-bleed hero card.
    │   │   ├── FilterRow.jsx        ← Horizontally scrollable category chip row.
    │   │   ├── StorySection.jsx     ← Section with title + story cards.
    │   │   ├── TabBar.jsx           ← Frosted glass pill tab bar + search circle.
    │   │   ├── ArticleOverlay.jsx   ← Full-bleed article reader with sticky title + gated glass scroll.
    │   │   ├── OverlayHeader.jsx    ← Shared back-button header for overlays.
    │   │   ├── SearchOverlay.jsx
    │   │   ├── MenuOverlay.jsx
    │   │   ├── ProfileOverlay.jsx
    │   │   └── newsData.js          ← Static fallback stories + tab/filter definitions.
    │   └── private-mode/
    │       ├── PrivateModeShell.jsx
    │       ├── HomePanel.jsx
    │       ├── JournalPanel.jsx
    │       ├── ChatPanel.jsx
    │       ├── AidPanel.jsx
    │       ├── SosPanel.jsx
    │       ├── MapboxMap.jsx
    │       ├── MomentForYou.jsx
    │       └── OthersJournals.jsx
    ├── pages/
    │   ├── _app.jsx
    │   ├── index.jsx          ← Marketing landing page.
    │   ├── login.jsx
    │   ├── downloads.jsx
    │   ├── dev-test.jsx       ← ⚠ DEV ONLY — delete before shipping.
    │   ├── preview/
    │   │   └── [theme].jsx    ← Unauthenticated preview of each cover app.
    │   ├── app/
    │   │   └── [theme].jsx    ← Auth-gated app shell.
    │   └── api/
    │       ├── auth/          ← register, login, logout
    │       ├── journal/       ← CRUD + attachments + community + heart
    │       ├── bookmarks/     ← CRUD + image upload + from-chat
    │       ├── friends/       ← friend requests + trusted contact upgrade
    │       ├── messages/      ← DM history per friend
    │       ├── trusted-contacts/ ← trusted contact management
    │       ├── geolocation/   ← GET / POST / DELETE latest location
    │       ├── news/          ← headlines proxy (NewsAPI.ai)
    │       ├── aid/           ← nearby shelter/resource lookup
    │       ├── ai-chat/       ← Claude-powered support chat
    │       ├── sos/           ← emergency SOS broadcast
    │       ├── stt/           ← speech-to-text (ElevenLabs)
    │       ├── tts/           ← text-to-speech (ElevenLabs)
    │       └── users/         ← user search
    └── styles/
        ├── globals.css
        ├── Marketing.module.css
        ├── Landing.module.css
        ├── Login.module.css
        ├── ChatRoom.module.css
        ├── JournalPanel.module.css
        ├── AppPreview.module.css
        ├── WeatherCover.module.css
        ├── calc-mode/
        │   ├── calculatorshell.module.css
        │   ├── calculatordisplay.module.css
        │   ├── stdkeypad.module.css
        │   ├── scipad.module.css
        │   └── historypanel.module.css
        ├── news-mode/
        │   ├── newsshell.module.css
        │   ├── feedheader.module.css
        │   ├── herostory.module.css
        │   ├── filterrow.module.css
        │   ├── storysection.module.css
        │   ├── tabbar.module.css
        │   └── overlays.module.css
        └── private-mode/
            ├── shell.module.css
            ├── home.module.css
            ├── chat.module.css
            ├── aid.module.css
            └── sos.module.css
```

---

## Feature Toggle Architecture

All feature flags live in `src/config/config.json`. Set a flag to `true` to activate, `false` to disable.

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
    "enable_sos": true,
    "enable_safety_alert": false,
    "enable_resource_directory": false,
    "enable_crisis_escalation": false
  }
}
```

### Adding a new feature

1. Create `src/features/your_feature.js` with a `static init()` method.
2. Add `"enable_your_feature": false` to `src/config/config.json`.
3. Add the toggle + init call to `src/app.js`.

```javascript
class YourFeature {
  static init(io) {
    console.log('[YourFeature] Initialized.');
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
- Cookie has **no `Max-Age` or `Expires`** — deleted when the browser closes.
- `Secure` flag set in production (HTTPS only).
- No "Remember Me", no localStorage, no sessionStorage for auth.
- All auth routes return `Cache-Control: no-store`.

### Duress password

Each user can set a second password. When used at login, the JWT carries `{ duressMode: true }` and the client can silently wipe sensitive content or show a decoy screen.

### Protecting pages — `withAuth`

```javascript
const { withAuth } = require('../../lib/withAuth');

export const getServerSideProps = withAuth(async (context, session) => {
  // session = { sub, displayName, duressMode }
  return { props: {} };
});
```

### Protecting API routes — `requireAuth`

```javascript
const { requireAuth } = require('../../../lib/requireAuth');

export default requireAuth(async (req, res) => {
  const { sub, displayName } = req.session;
  res.json({ displayName });
});
```

---

## PWA & Privacy Architecture

### Three cover identities

| Cover name | Start URL | Manifest |
|---|---|---|
| Calculator Pro | `/app/calculator` | `public/manifests/calculator.json` |
| Daily News Reader | `/app/news` | `public/manifests/news.json` |
| Weather Now | `/app/weather` | `public/manifests/weather.json` |

### Privacy protections

| Protection | Implementation |
|---|---|
| No caching | Service worker uses network-only fetch; HTTP headers add `no-store` |
| Cache purge on hide | `usePrivacyMode` posts `PURGE_CACHE` to SW when tab is backgrounded |
| History lock | `usePrivacyMode` traps `popstate` |
| Session wipe on hide | `sessionStorage.clear()` on `visibilitychange: hidden` |
| Panic exit — Escape key | Single keypress redirects immediately |
| Panic exit — horizontal swipe | Large horizontal swipe on touch surface |
| Panic exit — corner button | Discreet fixed `✕` button, bottom-right |
| Panic exit — quadruple tap | Rapid quadruple tap triggers safe exit |
| Panic redirect | `POST /api/auth/logout` (keepalive), then `window.location.replace(SAFE_EXIT_URL)` |
| No indexing | `<meta name="robots" content="noindex, nofollow">` on app pages |
| No referrer leakage | `Referrer-Policy: no-referrer` site-wide |
| No autofill | `autocomplete="off"` on all auth inputs |

---

## Cover Apps

### Calculator (`/app/calculator`)

Full-featured iOS-style calculator built in React. Supports standard arithmetic and a slide-up scientific function strip. Calculation history is viewable via a slide-up panel. The entire calculator state is managed in `useCalculator.js`.

**Components:**
- `CalculatorShell` — root; owns mode and history state
- `CalculatorDisplay` — scrolling expression + result display
- `StdKeypad` — standard operations
- `SciPad` — sin, cos, tan, log, √, π, e, etc.
- `HistoryPanel` — slide-up list of past calculations

### News (`/app/news`) — Kiwi News

Apple News-style reader branded as **Kiwi News**. All three tabs (News+, World, Sports) are fetched in parallel on mount. Falls back to curated static stories when the API key is not set.

**Key behaviors:**
- Each tab header shows a custom kiwi-fruit SVG icon, a "🥝 News+" eyebrow, the tab title, and a SUBSCRIBER EDITION circular badge.
- Today tab shows a condensed "FOR YOU" heading above the hero story.
- Filter chips: frosted glass, single row, one chip per category — tapping filters stories by keyword across all sections.
- Search overlay: live full-text search across every fetched article from all tabs; tap a result to open the article reader.
- Story cards show color-coded publisher name + favicon icon + author attribution.
- Article overlay: full-bleed image background, sticky title bar, frosted glass content module. Inner scroll only engages after the title sticks to the top bar (two-phase scroll).
- Profile overlay shows Guest User only (account features not yet implemented).
- Menu overlay shows app version info only.

**Components:** `NewsShell`, `FeedHeader`, `HeroStory`, `FilterRow`, `StorySection`, `TabBar`, `ArticleOverlay`, `OverlayHeader`, `SearchOverlay`, `MenuOverlay`, `ProfileOverlay`

### Weather (`/app/weather`)

Lightweight cover page with weather display and an "Open forecast" link.

---

## News Cover — Architecture Notes

### Two-phase article scroll

The `ArticleOverlay` implements a two-phase scroll to match Apple News behavior:

1. **Phase 1 (outer scroll):** The user scrolls the main container. The article title (`position: sticky`) travels up the page and eventually sticks to the top bar.
2. **Phase 2 (inner scroll):** Once `heroRef.current.getBoundingClientRect().top <= 130`, `glassScrollable` flips to `true` and the frosted glass module becomes `overflow-y: auto`, enabling reading scroll inside the module.

This is enforced by keeping `overflow-y: hidden` on the glass module in CSS and only switching to `auto` via inline style when the state flips.

### Live headline fetch

`NewsShell` fires parallel fetches for all three tabs on mount using `AbortController`:

```javascript
TABS.forEach((t) => fetchTab(t.id));
```

Falls back gracefully to `HERO_STORIES` / `STORY_SECTIONS` from `newsData.js` if the API is unavailable or the key is not set.

---

## Friend-Gated Chat

Socket auth uses the existing HTTP-only `auth_token` cookie. A user can only join a chat room when the `roomId` is an accepted `Friend` relationship ID that includes their account.

### Socket events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join_room` | `{ roomId: friendRelationshipId }` |
| Client → Server | `send_message` | `{ roomId, message }` |
| Server → Client | `chat_history` | `{ roomId, currentUserId, messages }` |
| Server → Client | `receive_message` | `{ id, senderId, senderDisplayName, message, timestamp }` |
| Server → Client | `chat_error` | `{ error }` |

---

## AI Support Chat

Survivors can have a private conversation with a Claude-powered assistant.

**Env var required:** `CLAUDE_API_KEY=sk-ant-...`

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai-chat` | Send conversation history, receive assistant reply |

**Model:** `claude-haiku-4-5-20251001` — fast and cost-efficient.

The system prompt is server-side only. The assistant is instructed to be trauma-informed, surface the National DV Hotline (`1-800-799-7233`) when immediate danger is mentioned, and keep responses concise.

---

## Evidence Journal

| Method | Route | Description |
|---|---|---|
| GET | `/api/journal` | Paginated list (`?page=1&limit=20`) |
| POST | `/api/journal` | Create entry (`{ title?, content, incidentDate? }`) |
| GET | `/api/journal/:id` | Fetch single entry |
| PUT | `/api/journal/:id` | Update text fields |
| DELETE | `/api/journal/:id` | Delete entry + all GridFS attachments |
| POST | `/api/journal/attachment?entryId=` | Upload file (max 50 MB, image/video/audio/pdf) |
| GET | `/api/journal/attachment/:fileId` | Stream file (force-download) |
| DELETE | `/api/journal/attachment/:fileId` | Remove single attachment |
| GET | `/api/journal/community` | Community journal feed (anonymized) |
| POST | `/api/journal/:id/heart` | Heart/un-heart a community entry |

---

## SOS Feature

Sends an emergency message with the user's current location to all accepted trusted contacts.

```
SOS tab → tap Send SOS → browser requests location
  → POST /api/sos
  → server finds accepted Friend relationships
  → writes one ChatMessage per trusted contact chat
  → online contacts receive message via Socket.io
```

Controlled by `config.features.enable_sos`. If disabled, `/api/sos` returns `404`.

---

## Speech & TTS

| Route | Description |
|---|---|
| `POST /api/stt` | Speech-to-text via ElevenLabs |
| `POST /api/tts` | Text-to-speech via ElevenLabs |

**Env var required:** `ELEVENLABS_API_KEY`

⚠ The client-side `useSpeechToText` hook (Web Speech API) is implemented but `onresult` is not reliably firing. The server-side ElevenLabs route is the production path.

---

## Geolocation

Opt-in location storage for trusted-contact sharing.

| Method | Route | Description |
|---|---|---|
| GET | `/api/geolocation` | Return user's saved latest location or `null` |
| POST | `/api/geolocation` | Upsert latest location |
| DELETE | `/api/geolocation` | Clear saved location |

Coordinates older than 5 minutes are rejected. Only the latest location is stored — no movement history.

---

## Aid / Resource Directory

`GET /api/aid/nearby` — Returns nearby shelters, legal aid, and crisis resources using Mapbox.

**Env var required:** `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Bookmarks

| Method | Route | Description |
|---|---|---|
| GET | `/api/bookmarks` | Paginated list (`?page=&limit=&type=`) |
| POST | `/api/bookmarks` | Create bookmark |
| GET/PUT/DELETE | `/api/bookmarks/:id` | Single bookmark CRUD |
| POST | `/api/bookmarks/from-chat` | Auto-create bookmark from an AI response |
| POST | `/api/bookmarks/image?bookmarkId=` | Upload image (replaces previous) |
| GET/DELETE | `/api/bookmarks/image/:fileId` | Serve or remove image |

---

## Git Workflow

### Branch naming

```bash
git checkout -b feature/feature_name
git checkout -b fix/bug_description
```

### Commit types

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `refactor:` | Code change with no behavior change |
| `docs:` | README, comments only |

All code enters `main` through a PR — never push directly to `main`.

---

## Security Headers

Applied via `next.config.js`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`
- `Cache-Control: no-store, no-cache` (auth routes)

---

## Testing Checklist

- [ ] Home page loads & links work
- [ ] Login/Register flow completes
- [ ] Calculator (standard + scientific) fully functional
- [ ] Kiwi News loads with live headlines, tab filters work, search returns results, article overlay two-phase scroll works
- [ ] Weather cover loads
- [ ] SOS button activates private mode
- [ ] Journal entries save with attachments
- [ ] Chat messages persist in friend rooms
- [ ] PWA installs on mobile (all 3 covers)
- [ ] Panic exit clears session and redirects
- [ ] Auth middleware blocks unauthenticated access

---

**Last Updated:** May 17, 2026
**Version:** 1.2.0
**Maintainer:** SafeHaven Team
