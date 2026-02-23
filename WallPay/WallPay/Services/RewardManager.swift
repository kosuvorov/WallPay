import SwiftUI

class RewardManager: ObservableObject {
    @Published var totalCoins: Int = 0
    @Published var history: [RewardHistoryItem] = []
    @Published var isLoading = false
    
    @MainActor
    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let info = try await APIService.shared.fetchRewards()
            totalCoins = info.totalCoins
            history = info.history
        } catch {
            print("Failed to fetch rewards: \(error)")
        }
    }
    
    @MainActor
    func addCoins(_ amount: Int) {
        totalCoins += amount
    }
}
