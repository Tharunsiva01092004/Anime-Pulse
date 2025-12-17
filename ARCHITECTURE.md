# AnimePulse Project Architecture

## 1. Overview
AnimePulse is a **Progressive Web Application (PWA)** built with Next.js that functions as a real-time anime schedule dashboard. It is designed to be "shakeproof" (robust), mobile-responsive, and installable on devices without needing a native app store.

## 2. Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (No Tailwind)
- **Data Source**: Jikan API (Unofficial MyAnimeList API)
- **Deployment**: Static Export (`output: 'export'`)

## 3. Core Logic Flow

### Data Fetching (`src/lib/api.ts`)
1. **Source**: Fetches data from `https://api.jikan.moe/v4/schedules`.
2. **Pagination**: It loops through up to 10 pages of upcoming anime to ensure the schedule is complete.
3. **Filtering**:
   - Removes entries without specific broadcast times.
   - SFW (Safe For Work) filter is enforced.

### Scheduling Engine (`src/components/Schedule.tsx`)
1. **Timezone Normalization**:
   - Takes the raw JST (Japan Standard Time) broadcast string (e.g., "Fridays at 23:00").
   - Converts it to the user's **local device time** using `src/lib/time.ts`.
   - This ensures a user in New York sees the correct time relative to Japan.
2. **Grouping**: Anime are grouped into buckets (Monday, Tuesday, etc.) based on their **local** broadcast day.
3. **Real-time Updates**:
   - Every 5 minutes, the app silently re-fetches data to check for schedule changes.
   - If an anime is airing within 25 minutes, it receives an "Airing Now" badge.

### View Modes
- **Grid View**: Shows one day at a time with large cards.
- **Weekly View**: A 7-column dense layout for planning the week.
- **Archive**: A historical view of recently completed anime.

## 4. Mobile & PWA Implementation

### "App-like" Feel
- **Manifest (`src/app/manifest.ts`)**: Defines the app name, icons, and theme colors. Tells the browser to open in `standalone` mode (hiding the URL bar).
- **Service Worker**: (Implicitly handled by Next.js export for caching).
- **Viewport**: The `viewport` meta tag prevents zooming and ensures the app scales perfectly to phone screens.
- **Touch Navigation**:
  - On mobile, the Navbar transforms into a "Floating Pill" at the bottom of the screen, mimicking native iOS/Android navigation bars.

### Installation
- **No App Store**: Users install it via the browser ("Add to Home Screen").
- **Update Strategy**: When you deploy a new version to the web, the user's installed PWA automatically updates the next time they open it.

## 5. Directory Structure
```
src/
├── app/
│   ├── layout.tsx       # Global HTML shell (fonts, metadata)
│   ├── page.tsx         # Main entry point
│   ├── manifest.ts      # PWA Configuration
│   └── globals.css      # CSS Variables (Theme colors)
├── components/
│   ├── Schedule.tsx     # Main Logic Controller
│   ├── AnimeCard.tsx    # Individual Anime UI
│   ├── Navbar.tsx       # Responsive Navigation
│   └── *.module.css     # Component-specific styles
└── lib/
    ├── api.ts           # Jikan API fetcher
    └── time.ts          # Timezone math wizardry
```
