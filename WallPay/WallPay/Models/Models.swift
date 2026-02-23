import Foundation

struct Wallpaper: Codable, Identifiable {
    let id: String
    let filename: String
    let originalName: String?
    let coins: Int
    let isActive: Bool
    let imageUrl: String
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, filename, coins
        case originalName = "original_name"
        case isActive = "is_active"
        case imageUrl = "image_url"
        case createdAt = "created_at"
    }
    
    var displayName: String {
        if let name = originalName {
            let base = (name as NSString).deletingPathExtension
            return base.replacingOccurrences(of: "_", with: " ")
                .replacingOccurrences(of: "-", with: " ")
                .capitalized
        }
        return "Wallpaper"
    }
}

struct WallpapersResponse: Codable {
    let wallpapers: [Wallpaper]
}

struct RewardResponse: Codable {
    let alreadyClaimed: Bool
    let coinsEarned: Int
    let totalCoins: Int
    
    enum CodingKeys: String, CodingKey {
        case alreadyClaimed = "already_claimed"
        case coinsEarned = "coins_earned"
        case totalCoins = "total_coins"
    }
}

struct RewardInfo: Codable {
    let deviceId: String
    let totalCoins: Int
    let history: [RewardHistoryItem]
    
    enum CodingKeys: String, CodingKey {
        case deviceId = "device_id"
        case totalCoins = "total_coins"
        case history
    }
}

struct RewardHistoryItem: Codable, Identifiable {
    let id: Int
    let deviceId: String
    let wallpaperId: String
    let coins: Int
    let createdAt: String?
    let wallpaperName: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case deviceId = "device_id"
        case wallpaperId = "wallpaper_id"
        case coins
        case createdAt = "created_at"
        case wallpaperName = "wallpaper_name"
    }
}
