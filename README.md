# SafeHaven — HackDavis 2026

## The Platform for Safety You Can Hide

SafeHaven is a privacy-first crisis support platform designed specifically for survivors of domestic violence. Built on the principle that **safety should never be obvious**, SafeHaven disguises itself as three everyday smartphone utilities—**Calculator**, **News Reader**, and **Weather App**—so it remains invisible to someone monitoring your device.

**The real work happens inside.** Once accessed, survivors gain a private sanctuary with:
- **Emergency SOS messaging** to trusted contacts with your location
- **Evidence journaling** with encrypted storage for documentation
- **Trauma-informed AI support** available 24/7 without judgment
- **Community connection** with anonymous shared stories and resources
- **Safety planning tools** including resource directories and legal guidance
- **Zero-trace browsing** — no history, no caching, no digital footprint

All data is encrypted and stored securely. The app leaves no trace when closed. Perfect for shared, monitored, or communal devices where safety depends on discretion.

**"Safety, beautifully disguised."**

---

## Experience Design

SafeHaven is more than functional—it's beautiful and intuitive, making the cover apps genuinely usable while the private shell feels like a sanctuary.

### The Cover Layer
Each disguise app is fully functional and indistinguishable from the real thing:

- **Calculator:** Professional iOS-style glassmorphism keypad with standard and advanced scientific modes, calculation history, and real-time display. Supports full expression evaluation with parentheses, trigonometric functions, logarithms, and powers.
- **News Reader (Kiwi News):** Premium Apple News-inspired feed with live headlines from 40+ major news sources across Today, World, and Sports. Includes full-text article search, category filtering, color-coded publishers, and two-phase scroll physics for immersive reading.
- **Weather:** Lightweight weather forecast page—a simple, deniable landing screen.
- **Design System:** Each cover uses a distinct color palette for authenticity; the private sanctuary uses warm cream and earth tones for psychological safety. Smooth cubic-bezier transitions, sticky navigation headers, and optimized touch targets throughout.

### The Private Sanctuary
Once inside, the interface transforms to a supportive, trauma-informed design with intuitive navigation and accessible features.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (Pages Router) + React 18 | Server-side rendering for dynamic cover content; fast, optimized UX |
| **Backend** | Node.js + custom HTTP server | Custom server enables Socket.io WebSocket for real-time features |
| **Real-time Communication** | Socket.io | Friend-gated chat and SOS notifications |
| **Database** | MongoDB Atlas + Mongoose | Encrypted user data, journal entries, messages, trusted contacts |
| **Authentication** | JWT + HTTP-only cookies | Zero-trace auth; tokens deleted on browser close |
| **File Storage** | MongoDB GridFS | Encrypted media for journal attachments and bookmarks |
| **Maps** | Mapbox GL JS | Location-based resource discovery (shelters, legal aid, hotlines) |
| **AI Support** | Google Gemma (via OpenRouter) | Fast, cost-efficient trauma-informed support conversation |
| **Progressive Web App** | Web App Manifests + Service Worker | Installable on iOS/Android; network-only caching for privacy |

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

Open `.env` and fill in each required value. You need at minimum:

| Key | How to Get It | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas → New Project → Clusters → Connect → Drivers | `mongodb+srv://user:pass@cluster.mongodb.net/safehaven` |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | `a1b2c3d4e5f6...` (64 hex chars) |
| `NEXT_PUBLIC_SAFE_EXIT_URL` | Any safe redirect (default: Google.com) | `https://www.google.com` |
| `OPENROUTER_API_KEY` | OpenRouter → API Keys (free tier available) | `sk-or-v1-...` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox → Account → API tokens | `pk.eyJ1...` |

Optional but recommended:

| Key | Purpose |
|---|---|
| `ELEVENLABS_API_KEY` | Text-to-speech and speech-to-text (for journal audio) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Resource/shelter discovery on maps |

### 3. Run

```bash
npm run dev        # development (http://localhost:3000)
npm run build      # production build
npm start          # production server
```

### 4. Verify startup

When the server starts successfully, you'll see this feature initialization sequence:

