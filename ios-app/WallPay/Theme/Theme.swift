import SwiftUI

enum Theme {
    // MARK: - Colors
    static let background = Color(hex: "0a0a0a")
    static let cardBackground = Color(hex: "1a1a1a")
    static let border = Color(hex: "2a2a2a")
    static let accentYellow = Color(hex: "FBBF24")
    static let accentOrange = Color(hex: "F97316")
    static let foreground = Color(hex: "ededed")
    static let textSecondary = Color.gray
    
    // MARK: - Gradients
    static let primaryGradient = LinearGradient(
        colors: [accentYellow, accentOrange],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    // MARK: - Spacing
    static let padding: CGFloat = 16
    static let cornerRadius: CGFloat = 12
    static let smallPadding: CGFloat = 8
}

// Helper extension for hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
