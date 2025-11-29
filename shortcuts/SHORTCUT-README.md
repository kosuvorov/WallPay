# WallPay Set - Apple Shortcut

This Apple Shortcut sets an image from the clipboard as both the Lock Screen and Home Screen wallpaper.

## Installation

### Option 1: Manual Creation (Recommended for MVP)

1. Open the **Shortcuts** app on your iPhone
2. Tap the **+** button to create a new shortcut
3. Add the following actions in order:

#### Action 1: Get Latest Photos
- Search for "Get Latest Photos"
- Set to get **1** photo
- Check "Include Screenshots"

#### Action 2: Get Clipboard
- Search for "Get Clipboard"
- This will retrieve the wallpaper image copied by the WallPay app

#### Action 3: Set Wallpaper (Lock Screen)
- Search for "Set Wallpaper"
- Input: **Clipboard** (from previous action)
- Choose "Lock Screen"
- Turn OFF "Show Preview" (for automatic setting)

#### Action 4: Set Wallpaper (Home Screen)
- Search for "Set Wallpaper"
- Input: **Clipboard** (from previous action)
- Choose "Home Screen"
- Turn OFF "Show Preview" (for automatic setting)

4. Tap the shortcut name at the top and rename it to: **WallPay Set**
5. Tap "Done" to save

## Shortcut Flow

```
1. Get image from Clipboard (set by WallPay app)
   ↓
2. Set as Lock Screen wallpaper
   ↓
3. Set as Home Screen wallpaper
   ↓
4. Complete (user sees new wallpaper)
```

## Testing

1. Copy any image to your clipboard (long-press an image → Copy)
2. Open Shortcuts app
3. Tap "WallPay Set"
4. Grant permissions if prompted
5. Verify both lock screen and home screen wallpapers changed

## Troubleshooting

**"No access to Photos" error:**
- Go to Settings → Privacy → Photos
- Enable access for Shortcuts app

**"Clipboard is empty" error:**
- Make sure you've tapped "Set Wallpaper" in the WallPay app first
- The app copies the wallpaper to clipboard automatically

**Shortcut doesn't launch from app:**
- Verify the shortcut is named exactly "WallPay Set" (case-sensitive)
- Try running the shortcut manually once to grant permissions

**Preview shows instead of auto-setting:**
- Edit the shortcut
- For both "Set Wallpaper" actions, turn OFF "Show Preview"

## iOS 16+ Compatibility

This shortcut is designed for iOS 16 and later, which introduced:
- Lock Screen customization
- Enhanced Shortcuts automation
- Clipboard access for apps

## Privacy Note

The WallPay app only uses the clipboard temporarily to transfer the wallpaper image. The image is not stored permanently outside of the Shortcuts app's wallpaper settings.

---

## Advanced: Shortcut File Format (for distribution)

If you want to share this shortcut as a file (`.shortcut`), you would need to export it from the Shortcuts app:
1. Long-press the shortcut
2. Tap "Share"
3. Choose "Copy iCloud Link" or save as file

However, for the MVP, manual creation is simpler and doesn't require iCloud distribution setup.