```
[PwaFeature] PWA ready. Safe-exit URL: https://www.google.com
[AuthFeature] Zero-trace auth system initialized.
[ChatFeature] Friend-gated real-time messaging enabled.
[JournalFeature] Private evidence journal initialized.
[JournalFeature] Attachment storage: MongoDB GridFS (journal_attachments).
[JournalPrivacyFeature] Community journal with anonymized entries initialized.
[AiChatFeature] AI support conversation initialized.
[BookmarkFeature] Bookmark system initialized.
[BookmarkFeature] Attachment storage: MongoDB GridFS (bookmark_attachments).
[ButtonFeature] Discreet SOS corner button enabled.
[GeolocationFeature] Location storage enabled.
[FriendFeature] Friend system initialized.
[TrustedContactFeature] Trusted contact SOS enabled.
[SosFeature] Emergency SOS messaging enabled.
> Ready on http://localhost:3000 [dev]
[AuthFeature] MongoDB connected.
```

**If you see errors:**
- `JWT_SECRET is missing` → add to `.env`
- `MONGODB_URI is missing` → add to `.env`
- `OPENROUTER_API_KEY is missing` → add for AI chat (optional but recommended)

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
    ├── services/
    │   ├── authService.js
    │   ├── chatSocketService.js
    │   ├── journalService.js
    │   ├── journalPrivacyService.js
    │   ├── aiChatService.js
    │   ├── bookmarkService.js
    │   ├── geolocationService.js
    │   ├── buttonService.js
    │   ├── friendService.js
    │   ├── trustedContactService.js
    │   ├── sosService.js
    │   └── pwaService.js
    ├── models/
    │   ├── User.js            ← User account with password hash, duress mode.
    │   ├── JournalEntry.js    ← Evidence journal entries with media attachments.
    │   ├── Bookmark.js        ← Saved articles, links, and resources.
    │   ├── ChatMessage.js     ← Friend-to-friend chat messages.
    │   ├── Friend.js          ← Friend connection and requests.
    │   ├── TrustedContact.js  ← Trusted contacts for SOS alerts.
    │   └── UserLocation.js    ← Latest GPS location for sharing and SOS.
    ├── lib/
    │   ├── db.js              ← Cached Mongoose connection singleton.
    │   ├── withAuth.js        ← getServerSideProps wrapper for auth-required pages.
    │   ├── withOptionalAuth.js ← getServerSideProps wrapper for optional auth pages.
    │   ├── requireAuth.js     ← API route auth guard middleware.
    │   ├── gridfs.js          ← MongoDB GridFS helper for file uploads.
    │   ├── multerHelper.js    ← Multer configuration for file handling.
    │   ├── socketServer.js    ← Socket.io server initialization.
    │   └── openrouter.js      ← OpenRouter API client for AI chat (Google Gemma)
    ├── middleware/
    │   ├── securityHeaders.js ← Sets security headers (CSP, X-Frame-Options, etc.).
    │   └── rateLimit.js       ← Rate limiting for API endpoints.
    ├── hooks/
    │   ├── usePrivacyMode.js  ← Privacy hardening: SW cleanup, history lock, panic helpers.
    │   ├── useCalculator.js   ← Calculator state machine (std + sci modes).
    │   ├── useChat.js         ← Chat message state and Socket.io integration.
    │   ├── useSpeechToText.js ← Web Speech API integration for voice input.
    │   └── useGeolocation.js  ← Geolocation API and state management.
    ├── utils/
    │   ├── calcUtils.js       ← Pure calculator math helpers.
    │   ├── newsUtils.js       ← Article normalization, background-image helper.
    │   ├── sourceBrands.js    ← Publisher brand map (color + domain) used by story cards and article overlay.
    │   ├── colorExtract.js    ← Canvas-based dominant color extraction from images.
    │   └── chatUtils.js       ← Chat utilities: initialsForName, normalizeFriend, normalizeApiMessages.
    ├── components/
    │   ├── PanicExit.jsx      ← Escape key, swipe, and corner button exit triggers.
    │   ├── PrivateModeButton.jsx ← Discreet orange corner button for app access.
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
    │   ├── weather-mode/
    │   │   └── WeatherModeShell.jsx ← Weather cover page.
    │   └── private-mode/
    │       ├── PrivateModeShell.jsx ← Main sanctuary. Tab navigation between panels.
    │       ├── HomePanel.jsx    ← Quick links, persistent location toggle, emergency resources.
    │       ├── JournalPanel.jsx ← Evidence journal entry creation with media.
    │       ├── ChatPanel.jsx    ← Main chat orchestrator (friend + bot messaging). Delegates to sub-components:
    │       │   ├── ChatThreadView.jsx ← Open thread display (messages + header)
    │       │   ├── MessageComposer.jsx ← Text input + send/mic controls
    │       │   ├── ChatAvatar.jsx ← Avatar with status indicator
    │       │   ├── MessagesList.jsx ← Chat list view (bot + friends)
    │       │   ├── SearchFriendsField.jsx ← Friend discovery search + dropdown
    │       │   ├── FriendRequestsSections.jsx ← Request lifecycle UI (incoming/outgoing/accepted)
    │       │   ├── FriendsPanel.jsx ← Friend management orchestrator
    │       │   └── FriendIdentityCard.jsx ← User display name card
    │       ├── AidPanel.jsx     ← Resource directory (shelters, legal aid, hotlines).
    │       ├── SosPanel.jsx     ← Emergency SOS alert to trusted contacts + location.
    │       ├── MapboxMap.jsx    ← Map display for resource discovery.
    │       ├── MomentForYou.jsx ← Daily affirmation rotation for self-care.
    │       └── OthersJournals.jsx ← Community journal with anonymized entries.
    ├── pages/
    │   ├── _app.jsx           ← App wrapper. Global styles, auth context, providers.
    │   ├── index.jsx          ← Marketing landing page. Public-facing homepage.
    │   ├── login.jsx          ← Auth form (register + login).
    │   ├── downloads.jsx      ← PWA installation guide.
    │   ├── preview/
    │   │   └── [theme].jsx    ← Unauthenticated preview of each cover app (calculator/news/weather).
    │   ├── app/
    │   │   └── [theme].jsx    ← Auth-gated app shell. Routes to correct cover based on theme param.
    │   └── api/
    │       ├── auth/          ← register, login, logout
    │       ├── journal/       ← CRUD + attachments + community + heart
    │       ├── bookmarks/     ← CRUD + image upload + from-chat
    │       ├── friends/       ← friend requests + trusted contact upgrade
    │       ├── trusted-contacts/ ← trusted contact management
    │       ├── geolocation/   ← GET / POST / DELETE latest location
    │       ├── news/          ← headlines proxy
    │       ├── resources/     ← nearby shelter/resource lookup (GET /nearby)
    │       ├── ai-chat/       ← AI support conversation
    │       ├── sos/           ← emergency SOS broadcast
    │       ├── stt/           ← speech-to-text
    │       ├── tts/           ← text-to-speech
    │       └── users/
    │           ├── search.js      ← anonymous display-name search
    │           └── preferences.js ← account preferences, including saved location-sharing state
    └── styles/
        ├── globals.css        ← Global resets, base typography, theme colors.
        ├── Marketing.module.css ← Landing page styles.
        ├── CoverPages.module.css ← Shared styles for cover apps.
        ├── Login.module.css   ← Auth form styles.
        ├── AppPreview.module.css ← Preview page styles.
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
        ├── weather-mode/
        │   └── weathercover.module.css
        └── private-mode/
            ├── shell.module.css          ← Private mode tab navigation
            ├── home.module.css           ← Home panel, location toggle, daily moment card
            ├── chat-panel.module.css     ← Chat panel wrapper (tab navigation)
            ├── chat-thread-view.module.css ← Open thread display (messages + header)
            ├── message-composer.module.css ← Text input + send/mic controls
            ├── chat-avatar.module.css    ← Avatar with status indicator
            ├── messages-list.module.css  ← Chat list view
            ├── search-friends-field.module.css ← Friend discovery search
            ├── friend-requests-sections.module.css ← Request lifecycle UI
            ├── friends-panel.module.css  ← Friend management orchestrator
            ├── friend-identity-card.module.css ← User display name card
            ├── aid.module.css            ← Aid panel (resources)
            ├── sos.module.css            ← SOS emergency button
            └── journalpanel.module.css   ← Journal entry creation
