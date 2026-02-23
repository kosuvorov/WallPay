import SwiftUI

@main
struct WallPayApp: App {
    @StateObject private var rewardManager = RewardManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(rewardManager)
                .preferredColorScheme(.dark)
        }
    }
}
