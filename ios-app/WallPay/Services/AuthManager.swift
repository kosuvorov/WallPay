import Foundation
import Combine

@MainActor
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUserId: String?
    @Published var userEmail: String?
    
    private let supabaseService = SupabaseService.shared
    
    init() {
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        // Check if user session exists in Supabase
        Task {
            if let session = await supabaseService.getSession() {
                isAuthenticated = true
                currentUserId = session.user.id
                userEmail = session.user.email
            }
        }
    }
    
    func signUp(email: String, password: String) async throws {
        let session = try await supabaseService.signUp(email: email, password: password)
        isAuthenticated = true
        currentUserId = session.user.id
        userEmail = session.user.email
    }
    
    func signIn(email: String, password: String) async throws {
        let session = try await supabaseService.signIn(email: email, password: password)
        isAuthenticated = true
        currentUserId = session.user.id
        userEmail = session.user.email
    }
    
    func signOut() async throws {
        try await supabaseService.signOut()
        isAuthenticated = false
        currentUserId = nil
        userEmail = nil
    }
}
