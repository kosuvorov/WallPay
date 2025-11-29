import SwiftUI

struct WallpaperCard: View {
    let wallpaper: Wallpaper
    @EnvironmentObject var authManager: AuthManager
    @State private var isDownloading = false
    @State private var showSuccess = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Wallpaper Image
            AsyncImage(url: URL(string: wallpaper.preferredImageURL)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(Theme.cardBackground)
                        .aspectRatio(9/19.5, contentMode: .fit)
                        .overlay(
                            ProgressView()
                                .tint(Theme.accentYellow)
                        )
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .aspectRatio(9/19.5, contentMode: .fit)
                        .clipped()
                case .failure:
                    Rectangle()
                        .fill(Theme.cardBackground)
                        .aspectRatio(9/19.5, contentMode: .fit)
                        .overlay(
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(Theme.textSecondary)
                        )
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(Theme.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadius)
                    .stroke(Theme.border, lineWidth: 1)
            )
            
            // Brand Name
            Text(wallpaper.brandName)
                .font(.caption)
                .foregroundStyle(Theme.primaryGradient)
                .fontWeight(.semibold)
            
            // Title
            Text(wallpaper.title)
                .font(.subheadline)
                .fontWeight(.medium)
                .lineLimit(1)
            
            // Description (if exists)
            if let description = wallpaper.description, !description.isEmpty {
                Text(description)
                    .font(.caption)
                    .foregroundColor(Theme.textSecondary)
                    .lineLimit(2)
            }
            
            // Set Wallpaper Button
            Button(action: setWallpaper) {
                ZStack {
                    RoundedRectangle(cornerRadius: Theme.cornerRadius)
                        .fill(showSuccess ? .green : Theme.primaryGradient)
                        .frame(height: 44)
                    
                    if isDownloading {
                        ProgressView()
                            .tint(.black)
                    } else if showSuccess {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Set!")
                        }
                        .foregroundColor(.white)
                        .font(.headline)
                    } else {
                        Text("Set Wallpaper")
                            .font(.headline)
                            .foregroundColor(.black)
                    }
                }
            }
            .disabled(isDownloading || showSuccess)
        }
        .padding()
        .background(Theme.cardBackground)
        .cornerRadius(Theme.cornerRadius)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cornerRadius)
                .stroke(Theme.border, lineWidth: 1)
        )
    }
    
    private func setWallpaper() {
        isDownloading = true
        
        Task {
            do {
                // Download image
                guard let url = URL(string: wallpaper.preferredImageURL),
                      let (data, _) = try? await URLSession.shared.data(from: url),
                      let image = UIImage(data: data) else {
                    throw NSError(domain: "WallPay", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to download image"])
                }
                
                // Copy to clipboard
                UIPasteboard.general.image = image
                
                // Log analytics
                if let userId = authManager.currentUserId {
                    try await SupabaseService.shared.logWallpaperSet(userId: userId, wallpaperId: wallpaper.id)
                }
                
                // Open Shortcut
                if let shortcutURL = URL(string: "shortcuts://run-shortcut?name=\(Config.shortcutName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") {
                    await MainActor.run {
                        UIApplication.shared.open(shortcutURL)
                    }
                }
                
                // Show success
                await MainActor.run {
                    isDownloading = false
                    showSuccess = true
                    
                    // Reset after delay
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        showSuccess = false
                    }
                }
            } catch {
                await MainActor.run {
                    isDownloading = false
                }
                print("Error setting wallpaper: \(error)")
            }
        }
    }
}
