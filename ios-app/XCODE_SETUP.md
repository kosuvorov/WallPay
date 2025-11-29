# 📱 WallPay iOS App - Xcode Setup Guide

## Step 1: Create New iOS App Project (Not Package!)

1. **Close** the current Xcode window showing Package.swift
2. Open **Xcode** (fresh)
3. Click **"Create New Project"** (or File → New → Project)
4. Choose **iOS** → **App** template → Click **Next**
5. Fill in:
   - **Product Name**: `WallPay`
   - **Team**: Select your Apple Developer team (or leave as Personal Team)
   - **Organization Identifier**: `com.yourname` (e.g., `com.kosuvorov`)
   - **Interface**: **SwiftUI** ✓
   - **Language**: **Swift** ✓
   - **Storage**: Core Data - OFF
   - **Include Tests**: OFF (uncheck both boxes)
6. Click **Next**
7. **Save Location**: Choose `~/WallPay/ios-app/` folder
8. Click **Create**

---

## Step 2: Delete Auto-Generated Files

In the Project Navigator (left sidebar), **delete** these files:
- `ContentView.swift` (we have our own views)
- `WallPayApp.swift` (we already have this)

Right-click → **Delete** → **Move to Trash**

---

## Step 3: Add WallPay Swift Files

1. In Project Navigator, **right-click** on the **WallPay** folder (yellow folder icon)
2. Select **"Add Files to WallPay..."**
3. Navigate to: `~/WallPay/ios-app/WallPay/`
4. **Select ALL** folders inside:
   - `WallPayApp.swift`
   - `Config.swift`
   - `Theme/` folder
   - `Models/` folder
   - `Services/` folder
   - `Views/` folder
5. ✅ Check **"Copy items if needed"**
6. ✅ Check **"Create groups"** (not folder references)
7. ✅ Make sure **Target** is checked: `WallPay`
8. Click **Add**

---

## Step 4: Add Supabase Package Dependency

1. Select the **project** in Project Navigator (blue icon at top)
2. Select the **WallPay** target (under TARGETS)
3. Go to **General** tab
4. Scroll down to **"Frameworks, Libraries, and Embedded Content"**
5. Click the **+** button
6. Click **"Add Package Dependency..."**
7. In the search box, paste: `https://github.com/supabase-community/supabase-swift`
8. Click **Add Package**
9. Wait for it to resolve...
10. Select **"Supabase"** library (check the box)
11. Click **Add Package**

---

## Step 5: Build & Run! 🚀

1. At the top of Xcode, select a simulator:
   - Click on the device selector (next to "WallPay")
   - Choose: **iPhone 16 Pro** (or any iPhone simulator)
2. Click the **Play** button (▶️) or press **⌘R**
3. Wait for build...
4. The app should launch in the simulator!

---

## Troubleshooting

**Build fails with "Cannot find 'Supabase' in scope":**
- Make sure you added the Supabase package
- Try: Product → Clean Build Folder (⇧⌘K)
- Then build again

**Files not showing up:**
- Make sure you selected "Create groups" not "Folder references"
- Files should show in black, not blue

**Cannot run on simulator:**
- Make sure deployment target is iOS 16.0+
- Check: Project Settings → General → Minimum Deployments

---

## Quick Command to Open ios-app Folder

```bash
open ~/WallPay/ios-app/
```

This will open Finder so you can see the folder structure when adding files.

---

Follow these steps and your iOS app will be running in about 5 minutes! 📱✨
