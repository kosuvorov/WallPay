import SwiftUI

struct AuthView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = false
    @State private var isLoading = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            
            VStack(spacing: 24) {
                Spacer()
                
                // Logo
                VStack(spacing: 8) {
                    Text("WallPay")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundStyle(Theme.primaryGradient)
                    
                    Text("Premium Lock Screen Wallpapers")
                        .font(.subheadline)
                        .foregroundColor(Theme.textSecondary)
                }
                
                Spacer()
                
                // Auth Form
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textFieldStyle(WallPayTextFieldStyle())
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(WallPayTextFieldStyle())
                        .textContentType(isSignUp ? .newPassword : .password)
                    
                    if !errorMessage.isEmpty {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    Button(action: handleAuth) {
                        ZStack {
                            RoundedRectangle(cornerRadius: Theme.cornerRadius)
                                .fill(Theme.primaryGradient)
                                .frame(height: 50)
                            
                            if isLoading {
                                ProgressView()
                                    .tint(.black)
                            } else {
                                Text(isSignUp ? "Create Account" : "Sign In")
                                    .font(.headline)
                                    .foregroundColor(.black)
                            }
                        }
                    }
                    .disabled(isLoading || email.isEmpty || password.isEmpty)
                    .opacity((isLoading || email.isEmpty || password.isEmpty) ? 0.6 : 1.0)
                    
                    Button(action: {
                        isSignUp.toggle()
                        errorMessage = ""
                    }) {
                        Text(isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up")
                            .font(.subheadline)
                            .foregroundColor(Theme.accentYellow)
                    }
                }
                .padding(.horizontal, Theme.padding)
                
                Spacer()
            }
            .padding()
        }
    }
    
    private func handleAuth() {
        errorMessage = ""
        isLoading = true
        
        Task {
            do {
                if isSignUp {
                    try await authManager.signUp(email: email, password: password)
                } else {
                    try await authManager.signIn(email: email, password: password)
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

struct WallPayTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Theme.cardBackground)
            .cornerRadius(Theme.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadius)
                    .stroke(Theme.border, lineWidth: 1)
            )
    }
}
