import SwiftUI

struct GalleryView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var wallpapers: [Wallpaper] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]
    
    var body: some View {
        NavigationView {
            ZStack {
                Theme.background.ignoresSafeArea()
                
                if isLoading {
                    ProgressView()
                        .tint(Theme.accentYellow)
                } else if let error = errorMessage {
                    VStack(spacing: 16) {
                        Text("Error Loading Wallpapers")
                            .font(.headline)
                        Text(error)
                            .font(.subheadline)
                            .foregroundColor(Theme.textSecondary)
                        Button("Retry", action: loadWallpapers)
                            .buttonStyle(PrimaryButtonStyle())
                    }
                    .padding()
                } else if wallpapers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "photo.on.rectangle.angled")
                            .font(.system(size: 64))
                            .foregroundColor(Theme.textSecondary)
                        Text("No Wallpapers Today")
                            .font(.headline)
                        Text("Check back tomorrow for new wallpapers!")
                            .font(.subheadline)
                            .foregroundColor(Theme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(wallpapers) { wallpaper in
                                WallpaperCard(wallpaper: wallpaper)
                            }
                        }
                        .padding()
                    }
                    .refreshable {
                        loadWallpapers()
                    }
                }
            }
            .navigationTitle("Today's Wallpapers")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear {
            if wallpapers.isEmpty {
                loadWallpapers()
            }
        }
    }
    
    private func loadWallpapers() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let fetchedWallpapers = try await SupabaseService.shared.getTodaysWallpapers()
                await MainActor.run {
                    wallpapers = fetchedWallpapers
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(Theme.primaryGradient)
            .foregroundColor(.black)
            .cornerRadius(Theme.cornerRadius)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
    }
}
