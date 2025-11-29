import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var history: [Wallpaper] = []
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            ZStack {
                Theme.background.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // User Info Card
                        VStack(spacing: 12) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 64))
                                .foregroundStyle(Theme.primaryGradient)
                            
                            if let email = authManager.userEmail {
                                Text(email)
                                    .font(.headline)
                            }
                            
                            Button(action: signOut) {
                                HStack {
                                    Image(systemName: "arrow.right.square")
                                    Text("Sign Out")
                                }
                                .font(.subheadline)
                                .foregroundColor(.red)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Theme.cardBackground)
                        .cornerRadius(Theme.cornerRadius)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.cornerRadius)
                                .stroke(Theme.border, lineWidth: 1)
                        )
                        
                        // Wallpaper History
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Wallpaper History")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            if isLoading {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                                    .padding()
                            } else if history.isEmpty {
                                VStack(spacing: 8) {
                                    Image(systemName: "clock")
                                        .font(.system(size: 48))
                                        .foregroundColor(Theme.textSecondary)
                                    Text("No wallpapers set yet")
                                        .font(.subheadline)
                                        .foregroundColor(Theme.textSecondary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(32)
                                .background(Theme.cardBackground)
                                .cornerRadius(Theme.cornerRadius)
                            } else {
                                VStack(spacing: 12) {
                                    ForEach(history) { wallpaper in
                                        HistoryRow(wallpaper: wallpaper)
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
        }
        .onAppear(perform: loadHistory)
    }
    
    private func loadHistory() {
        guard let userId = authManager.currentUserId else { return }
        
        Task {
            do {
                let fetchedHistory = try await SupabaseService.shared.getUserHistory(userId: userId)
                await MainActor.run {
                    history = fetchedHistory
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                }
                print("Error loading history: \(error)")
            }
        }
    }
    
    private func signOut() {
        Task {
            try? await authManager.signOut()
        }
    }
}

struct HistoryRow: View {
    let wallpaper: Wallpaper
    
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: wallpaper.preferredImageURL)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 60, height: 120)
                        .clipped()
                case .failure, .empty:
                    Rectangle()
                        .fill(Theme.cardBackground)
                        .frame(width: 60, height: 120)
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(wallpaper.brandName)
                    .font(.caption)
                    .foregroundStyle(Theme.primaryGradient)
                    .fontWeight(.semibold)
                
                Text(wallpaper.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                if let description = wallpaper.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(Theme.textSecondary)
                        .lineLimit(2)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Theme.cardBackground)
        .cornerRadius(Theme.cornerRadius)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cornerRadius)
                .stroke(Theme.border, lineWidth: 1)
        )
    }
}
