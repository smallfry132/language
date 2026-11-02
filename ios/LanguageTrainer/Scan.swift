import SwiftUI
import PhotosUI
import Vision
import LanguageCore

/* Scan for Add words: a photo of a worksheet, a textbook page or your notes is read on this device by Apple's
 * text recognition (Vision, the engine behind Live Text) and its lines go into the box. Nothing is added until
 * you tap Find words, so a misread line is simply deleted. */

enum TextScanner {
    /// Vision's languages for a course, best first; English is kept as a fallback for meanings on the page
    static func languages(_ course: String) -> [String] {
        let want: [String] = switch course {
        case "zh": ["zh-Hans", "zh-Hant"]
        case "de": ["de-DE"]
        case "es": ["es-ES"]
        case "vi": ["vi-VT"]
        case "ko": ["ko-KR"]
        case "ja": ["ja-JP"]
        default: []
        }
        let supported = (try? VNRecognizeTextRequest().supportedRecognitionLanguages()) ?? []
        return (want + ["en-US"]).filter { supported.contains($0) }
    }

    /// The text lines of an image, top to bottom; page numbers and stray marks are left out
    static func read(_ image: CGImage, course: String) async -> [String] {
        await Task.detached(priority: .userInitiated) {
            let request = VNRecognizeTextRequest()
            request.recognitionLevel = .accurate
            request.recognitionLanguages = languages(course)
            request.usesLanguageCorrection = course != "zh" // correction "fixes" pinyin into English words
            try? VNImageRequestHandler(cgImage: image).perform([request])
            let lines = (request.results ?? [])
                .sorted { $0.boundingBox.midY > $1.boundingBox.midY } // Vision's y runs bottom to top
                .compactMap { $0.topCandidates(1).first?.string.trimmingCharacters(in: .whitespaces) }
            return lines.filter { $0.contains { $0.isLetter } }
        }.value
    }

    /// An image of some text, for tests (-scantest): the real recogniser reads it back
    @MainActor static func render(_ text: String) -> CGImage? {
        let r = ImageRenderer(content: Text(text).font(.system(size: 44)).foregroundStyle(.black).padding(40).background(.white))
        r.scale = 2
        return r.cgImage
    }
}

/// Scan button: take a photo (when there is a camera) or choose one; the read lines come back through `found`
struct ScanButton: View {
    @Environment(Store.self) var store
    let found: ([String]) -> Void
    @State private var pick: PhotosPickerItem?
    @State private var choosing = false
    @State private var camera = false
    @State private var reading = false

    var body: some View {
        Menu {
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                Button(store.t("scanTake"), systemImage: "camera") { camera = true }
            }
            Button(store.t("scanChoose"), systemImage: "photo") { choosing = true }
        } label: {
            if reading { ProgressView().accessibilityLabel(store.t("scanReading")) }
            else { Label(store.t("scan"), systemImage: "text.viewfinder") }
        }
        .buttonStyle(.bordered).tint(.ink).disabled(reading)
        .accessibilityIdentifier("paste-scan")
        .photosPicker(isPresented: $choosing, selection: $pick, matching: .images)
        .fullScreenCover(isPresented: $camera) {
            CameraPicker { img in camera = false; if let img { Task { await scan(img) } } }.ignoresSafeArea()
        }
        .onChange(of: pick) { _, item in
            guard let item else { return }
            pick = nil
            Task {
                if let d = try? await item.loadTransferable(type: Data.self), let img = UIImage(data: d) { await scan(img) }
            }
        }
        .onAppear {
            if let t = Launch.value("-scantest"), let img = TextScanner.render(t.replacingOccurrences(of: "|", with: "\n")) {
                Task { await scan(cg: img) }
            }
        }
    }

    func scan(_ img: UIImage) async {
        // Drawn upright first: Vision reads a CGImage without the photo's orientation
        let upright = UIGraphicsImageRenderer(size: img.size).image { _ in img.draw(at: .zero) }
        if let cg = upright.cgImage { await scan(cg: cg) }
    }

    func scan(cg: CGImage) async {
        reading = true
        let lines = await TextScanner.read(cg, course: store.course.id)
        reading = false
        if lines.isEmpty { store.toast(store.t("scanNothing")) } else { found(lines) }
    }
}

/// The system camera, for one photo
struct CameraPicker: UIViewControllerRepresentable {
    let done: (UIImage?) -> Void
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let c = UIImagePickerController()
        c.sourceType = .camera
        c.delegate = context.coordinator
        return c
    }
    func updateUIViewController(_ c: UIImagePickerController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(done: done) }
    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let done: (UIImage?) -> Void
        init(done: @escaping (UIImage?) -> Void) { self.done = done }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            done(info[.originalImage] as? UIImage)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { done(nil) }
    }
}
