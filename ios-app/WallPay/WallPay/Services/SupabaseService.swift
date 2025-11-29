import Foundation
import Supabase

@MainActor
class SupabaseService {
    static let shared = SupabaseService()
    
    private let client: SupabaseClient
    
    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: Config.supabaseURL)!,
            supabaseKey: Config.supabaseAnonKey
        )
    }
    
    // MARK: - Authentication
    
    func signUp(email: String, password: String) async throws -> Session {
        let response = try await client.auth.signUp(email: email, password: password)
        
        // If email confirmation is enabled, session might be nil
        if let session = response.session {
            // Create user profile
            try await createUserProfile(userId: session.user.id, email: email)
            return session
        } else {
            // Email confirmation required - user needs to check email
            throw NSError(domain: "SignUp", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "Please check your email to confirm your account"
            ])
        }
    }
    
    func signIn(email: String, password: String) async throws -> Session {
        let session = try await client.auth.signIn(email: email, password: password)
        return session
    }
    
    func signOut() async throws {
        try await client.auth.signOut()
    }
    
    func getSession() async -> Session? {
        return try? await client.auth.session
    }
    
    private func createUserProfile(userId: UUID, email: String) async throws {
        struct UserProfile: Encodable {
            let id: String
            let email: String
            let role: String
        }
        
        let profile = UserProfile(
            id: userId.uuidString,
            email: email,
            role: "user"
        )
        
        try await client.from("users")
            .insert(profile)
            .execute()
    }
    
    // MARK: - Wallpapers
    
    func getTodaysWallpapers() async throws -> [Wallpaper] {
        let response = try await client.rpc("get_todays_wallpapers").execute()
        let decoder = JSONDecoder()
        let wallpapers = try decoder.decode([Wallpaper].self, from: response.data)
        return wallpapers
    }
    
    // MARK: - Analytics
    
    func logWallpaperSet(userId: String, wallpaperId: String) async throws {
        struct AnalyticsEvent: Encodable {
            let user_id: String
            let wallpaper_id: String
            let event_type: String
        }
        
        let event = AnalyticsEvent(
            user_id: userId,
            wallpaper_id: wallpaperId,
            event_type: "wallpaper_set"
        )
        
        try await client.from("analytics_events")
            .insert(event)
            .execute()
    }
    
    // MARK: - User History
    
    func getUserHistory(userId: String) async throws -> [Wallpaper] {
        // Get wallpaper IDs from analytics events
        let eventsResponse = try await client.from("analytics_events")
            .select("wallpaper_id, created_at")
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .limit(50)
            .execute()
        
        let decoder = JSONDecoder()
        let events = try decoder.decode([AnalyticsEvent].self, from: eventsResponse.data)
        
        guard !events.isEmpty else { return [] }
        
        // Get unique wallpaper IDs
        let wallpaperIds = Array(Set(events.map { $0.wallpaperId }))
        
        // Fetch wallpaper details
        let wallpapersResponse = try await client.from("wallpapers")
            .select()
            .in("id", values: wallpaperIds)
            .execute()
        
        let wallpapers = try decoder.decode([Wallpaper].self, from: wallpapersResponse.data)
        return wallpapers
    }
}
