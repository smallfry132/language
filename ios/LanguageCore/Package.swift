// swift-tools-version:5.10
// The app's logic without any screens: word data, spaced repetition, sync, answer checking and the tone curve.
// It builds and tests on the Mac (swift test), and the iPhone app uses it as a local package.
import PackageDescription

let package = Package(
    name: "LanguageCore",
    defaultLocalization: "en",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "LanguageCore", targets: ["LanguageCore"])],
    targets: [
        .target(name: "LanguageCore", resources: [.copy("Data")]),
        .testTarget(name: "LanguageCoreTests", dependencies: ["LanguageCore"])
    ]
)
