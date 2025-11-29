# WallPay iOS App

Native iOS application built with Swift and SwiftUI.

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Setup

1. Open `WallPay.xcodeproj` in Xcode
2. Update `Config.swift` with your Supabase credentials:
   ```swift
   static let supabaseURL = "https://your-project.supabase.co"
   static let supabaseAnonKey = "your-anon-key"
   ```
3. Build and run on simulator or device (⌘R)

## Installing the WallPay Shortcut

Users need to install the "WallPay Set" Shortcut manually:

1. Open the Shortcuts app on iOS
2. Import the shortcut from `../shortcuts/WallPay-Set.shortcut`
3. Allow the shortcut to set wallpapers

See `../shortcuts/SHORTCUT-README.md` for detailed instructions.

## Project Structure

```
WallPay/
├── WallPayApp.swift          # App entry point
├── Config.swift              # Configuration & constants
├── Models/
│   ├── Wallpaper.swift       # Wallpaper data model  
│   └── User.swift            # User data model
├── Services/
│   ├── SupabaseService.swift # Supabase integration
│   └── ShortcutService.swift # Shortcut launching
├── Views/
│   ├── AuthView.swift        # Login/signup
│   ├── GalleryView.swift     # Main wallpaper gallery
│   ├── ProfileView.swift     # User profile & history
│   └── Components/
│       └── WallpaperCard.swift
└── Theme/
    └── Theme.swift           # Colors & styling
```

## Testing

1. Create a user account
2. Ensure "WallPay Set" Shortcut is installed
3. View today's wallpapers (need superadmin to schedule first)
4. Tap "Set Wallpaper" - verify Shortcut opens
5. Check wallpaper was set
6. View history in Profile

## Troubleshooting

**Shortcut doesn't open:**
- Verify Shortcut is named exactly "WallPay Set"
- Check Shortcut app permissions

**No wallpapers showing:**
- Check Supabase connection
- Ensure superadmin has scheduled wallpapers for today

**Build errors:**
- Clean build folder (⇧⌘K)
- Update Swift package dependencies
