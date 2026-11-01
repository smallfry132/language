import SwiftUI
import LanguageCore

/* The app's state on this device: the learner's document (same shape as the web app's), saved as JSON,
 * stamped for sync on every change, and synced with the web app's server. */

@Observable @MainActor
final class Store {
    private(set) var state: AppState
    private var snap: Snapshot
    private(set) var words: CourseWords
    private var wordsKey = ""
    var extraNew = 0                 // "learn more" taps since the app was opened
    let speaker = Speaker()
    let mic = Microphone()
    var device: Device
    var syncState: SyncState = .idle
    var toastText: String?
    /// Bumped whenever the app comes back to the front: voices may have been downloaded in Settings meanwhile
    var voiceCheck = 0
    /// Courses whose "get a natural voice" notice was dismissed (this device only)
    var voiceGuideDismissed = Set(UserDefaults.standard.stringArray(forKey: "voiceGuideDismissed") ?? [])
    func dismissVoiceGuide() {
        voiceGuideDismissed.insert(course.id)
        UserDefaults.standard.set(Array(voiceGuideDismissed), forKey: "voiceGuideDismissed")
    }
    private var syncTask: Task<Void, Never>?
    private var syncAgain = false
    private var syncTimer: Task<Void, Never>?

    enum SyncState: Equatable { case idle, ok, off, offline, error }

    struct Device: Codable {
        var id = newId("d")
        var code: String?
        var v = 0
        var last: Double = 0
        var dirty = false
    }

    static let fileURL: URL = {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("state.json")
    }()
    static let deviceKey = "langtrainer.device"

    init() {
        var s = (try? Data(contentsOf: Self.fileURL)).flatMap { try? JSONDecoder().decode(AppState.self, from: $0) } ?? AppState()
        if ProcessInfo.processInfo.arguments.contains("-demo") { s = Demo.state() }
        if let c = Launch.value("-course"), Course.all.contains(where: { $0.id == c }) { s.course = c } // for screenshots and tests
        state = s
        snap = Snapshot(s)
        words = CourseWords(state: s)
        device = UserDefaults.standard.data(forKey: Self.deviceKey).flatMap { try? JSONDecoder().decode(Device.self, from: $0) } ?? Device()
        if ProcessInfo.processInfo.arguments.contains("-mute") { speaker.muted = true }
        if let code = Launch.value("-syncCode"), code != device.code { device.code = code; device.v = 0; device.last = 0 }
        else if Launch.has("-demo") && Launch.value("-syncCode") == nil { device.code = nil } // the demo learner never syncs
        Look.current = Look.of(s.course)
        refreshWords()
        saveDevice()
        speaker.course = course
        speaker.voices = state.settings.voices ?? [:]
        speaker.rate = state.settings.rate
    }

    // MARK: Derived

    var course: Course { words.course }
    var pyFirst: Bool { state.pinyinFirst(course: state.course) }
    var t: Texts { Texts(lang: state.lang, course: state.course, pinyinFirst: pyFirst) }
    func tr(_ w: Word) -> String { state.lang == "de" ? (w.de ?? w.en) : w.en }
    func tr2(_ w: Word) -> String? { state.lang == "de" ? (w.de != nil ? w.en : nil) : w.de }
    func exTr(_ w: Word) -> String { state.lang == "de" ? (w.exDe ?? w.exEn ?? "") : (w.exEn ?? "") }
    func catName(_ c: String) -> String { let x = Library.shared.categories[c]; return state.lang == "de" ? (x?.de ?? c) : (x?.en ?? c) }
    var levels: [Int] { state.courses[state.course]?.levels ?? [1] }
    var levelLabel: String { levels.count == course.levels.count ? course.allLabel : levels.map(course.levelName).joined(separator: " · ") }
    func status(_ id: String) -> WordStatus { state.status(id) }
    var dialogues: [Dialogue] { Library.shared.dialogues[course.id] ?? [] }
    func word(_ id: String) -> Word? { words.word(id) }

    // MARK: Changing the state

    /// Every change goes through here: apply, stamp for sync, save
    func update(_ change: (inout AppState) -> Void) {
        change(&state)
        save()
    }
    private func save() {
        if state.stamp(&snap) { device.dirty = true; saveDevice(); scheduleSync() }
        persist()
        refreshWords()
        speaker.course = course
        speaker.voices = state.settings.voices ?? [:]
        speaker.rate = state.settings.rate
    }
    private func persist() {
        if let data = try? JSONEncoder().encode(state) { try? data.write(to: Self.fileURL, options: .atomic) }
    }
    private func refreshWords() {
        let key = "\(state.course)|\(levels)|\(state.custom.count)|\(state.custom.values.map { $0.t ?? 0 }.max() ?? 0)"
        if key != wordsKey { wordsKey = key; words = CourseWords(state: state) }
        Look.current = Look.of(state.course)
        Look.toneColors = state.settings.toneColors != false
    }
    private func saveDevice() { if let d = try? JSONEncoder().encode(device) { UserDefaults.standard.set(d, forKey: Self.deviceKey) } }

