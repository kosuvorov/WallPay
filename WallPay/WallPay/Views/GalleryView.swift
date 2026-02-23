import SwiftUI

struct GalleryView: View {
    @EnvironmentObject var rewardManager: RewardManager
    @State private var wallpapers: [Wallpaper] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedWallpaper: Wallpaper?
    
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]
    
    var body: some View {
        NavigationStack {
            ScrollView {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, minHeight: 300)
                } else if let error = errorMessage {
                    VStack(spacing: 12) {
                        Image(systemName: "wifi.slash")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text(error)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task { await loadWallpapers() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color("AccentGold"))
                    }
                    .frame(maxWidth: .infinity, minHeight: 300)
                    .padding()
                } else if wallpapers.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "photo.on.rectangle.angled")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text("No wallpapers available")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, minHeight: 300)
                } else {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(wallpapers) { wallpaper in
                            WallpaperCard(wallpaper: wallpaper)
                                .onTapGesture {
                                    selectedWallpaper = wallpaper
                                }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 24)
                }
            }
            .background(Color(uiColor: .systemBackground))
            .navigationTitle("WallPay")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 4) {
                        Image(systemName: "dollarsign.circle.fill")
                            .foregroundStyle(Color("AccentGold"))
                        Text("\(rewardManager.totalCoins)")
                            .fontWeight(.semibold)
                            .foregroundStyle(Color("AccentGold"))
                    }
                }
            }
            .refreshable {
                await loadWallpapers()
            }
            .sheet(item: $selectedWallpaper) { wallpaper in
                WallpaperDetailView(wallpaper: wallpaper)
            }
        }
        .task {
            await loadWallpapers()
            await rewardManager.refresh()
        }
    }
    
    private func loadWallpapers() async {
        isLoading = wallpapers.isEmpty
        errorMessage = nil
        
        do {
            wallpapers = try await APIService.shared.fetchWallpapers()
            isLoading = false
        } catch {
            isLoading = false
            if wallpapers.isEmpty {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - Wallpaper Card

struct WallpaperCard: View {
    let wallpaper: Wallpaper
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image
            AsyncImage(url: APIService.shared.imageURL(for: wallpaper)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(9/16, contentMode: .fill)
                case .failure:
                    Rectangle()
                        .fill(Color(uiColor: .systemGray5))
                        .aspectRatio(9/16, contentMode: .fill)
                        .overlay {
                            Image(systemName: "photo")
                                .font(.title2)
                                .foregroundStyle(.tertiary)
                        }
                case .empty:
                    Rectangle()
                        .fill(Color(uiColor: .systemGray6))
                        .aspectRatio(9/16, contentMode: .fill)
                        .overlay {
                            ProgressView()
                        }
                @unknown default:
                    EmptyView()
                }
            }
            .clipped()
            
            // Info bar
            HStack {
                Text(wallpaper.displayName)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)
                    .foregroundStyle(.primary)
                
                Spacer()
                
                HStack(spacing: 3) {
                    Image(systemName: "dollarsign.circle.fill")
                        .font(.caption2)
                    Text("\(wallpaper.coins)")
                        .font(.caption)
                        .fontWeight(.bold)
                }
                .foregroundStyle(Color("AccentGold"))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
        }
        .background(Color(uiColor: .secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
