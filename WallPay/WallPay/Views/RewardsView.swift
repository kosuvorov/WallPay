import SwiftUI

struct RewardsView: View {
    @EnvironmentObject var rewardManager: RewardManager
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Coins display
                    VStack(spacing: 8) {
                        Image(systemName: "dollarsign.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(Color("AccentGold"))
                        
                        Text("\(rewardManager.totalCoins)")
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                            .foregroundStyle(.primary)
                        
                        Text("Total Coins Earned")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 32)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    
                    // History
                    if !rewardManager.history.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Reward History")
                                .font(.headline)
                                .padding(.horizontal, 16)
                            
                            LazyVStack(spacing: 0) {
                                ForEach(rewardManager.history) { item in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(item.wallpaperName ?? "Wallpaper")
                                                .font(.subheadline)
                                                .fontWeight(.medium)
                                            
                                            if let date = item.createdAt {
                                                Text(formatDate(date))
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                        }
                                        
                                        Spacer()
                                        
                                        HStack(spacing: 3) {
                                            Image(systemName: "dollarsign.circle.fill")
                                                .font(.caption)
                                            Text("+\(item.coins)")
                                                .fontWeight(.bold)
                                        }
                                        .foregroundStyle(Color("AccentGold"))
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 12)
                                    
                                    if item.id != rewardManager.history.last?.id {
                                        Divider()
                                            .padding(.leading, 16)
                                    }
                                }
                            }
                            .background(Color(uiColor: .secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .padding(.horizontal, 16)
                        }
                    } else if !rewardManager.isLoading {
                        VStack(spacing: 8) {
                            Image(systemName: "star")
                                .font(.title)
                                .foregroundStyle(.tertiary)
                            Text("No rewards yet")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text("Set a wallpaper to earn coins!")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.top, 20)
                    }
                }
                .padding(.bottom, 24)
            }
            .background(Color(uiColor: .systemBackground))
            .navigationTitle("Rewards")
            .refreshable {
                await rewardManager.refresh()
            }
        }
        .task {
            await rewardManager.refresh()
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate, .withTime, .withDashSeparatorInDate, .withColonSeparatorInTime, .withSpaceBetweenDateAndTime]
        
        if let date = formatter.date(from: dateString) {
            let display = DateFormatter()
            display.dateStyle = .medium
            display.timeStyle = .short
            return display.string(from: date)
        }
        return dateString
    }
}
