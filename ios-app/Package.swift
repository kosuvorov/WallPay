# Package.swift for WallPay iOS App

// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WallPay",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "WallPay",
            targets: ["WallPay"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
    ],
    targets: [
        .target(
            name: "WallPay",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift")
            ]
        )
    ]
)
