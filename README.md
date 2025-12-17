# ⚡ AnimePulse

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-8-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**AnimePulse** is a high-performance, real-time anime tracking dashboard built for speed and aesthetics. Use the official [Jikan API](https://jikan.moe/), it provides accurate airing schedules, detailed anime information, and a seamless discovery experience.

Designed with a **"Neon Cyan"** glassmorphism aesthetic, AnimePulse offers a premium visual experience that looks great on any device, from desktop to mobile.

---

## 🚀 Features

### 📅 Real-Time Schedule
- **Live Tracking:** Instantly see what's airing today, adjusted to your local timezone.
- **"On Air" Indicators:** Pulsating red badges highlight episodes airing *right now*.
- **Auto-Sync:** Data automatically freshens every 5 minutes—no refresh needed.

### 📱 Mobile-First Design
- **Native-Like Feel:** Built with Capacitor for smooth mobile performance.
- **Touch Optimizations:** Swipeable tabs, glass-pill navigation, and adaptive grids.
- **Responsive Layout:** Fluidly scales from 7-column desktop grids to single-column mobile cards.

### 🎨 Premium UI/UX
- **Vanilla CSS Architecture:** No hefty frameworks. Pure, performant CSS Modules.
- **Glassmorphism:** Modern transluscent layers with backdrop blurs.
- **Shakeproof:** Robust error handling for missing images or API hiccups.

---

## 🛠️ Tech Stack

- **Core:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Languages:** [TypeScript](https://www.typescriptlang.org/), CSS3 (Modules)
- **Mobile:** [Capacitor](https://capacitorjs.com/) (Android/iOS support)
- **State & Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data:** [Jikan API v4](https://jikan.moe/)

---

## 📂 Project Structure

```bash
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout & global providers
│   └── page.tsx         # Dashboard & main view logic
├── components/          # Reusable UI components
│   ├── Navbar.tsx       # Responsive navigation
│   ├── Schedule.tsx     # Core schedule grid logic
│   ├── AnimeCard.tsx    # detailed media cards
│   └── ...
└── lib/                 # Utilities
    ├── api.ts           # Type-safe API client
    └── time.ts          # Date/Time formatting helpers
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/anime-pulse.git
   cd anime-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the app in action.

---

## 📱 Mobile Build (Android/iOS)

This project uses **Capacitor** to wrap the web app into a native mobile experience.

1. **Build the web assets**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**
   ```bash
   npx cap sync
   ```

3. **Open Native IDE**
   ```bash
   npx cap open android  # or ios
   ```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
