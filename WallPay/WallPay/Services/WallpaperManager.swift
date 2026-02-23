import UIKit

class WallpaperManager {
    static let shared = WallpaperManager()
    
    private init() {}
    
    var shortcutName: String {
        UserDefaults.standard.string(forKey: "shortcutName") ?? "Set Wallpaper"
    }
    
    /// Copies the image to clipboard and triggers the configured Shortcut
    func setWallpaper(imageData: Data) async -> Bool {
        guard let image = UIImage(data: imageData) else { return false }
        
        // Copy to clipboard
        UIPasteboard.general.image = image
        
        // Build the Shortcuts URL
        let encodedName = shortcutName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? shortcutName
        guard let url = URL(string: "shortcuts://run-shortcut?name=\(encodedName)") else {
            return false
        }
        
        // Open the Shortcuts URL on main thread
        return await MainActor.run {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            return true
        }
    }
}
