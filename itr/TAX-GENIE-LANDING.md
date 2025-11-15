# 🧞‍♂️ Tax Genie Animated Landing Page

An animated landing page for the Tax Genie product featuring the provided mascot with polished entrance animations, header integration, and full-stack development environment.

## ✨ Features

- **Animated Mascot Hero**: Mascot appears above "Tax Genie" heading with entrance animation (spin → glide → settle → idle)
- **Header Badge**: Small, optimized mascot badge in the header next to brand wordmark
- **Loading Components**: Mascot-based loading spinner with accessibility support
- **Responsive Design**: Perfect scaling across desktop, tablet, and mobile devices
- **Accessibility**: Full ARIA support, keyboard navigation, and reduced motion respect
- **Performance**: Optimized assets, lazy loading, and smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure your mascot**:
   - Update `mascot.config.js` with your mascot file path
   - The default path is set to: `C:\Users\avani_t8fxv4m\Desktop\ITR filing\new_itr\mascot.png`

3. **Start the development environment**:
```bash
# Start both frontend and asset server
npm run dev

# Or start individually:
npm run api        # Asset server on :5000
npm run dev:frontend  # Frontend on :3000
```

4. **Visit the landing page**:
   - Landing Page: http://localhost:3000/landing-new
   - Asset Server Health: http://localhost:5000/health
   - Mascot Asset: http://localhost:5000/assets/mascot/mascot-full.png

## 🎬 Animation Sequence

The mascot entrance animation follows this precise sequence:

1. **Preload** (0.0s): Mascot loads with low-res placeholder to prevent layout shift
2. **Trigger**: Animation starts on first user click or CTA focus
3. **Entrance** (0.0-0.75s): 
   - Mascot fades in at 0% scale + 0° rotation with upward offset
   - Spins 360° while scaling to 1.05 and moving along bezier curve to position
4. **Settle** (0.75-1.2s): Subtle bounce (translateY -6px → 0) and scale to 1.0
5. **Idle Loop**: Breathing (scale 1 → 1.02 → 1) + micro-rotation ±3° + glow pulse

### Reduced Motion Support
- If `prefers-reduced-motion: reduce` is detected, animations are disabled
- Shows static mascot with simple fade-in instead of complex sequence

## 🎨 Mascot Usage

### Hero Section
- **Full mascot** prominently displayed above heading
- **Responsive sizing**: 280px desktop → 200px tablet → 140px mobile → 120px small
- **Hover interaction**: Gentle wave animation (rotate -12° → +6°) with glow

### Header Badge
- **32x32px badge** derived from main mascot (auto-generated or resized)
- **Vertically centered** next to "Tax Genie" wordmark
- **Hover effect**: Scale 1.06 with subtle drop shadow
- **Accessibility**: `aria-hidden="true"` with proper `aria-label` on brand text

### Loading Spinner
- **24px animated mascot** with bob/glow effects
- **ARIA labeled** for screen readers
- **Fallback**: Genie emoji (🧞‍♂️) if mascot fails to load

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start both frontend + asset server
npm run dev:frontend     # Frontend only (Next.js on :3000)
npm run api              # Asset server only (Express on :5000)
npm run serve-assets     # Alias for asset server

# Testing
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run tests with UI
npm run test:e2e:report  # View test report

