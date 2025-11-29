import Foundation

struct Wallpaper: Identifiable, Codable {
    let id: String
    let brandName: String
    let title: String
    let description: String?
    let imageURL1242: String
    let imageURL1179: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case brandName = "brand_name"
        case title
        case description
        case imageURL1242 = "image_url_1242"
        case imageURL1179 = "image_url_1179"
    }
    
    var preferredImageURL: String {
        // Choose based on screen size
        let screenHeight = UIScreen.main.bounds.height
        return screenHeight >= 2688 ? imageURL1242 : imageURL1179
    }
}

struct AnalyticsEvent: Codable {
    let userId: String
    let wallpaperId: String
    let eventType: String
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case wallpaperId = "wallpaper_id"
        case eventType = "event_type"
        case createdAt = "created_at"
    }
}
