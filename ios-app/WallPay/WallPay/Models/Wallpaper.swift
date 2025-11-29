import Foundation
import UIKit

struct Wallpaper: Identifiable, Codable {
    let id: String
    let brandName: String
    let title: String
    let description: String?
    let imageURL: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case brandName = "brand_name"
        case title
        case description
        case imageURL = "image_url"
    }
    
    var preferredImageURL: String {
        return imageURL
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