```

---

## Feature Toggle Architecture

All feature flags live in `src/config/config.json`. Set a flag to `true` to activate a feature, `false` to disable. Currently all core safety features are **enabled by default**:

### Enabled Safety Features (always-on)
```json
{
  "enable_auth_system": true,              // Secure login with optional duress password
  "enable_pwa": true,                      // Install as mobile apps (disguised as calc/news/weather)
  "enable_button": true,                   // Discreet corner button for quick access
  "enable_swipe_panic": true,              // Horizontal swipe exit trigger
  "enable_journal": true,                  // Encrypted evidence journaling with attachments
  "enable_journal_privacy": true,          // Community journal with anonymized entries & hearts
  "enable_ai_chat": true,                  // 24/7 AI support with resources & safety planning
  "enable_bookmarks": true,                // Save articles, links, and resources privately
  "enable_geolocation": true,              // Optional: share location with trusted contacts
  "enable_friending": true,                // Connect with other survivors anonymously
  "enable_trusted_contacts": true,         // Designate emergency contacts for SOS
  "enable_sos": true,                      // One-tap SOS: message + location to trusted contacts
  "enable_anonymous_chat": true,           // Friend-gated persistent messaging
  "enable_friend_request_expiry": true     // Auto-expire pending friend requests for privacy
}
```

### Planned Features (disabled, in development)
```json
{
  "enable_safety_alert": false,            // Audio/visual alert system for escape
  "enable_resource_directory": false,      // Enhanced local resource discovery
  "enable_crisis_escalation": false        // Auto-escalation to crisis hotlines
}
```

### Adding a new feature

1. Create `src/services/yourFeatureService.js` with a `static init()` method.
2. Add `"enable_your_feature": false` to `src/config/config.json`.
3. Import the service and add the toggle + init call to `src/app.js`.

Refer to existing services in `src/services/` for patterns.

---

## Authentication & Privacy by Default

### How Registration Works

1. **Create an account** with a username and strong password
2. **Optional: Set a duress password** — a second password that lets you log in normally but enables "duress mode" (shows a decoy screen while real data stays hidden)
3. **Passwords are hashed** with bcryptjs; never stored in plaintext
4. **Session token is issued** and stored in an HTTP-only cookie that:
   - Cannot be read by JavaScript (prevents theft via XSS attacks)
   - Is automatically deleted when you close the browser
   - Has no "Remember Me" — every session is temporary
   - Cannot be stolen by reading localStorage or sessionStorage

### Login Endpoints

| Method | Route | Body | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | `{ username, password, duressPassword? }` | Create account with optional duress password |
| POST | `/api/auth/login` | `{ username, password }` | Log in; returns JWT in secure cookie |
| POST | `/api/auth/logout` | _(none)_ | Immediate logout; cookie deleted |

### Zero-Trace Security Rules

- **No browser history** — session cookies auto-delete on close
- **No autocomplete** — all auth inputs have `autocomplete="off"`
- **No referrer leaks** — `Referrer-Policy: no-referrer` site-wide
- **No cached data** — `Cache-Control: no-store` on all auth routes
- **Panic logout** — pressing **Escape**, swiping horizontally, tapping the corner button, or quadruple-tapping triggers immediate logout + redirect to Google
- **Duress mode** — login with duress password silently enables hidden mode; sensitive data can be configured to auto-hide

### Protecting Pages with Middleware

**Private pages** (like `/app/calculator`) use `withAuth` to require login:

```javascript
export const getServerSideProps = withAuth(async (context, session) => {
  // session = { sub, displayName, duressMode }
  return { props: {} };
});
```

**API routes** use `requireAuth` to guard endpoints:

```javascript
export default requireAuth(async (req, res) => {
  const { sub, displayName } = req.session;
  res.json({ displayName });
});
```

---

## PWA & Privacy Architecture — Zero Trace Guarantee

### Install on Your Phone — Looks Like the Real App

SafeHaven can be installed as a Progressive Web App on iOS and Android, appearing in your app drawer alongside other apps:

- **Appears as:** "Calculator Pro", "Daily News Reader", or "Weather Now"
- **Real app icon:** Indistinguishable from the genuine utilities
- **Works offline:** Basic functionality available without internet
- **App shortcuts:** Works just like any other app on your home screen
- **No app store trace:** Installed from the web; doesn't appear in your Play Store or App Store purchase history

### Network-Only Caching — No Permanent Traces

Unlike normal web apps, SafeHaven's service worker is extremely privacy-conscious:

| Protection | How It Works |
|---|---|
| **No disk caching** | Every page load fetches from the server; nothing stored on device |
| **Cache purge on hide** | When you close or minimize the app, all memory is immediately cleared |
| **History lock** | Browser back button is disabled; you can't accidentally navigate into browser history |
| **Session wipe on hide** | All session data cleared the moment the app goes into background |

### Panic Exit — Four Ways to Get Out Fast

**1. Escape Key** — Press Escape on desktop to immediately log out + redirect to Google

**2. Horizontal Swipe** — Large left-to-right or right-to-left swipe on mobile triggers instant exit

**3. Corner Button** — Small orange button (bottom-left) for quick access; tap to exit

**4. Quadruple Tap** — Rapid four taps anywhere on the screen exits (useful if physically disabled or hands full)

### No Search Engine Indexing

- `<meta name="robots" content="noindex, nofollow">` on all private pages
- Google, Bing, and other crawlers are explicitly blocked
- Your safe space will never appear in search results

### No Referrer Leakage

- `Referrer-Policy: no-referrer` site-wide
- When you click a link from SafeHaven to an external site, the external site cannot see where you came from
- Your destination URL stays private

---

## Cover Apps — Completely Functional Disguises

### Calculator Pro (`/app/calculator`)

A fully-featured iOS-style calculator that works perfectly. No shortcuts, no hidden tricks—it's a legitimate tool:

- **Standard mode:** Basic arithmetic (+, −, ×, ÷) with large, touch-friendly buttons
- **Scientific mode:** Trigonometric, logarithmic, powers, roots, factorials, constants (π, e)
- **Radian/Degree toggle:** Choose your angular unit
- **Calculation history:** Slide-up panel shows your past calculations; tap to restore
- **Large display:** Adaptive font sizing handles everything from 0.000001 to 999,999,999,999
- **Memory functions:** M+, M−, MR, MC for standard operations

**Why this matters:** If someone picks up your phone and opens "Calculator," they see a real calculator. They have no reason to suspect anything. It works perfectly.

### Kiwi News — Daily News Reader (`/app/news`)

A premium Apple News-style reader featuring real live headlines from over 40 major news sources:

**Live News Features:**
- **Today tab:** Top global stories, curated by major outlets (Reuters, AP, BBC, NYT, Guardian, CNN)
- **World tab:** International news focus (BBC, Reuters, Al Jazeera, Foreign Policy)
- **Sports tab:** Live sports coverage (ESPN, The Athletic, Sky Sports, CBS Sports)
- **Live updates:** Headlines refresh automatically; gracefully falls back to curated stories if API is unavailable
- **Search:** Full-text search across all fetched articles

**Reading Experience:**
- **Hero story:** Full-bleed image with headline, category tag, and publisher
- **Filter chips:** Tap to filter by category (All, Tech, Science, Economy, Politics, etc.)
- **Story cards:** Each article shows color-coded publisher name, author, and thumbnail
- **Article reader:** Immersive full-screen view with sticky title bar and smooth scroll
- **Profile & Menu:** Polished overlays for settings and version info

**Why this works:** Kiwi News is indistinguishable from a real news app. It fetches real news. You can read real articles. Someone checking your phone sees a legitimate news reader.

### Weather (`/app/weather`)

A lightweight weather forecast page. Simple. Functional. Nothing fancy.

**Why it's here:** Another everyday app cover. If you need a third disguise, Weather is available.

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

## Friend-to-Friend Chat — Real-Time & Secure

SafeHaven includes real-time messaging for survivors who've connected as friends. All messages are private, encrypted, and require both parties to accept the friendship.

### How Messaging Works

1. **Send a friend request** to another SafeHaven user
2. **They accept** — connection is established
3. **Open chat** — your conversation history loads instantly
4. **Type and send** — message appears real-time (if recipient is online) or waiting (if offline)
5. **Persistent storage** — all messages saved to your account; you can review conversations anytime

### Technical Details

- **Real-time protocol:** Socket.io WebSocket for instant delivery
- **Authentication:** Uses your existing HTTP-only session cookie
- **Privacy:** Only accepted friends can message you; strangers cannot initiate chat
- **Message history:** Automatically loaded on chat open
- **Offline delivery:** Messages queue if recipient is offline; delivered when they log in

### Socket Events (Technical Reference)

| Direction | Event | Payload | Purpose |
|---|---|---|---|
| Client → Server | `join_room` | `{ roomId: friendRelationshipId }` | Join a friend's chat room |
| Client → Server | `send_message` | `{ roomId, message }` | Send message to friend |
| Server → Client | `chat_history` | `{ roomId, currentUserId, messages }` | Load past conversation |
| Server → Client | `receive_message` | `{ id, senderId, senderDisplayName, message, timestamp }` | New message arrives |
| Server → Client | `chat_error` | `{ error }` | Error notification |

---

## AI Support Chat — Available 24/7

SafeHaven provides a private, judgment-free conversation with an AI assistant trained in trauma-informed support. Perfect for times when you need to talk but can't access a human counselor.

### What the AI Does

- **Listens without judgment** — validates your experience and believes you
- **Provides safety planning tips** — practical steps like preparing a go-bag, code words with trusted people, documentation methods
- **Offers resource guidance** — tailored suggestions for shelters, legal aid, therapists, and crisis hotlines based on your location
- **Explains your options** — plain-language information about restraining orders, legal protections, and reporting avenues
- **Supports emotional processing** — helps you build self-compassion and process trauma
- **Emergency safety rule** — if you're in immediate danger, always call 911. The AI surfaces the National Domestic Violence Hotline: **1-800-799-7233** (call or text) or chat at thehotline.org

### Technical Details

| Property | Value |
|---|---|
| **AI Model** | Google Gemma 4 (31B) via OpenRouter |
| **Conversation Memory** | Up to 20 recent messages |
| **Max Response** | 1,024 tokens (~800 words) |
| **Privacy** | End-to-end encrypted; conversation history stored only in your session |
| **Availability** | Requires `OPENROUTER_API_KEY` in `.env` |
| **Cost Model** | Free tier available; pay-as-you-go beyond limits |

---

## Evidence Journal — Document Your Story Safely

The **private evidence journal** lets survivors create a secure record of incidents, emotions, and events. Documentation is powerful for legal cases, therapy, and your own healing.

### What You Can Record

- **Text entries** — detailed descriptions of incidents, dates, times
- **Media attachments** — photos, videos, audio recordings (max 50 MB per file)
- **Incident dates** — link events to when they occurred
- **Timestamps** — automatic server-side recording of when you wrote the entry
- **Private notes** — only you can access these; never shared

### Privacy Guarantees

- **Encrypted storage** — all data at rest in MongoDB
- **No accidental sharing** — entries are completely private unless you explicitly choose to share (see Community Journal below)
- **Permanent deletion** — delete an entry and all its attachments are erased immediately
- **No search indexing** — search engines never see your journal

### Community Journal — Share Anonymously

Optionally, you can post anonymized entries to a **community board** where:
- Your name is hidden; you appear as "QuietRiver" or another pseudonym
- Other survivors can "heart" your entry (like/react)
- Reading others' stories can help you feel less alone
- You retain full control — delete community entries anytime

### Journal API

| Method | Route | Description |
|---|---|---|
| GET | `/api/journal` | Paginated list (`?page=1&limit=20`) |
| POST | `/api/journal` | Create entry (`{ title?, content, incidentDate? }`) |
| PUT | `/api/journal/:id` | Edit text fields |
| DELETE | `/api/journal/:id` | Delete entry + all attachments |
| POST | `/api/journal/attachment?entryId=` | Upload file (image/video/audio/pdf) |
| GET | `/api/journal/community` | Browse anonymized community entries |
| POST | `/api/journal/:id/heart` | Heart a community entry |

---

## Emergency SOS — One Tap to Alert Trusted Contacts

The **SOS feature** is SafeHaven's fastest way to call for help. One tap sends an emergency message to all your **trusted contacts** with your current location.

### How It Works

1. **Open the SOS panel** from the private sanctuary menu
2. **Tap "Send SOS"** — the app requests your location (if enabled)
3. **Emergency message sent** to every trusted contact:
   - Your current GPS coordinates (if you've enabled location sharing)
   - A timestamp
   - Immediate notification (if contact is online via Socket.io)
4. **Contacts see the alert** in their messages and know you're in danger

### Before You Need SOS

**Setup your trusted contacts:**
- Send friend requests to other SafeHaven users
- Mark connections as "Trusted Contacts" for SOS eligibility
- Enable location sharing in settings (optional but recommended)

**Setup location:**
- Enable location sharing in settings so coordinates can be sent with SOS
- Your location updates are validated—old coordinates rejected

### SOS API

| Method | Route | Description |
|---|---|---|
| POST | `/api/sos` | Broadcast emergency message to all trusted contacts with location |

---

## Speech & Text-to-Speech

Survivors can use voice input and audio output for journaling and communication:

| Route | Description |
|---|---|
| `POST /api/stt` | Convert speech to text (for voice journal entries) |
| `POST /api/tts` | Convert text to speech (for reading accessibility) |

**Env var required:** `ELEVENLABS_API_KEY` from ElevenLabs account

---

## Geolocation — Location Sharing

Survivors can opt-in to share their location with trusted contacts for emergency support:

| Method | Route | Description |
|---|---|---|
| GET | `/api/geolocation` | Retrieve your saved latest location or `null` |
| POST | `/api/geolocation` | Update your location (timestamps older than 5 min rejected) |
| DELETE | `/api/geolocation` | Clear saved location completely |
| GET | `/api/users/preferences` | Retrieve account preferences, including saved location-sharing state |
| PATCH | `/api/users/preferences` | Persist account preferences such as `locationSharingEnabled` |

**Privacy:** Only the most recent location is stored—no movement history. The location-sharing toggle is saved to the user account so it can resume across logins, but live coordinates are still collected only after the browser grants location permission. Visibility changes purge local session storage and service-worker caches without logging the user out; panic exit, back-to-cover, and page unload still clear the auth session.

---

## Aid / Resource Directory

`GET /api/resources/nearby` — Returns nearby shelters, legal aid, and crisis resources using Mapbox.

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

**Last Updated:** May 29, 2026
**Version:** 1.3.0
**Maintainer:** SafeHaven Team

---

## Frequently Asked Questions

### Is SafeHaven completely free?

Yes. SafeHaven is built by and for survivors, with no paywalls or ads. We are committed to keeping critical safety tools free and accessible.

### Will anyone see my data?

No. Your data is encrypted at rest and in transit. Only you can access your entries, chats, and profile. We do not monetize, share, or sell any user data.

### Can my abuser find this app on my phone?

SafeHaven appears as "Calculator," "News Reader," or "Weather"—everyday apps that everyone has. If someone installs an app monitoring tool, they'll see these generic app names. When you log out or panic exit, all traces are cleared.

### What if I'm monitored by spyware?

SafeHaven minimizes digital footprints, but spyware can potentially see everything on a device. If you're in this situation:
- **Use a trusted device** (friend's phone, library computer, shelter computer)
- **Call the hotline** — National DV Hotline: 1-800-799-7233
- **Talk to a counselor** about a safety plan

### How do I know who to trust as a friend?

You decide. SafeHaven doesn't vet users. Send friend requests only to people you know and trust. You have full control over who can message and see your location.
