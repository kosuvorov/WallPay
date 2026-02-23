import SwiftUI

struct SettingsView: View {
    @AppStorage("serverURL") private var serverURL = "http://localhost:3000"
    @AppStorage("shortcutName") private var shortcutName = "Set Wallpaper"
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Shortcut Name", systemImage: "command.square.fill")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        TextField("e.g. Set Wallpaper", text: $shortcutName)
                            .textFieldStyle(.roundedBorder)
                            .autocorrectionDisabled()
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text("Wallpaper Shortcut")
                } footer: {
                    Text("Enter the exact name of the iOS Shortcut that sets the wallpaper from clipboard. The shortcut must be installed in the Shortcuts app.")
                }
                
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Server URL", systemImage: "server.rack")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        TextField("http://localhost:3000", text: $serverURL)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.URL)
                            .autocapitalization(.none)
                            .autocorrectionDisabled()
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text("Server Connection")
                } footer: {
                    Text("The URL of the WallPay server where wallpapers are hosted.")
                }
                
                Section {
                    Link(destination: URL(string: "https://support.apple.com/guide/shortcuts/intro-to-shortcuts-apdf22b0444c/ios")!) {
                        Label("How to create Shortcuts", systemImage: "questionmark.circle")
                    }
                    
                    Button {
                        if let url = URL(string: "shortcuts://") {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        Label("Open Shortcuts App", systemImage: "arrow.up.forward.app")
                    }
                } header: {
                    Text("Help")
                }
                
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                } header: {
                    Text("About")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
