# WallPay

iOS wallpaper app with web admin panel. Users browse wallpapers, set them with one tap via iOS Shortcuts, and earn reward coins.

## Architecture

```
wallpay/
├── server/          # Node.js backend + web admin panel
│   ├── server.js    # Express API
│   ├── db.js        # SQLite database
│   └── public/      # Admin panel (HTML/CSS/JS)
└── WallPay/         # iOS app (Swift/SwiftUI)
    └── WallPay/     # Source files
```

## Quick Start

### Backend

```bash
cd server
npm install
npm start
```

Open `http://localhost:3000` for the admin panel.

### iOS App

1. Open `WallPay/WallPay.xcodeproj` in Xcode
2. Set your development team
3. Build and run on a device or simulator
4. In Settings tab, configure the server URL and shortcut name

### iOS Shortcut Setup

Create a Shortcut in the iOS Shortcuts app that:
1. Gets the image from clipboard
2. Sets it as the wallpaper (lock screen)

Name it "Set Wallpaper" (or whatever name you configure in the app's Settings).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/wallpapers` | Active wallpapers (iOS) |
| GET | `/api/wallpapers/all` | All wallpapers (admin) |
| POST | `/api/wallpapers` | Upload wallpaper |
| PATCH | `/api/wallpapers/:id` | Update coins/status |
| DELETE | `/api/wallpapers/:id` | Delete wallpaper |
| POST | `/api/rewards` | Claim reward |
| GET | `/api/rewards/:deviceId` | Get rewards |
