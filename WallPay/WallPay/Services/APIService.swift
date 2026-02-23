import Foundation

class APIService {
    static let shared = APIService()
    
    private var baseURL: String {
        UserDefaults.standard.string(forKey: "serverURL") ?? "http://localhost:3000"
    }
    
    private init() {}
    
    // MARK: - Wallpapers
    
    func fetchWallpapers() async throws -> [Wallpaper] {
        let url = URL(string: "\(baseURL)/api/wallpapers")!
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        let decoded = try JSONDecoder().decode(WallpapersResponse.self, from: data)
        return decoded.wallpapers
    }
    
    func imageURL(for wallpaper: Wallpaper) -> URL? {
        URL(string: "\(baseURL)\(wallpaper.imageUrl)")
    }
    
    // MARK: - Rewards
    
    func claimReward(wallpaperId: String) async throws -> RewardResponse {
        let deviceId = getDeviceId()
        let url = URL(string: "\(baseURL)/api/rewards")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: String] = [
            "deviceId": deviceId,
            "wallpaperId": wallpaperId
        ]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }
        
        return try JSONDecoder().decode(RewardResponse.self, from: data)
    }
    
    func fetchRewards() async throws -> RewardInfo {
        let deviceId = getDeviceId()
        let url = URL(string: "\(baseURL)/api/rewards/\(deviceId)")!
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        return try JSONDecoder().decode(RewardInfo.self, from: data)
    }
    
    // MARK: - Download Image
    
    func downloadImage(from wallpaper: Wallpaper) async throws -> Data {
        guard let url = imageURL(for: wallpaper) else {
            throw APIError.invalidURL
        }
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
    
    // MARK: - Device ID
    
    private func getDeviceId() -> String {
        if let stored = UserDefaults.standard.string(forKey: "deviceId") {
            return stored
        }
        let id = UUID().uuidString
        UserDefaults.standard.set(id, forKey: "deviceId")
        return id
    }
}

enum APIError: LocalizedError {
    case serverError
    case invalidURL
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .serverError: return "Server error. Check your connection."
        case .invalidURL: return "Invalid URL."
        case .decodingError: return "Failed to parse response."
        }
    }
}