    func grade(_ id: String, _ q: Int) { update { $0.grade(id, q) } }
    func recordAnswer(_ ok: Bool) { update { $0.recordAnswer(ok) } }
    func answer(_ w: Word, ok: Bool) { update { $0.grade(w.id, ok ? 2 : 0); $0.recordAnswer(ok) } }
    func toast(_ s: String) {
        toastText = s
        Task { try? await Task.sleep(for: .seconds(2)); if toastText == s { toastText = nil } }
    }
    func switchCourse(_ id: String) {
        update { $0.course = id }
        extraNew = 0
        SetupPrefs.shared.cat = "all" // topics and categories differ per course
    }

    // MARK: Sync (see web/js/app.js and web/api/sync.mjs)

    /// The web app's sync server (a local test server can stand in: -syncURL http://127.0.0.1:8765/api/sync)
    let syncURL = URL(string: Launch.value("-syncURL") ?? "https://language-smoky-five.vercel.app/api/sync")!

    func scheduleSync() {
        guard device.code != nil else { return }
        syncTimer?.cancel()
        syncTimer = Task { try? await Task.sleep(for: .seconds(4)); if !Task.isCancelled { await syncNow() } }
    }

    func syncNow() async {
        guard let code = device.code else { return }
        if let running = syncTask { syncAgain = true; await running.value; return }
        let task = Task { await runSync(code: code) }
        syncTask = task
        await task.value
        syncTask = nil
        if syncAgain { syncAgain = false; scheduleSync() }
    }

    private func request(_ method: String, code: String, body: Data? = nil) async throws -> (Int, Data) {
        var r = URLRequest(url: syncURL)
        r.httpMethod = method
        r.cachePolicy = .reloadIgnoringLocalCacheData
        r.setValue(code, forHTTPHeaderField: "x-sync-code")
        r.setValue("application/json", forHTTPHeaderField: "content-type")
        r.httpBody = body
        r.timeoutInterval = 20
        let (data, res) = try await URLSession.shared.data(for: r)
        return ((res as? HTTPURLResponse)?.statusCode ?? 0, data)
    }

    private struct Pulled: Decodable { let v: Int; let data: SyncDoc? }
    private struct Pushed: Decodable { let v: Int }
    private struct Push: Encodable { let base: Int; let data: SyncDoc }

    private func runSync(code: String) async {
        do {
            for attempt in 0... {
                let (status, body) = try await request("GET", code: code)
                if status == 404 || status == 503 { syncState = .off; return }
                guard status == 200 else { throw URLError(.badServerResponse) }
                let pulled = try JSONDecoder().decode(Pulled.self, from: body)
                var ahead = true
                if let doc = pulled.data {
                    ahead = state.merge(doc, device: device.id)
                    snap = Snapshot(state) // merged values keep their own times instead of being stamped as new changes
                    persist(); refreshWords()
                }
                if !ahead { device.v = pulled.v; break }
                let push = try JSONEncoder().encode(Push(base: pulled.v, data: SyncDoc(state: state, device: device.id)))
                let (ps, pb) = try await request("PUT", code: code, body: push)
                if ps == 409 && attempt < 3 { continue } // another device was faster: merge its version first
                guard ps == 200 else { throw URLError(.badServerResponse) }
                device.v = try JSONDecoder().decode(Pushed.self, from: pb).v
                break
            }
            device.dirty = false; device.last = nowMs(); syncState = .ok
        } catch let e as URLError where [.notConnectedToInternet, .networkConnectionLost, .timedOut].contains(e.code) {
            syncState = .offline
        } catch {
            syncState = .error
        }
        saveDevice()
    }

    func connectSync(_ code: String) async {
        device.code = code; device.v = 0; device.last = 0; saveDevice()
        await syncNow()
    }
    func disconnectSync() {
        device.code = nil; device.v = 0; device.last = 0; device.dirty = false; saveDevice(); syncState = .idle
    }

    var syncStatusText: String {
        let t = self.t
        switch syncState {
        case .off: return t("syncNotSetup")
        case .offline: return t("syncOffline")
        case .error: return t("syncFailed")
        default:
            if device.dirty && syncState != .idle { return t("syncPending") }
            if device.last > 0 {
                let m = Int(((nowMs() - device.last) / 60000).rounded())
                return t("syncLast", m < 1 ? t("justNow") : m < 60 ? t("minAgo", m) : t("hAgo", Int((Double(m) / 60).rounded())))
            }
            return t("syncNever")
        }
    }
}
