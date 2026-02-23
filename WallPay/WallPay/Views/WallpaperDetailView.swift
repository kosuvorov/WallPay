import SwiftUI

struct WallpaperDetailView: View {
    let wallpaper: Wallpaper
    @EnvironmentObject var rewardManager: RewardManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var isSettingWallpaper = false
    @State private var showSuccess = false
    @State private var showError = false
    @State private var errorText = ""
    @State private var coinsEarned: Int = 0
    @State private var alreadyClaimed = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Wallpaper image
                AsyncImage(url: APIService.shared.imageURL(for: wallpaper)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .ignoresSafeArea()
                    case .failure:
                        Color(uiColor: .systemGray6)
                            .ignoresSafeArea()
                            .overlay {
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundStyle(.tertiary)
                            }
                    case .empty:
                        Color(uiColor: .systemGray6)
                            .ignoresSafeArea()
                            .overlay { ProgressView() }
                    @unknown default:
                        EmptyView()
                    }
                }
                
                // Gradient overlay at bottom
                VStack {
                    Spacer()
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.8)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 220)
                }
                .ignoresSafeArea()
                
                // Bottom content
                VStack {
                    Spacer()
                    
                    VStack(spacing: 16) {
                        // Wallpaper info
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(wallpaper.displayName)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundStyle(.white)
                                
                                HStack(spacing: 4) {
                                    Image(systemName: "dollarsign.circle.fill")
                                        .foregroundStyle(Color("AccentGold"))
                                    Text("Earn \(wallpaper.coins) coins")
                                        .foregroundStyle(Color("AccentGold"))
                                        .fontWeight(.semibold)
                                }
                                .font(.subheadline)
                            }
                            Spacer()
                        }
                        
                        // Set Wallpaper button
                        Button(action: setWallpaper) {
                            HStack(spacing: 8) {
                                if isSettingWallpaper {
                                    ProgressView()
                                        .tint(.black)
                                } else {
                                    Image(systemName: "arrow.down.to.line")
                                }
                                Text(isSettingWallpaper ? "Setting…" : "Set Wallpaper")
                                    .fontWeight(.bold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color("AccentGold"))
                            .foregroundStyle(.black)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        }
                        .disabled(isSettingWallpaper)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
                
                // Success overlay
                if showSuccess {
                    successOverlay
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title3)
                            .symbolRenderingMode(.hierarchical)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") {}
            } message: {
                Text(errorText)
            }
        }
    }
    
    // MARK: - Success Overlay
    
    private var successOverlay: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.green)
                
                Text(alreadyClaimed ? "Wallpaper Set!" : "Wallpaper Set!")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                
                if !alreadyClaimed && coinsEarned > 0 {
                    HStack(spacing: 6) {
                        Image(systemName: "dollarsign.circle.fill")
                            .foregroundStyle(Color("AccentGold"))
                        Text("+\(coinsEarned) coins earned!")
                            .foregroundStyle(Color("AccentGold"))
                            .fontWeight(.bold)
                    }
                    .font(.title3)
                } else if alreadyClaimed {
                    Text("Already claimed reward for this wallpaper")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(32)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .padding(40)
        }
        .onTapGesture {
            withAnimation { showSuccess = false }
            dismiss()
        }
        .transition(.opacity)
    }
    
    // MARK: - Set Wallpaper Action
    
    private func setWallpaper() {
        isSettingWallpaper = true
        
        Task {
            do {
                // Download image
                let imageData = try await APIService.shared.downloadImage(from: wallpaper)
                
                // Copy to clipboard and trigger shortcut
                let success = await WallpaperManager.shared.setWallpaper(imageData: imageData)
                
                if success {
                    // Claim reward
                    let reward = try await APIService.shared.claimReward(wallpaperId: wallpaper.id)
                    
                    await MainActor.run {
                        coinsEarned = reward.coinsEarned
                        alreadyClaimed = reward.alreadyClaimed
                        
                        if !reward.alreadyClaimed {
                            rewardManager.addCoins(reward.coinsEarned)
                        }
                        
                        isSettingWallpaper = false
                        withAnimation(.spring(response: 0.4)) {
                            showSuccess = true
                        }
                    }
                } else {
                    await MainActor.run {
                        isSettingWallpaper = false
                        errorText = "Could not open Shortcuts. Make sure the shortcut is installed."
                        showError = true
                    }
                }
            } catch {
                await MainActor.run {
                    isSettingWallpaper = false
                    errorText = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}