# Build & Production
npm run build            # Build for production
npm start               # Start production server
```

## 🧪 Testing

### E2E Tests (Playwright)
Comprehensive test suite covering:
- Mascot asset loading and display
- Animation triggers and sequences  
- Header badge visibility and sizing
- CTA navigation to homepage
- Keyboard accessibility
- Reduced motion support
- Slow network simulation
- Error handling and fallbacks
- Mobile responsiveness

Run tests:
```bash
cd frontend
npm run test:e2e
```

### Manual QA Checklist
- [ ] Landing page loads at http://localhost:3000/landing-new
- [ ] Mascot appears prominently above heading (not tiny icon)
- [ ] Click triggers entrance animation (spin → settle → idle)
- [ ] Header shows small balanced mascot badge (32px)
- [ ] "Enter Tax Genie" button navigates to /home
- [ ] Slow network shows mascot loading spinner
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Reduced motion disables complex animations
- [ ] Mobile responsive (test 375px, 768px, 1024px)

## 📁 File Structure

```
├── mascot.config.js              # Mascot configuration
├── asset-server.js               # Express server for assets
├── frontend/
│   ├── app/
│   │   ├── landing-new/          # New landing page
│   │   │   ├── page.tsx          # Main landing component
│   │   │   └── landing.css       # Landing page styles
│   │   └── components/
│   │       └── MascotLoader.tsx  # Loading component
│   ├── tests/
│   │   └── landing.spec.ts       # E2E tests
│   └── playwright.config.ts      # Test configuration
└── TAX-GENIE-LANDING.md         # This documentation
```

## ⚙️ Configuration

### Mascot Configuration (`mascot.config.js`)
```javascript
const config = {
  USER_MASCOT_PATH: "C:\\Users\\...\\mascot.png",  // Your mascot file
  ASSETS: {
    SERVE_PATH: "/assets/mascot/mascot-full.png",
    HEADER_BADGE: { width: 32, height: 32 }
  },
  ANIMATIONS: {
    ENTRANCE: { total: 2.0, fadeIn: 0.25, spin: 0.5, settle: 0.45 },
    IDLE: { breathing: { duration: 4 }, rotation: { duration: 6 } }
  }
}
```

### Environment Variables
```bash
ASSET_SERVER_PORT=5000           # Asset server port
FRONTEND_MASCOT_PATH=/assets/... # Frontend mascot URL
```

## 🔧 Asset Server

The Express asset server provides:
- **Mascot serving** at configured path
- **Header badge generation** (auto-resized with Sharp)
- **Health endpoint** for monitoring
- **CORS configuration** for frontend requests
- **Error handling** with fallbacks

### Endpoints
- `GET /health` - Server health check
- `GET /assets/mascot/mascot-full.png` - Main mascot asset
- `GET /assets/mascot/header-badge.png` - Auto-generated header badge
- `GET /api/mascot-config` - Configuration for frontend

## 🎯 Integration

### Navigation Flow
1. **Landing Entry**: User visits `/landing-new`
2. **Animation Trigger**: Click or keyboard interaction starts mascot sequence
3. **CTA Interaction**: "Enter Tax Genie" button triggers final animation
4. **Homepage Navigation**: Smooth transition to existing `/home` route

### Existing Homepage
- **No changes** made to existing homepage files
- **Landing page** is completely separate route
- **Preserves** all existing functionality and layouts

## 🚨 Troubleshooting

### Mascot Not Loading
1. Check `mascot.config.js` has correct file path
2. Verify file exists at specified location
3. Check asset server logs for errors
4. Visit http://localhost:5000/health for diagnostics

### Animation Issues
1. Check browser console for JavaScript errors
2. Verify Framer Motion is installed
3. Test with `prefers-reduced-motion` disabled
4. Clear browser cache and reload

### Port Conflicts
1. Change ports in `package.json` scripts if needed
2. Kill existing processes: `netstat -ano | findstr :3000`
3. Use different ports: `npm run dev:frontend -- -p 3001`

## 📝 Notes

- **Mascot Path**: Update `mascot.config.js` with your actual mascot file path
- **Asset Generation**: Header badge auto-generated from main mascot (requires Sharp)
- **Fallbacks**: Emoji fallback (🧞‍♂️) if mascot fails to load
- **Performance**: Assets cached with 1-year expiry headers
- **Accessibility**: Full WCAG compliance with ARIA labels and keyboard support

---

**To use your mascot**: Set `USER_MASCOT_PATH` in `mascot.config.js` to the absolute path or URL of your provided mascot and restart the servers.

🧞‍♂️ **Tax Genie Landing Page - Ready for Magic!**
