import AVFoundation
import Speech
import LanguageCore

/* Voice output, microphone and speech recognition. Everything runs on the iPhone:
 * Apple's voices speak, Apple's recogniser listens (on the device or on Apple's servers, as it decides),
 * and the tone curve is computed from the raw microphone samples on the device. */

enum AudioSession {
    /// Playback that ignores the silent switch
    static func playback() {
        let s = AVAudioSession.sharedInstance()
        try? s.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? s.setActive(true)
    }
    static func record() throws {
        let s = AVAudioSession.sharedInstance()
        // .default keeps the iPhone's automatic input level: .measurement switched it off and the recogniser got
        // speech that was often too quiet (the pitch curve works the same either way)
        try s.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
        try s.setActive(true)
    }
}

@MainActor
final class Speaker: NSObject, AVSpeechSynthesizerDelegate {
    private let synth = AVSpeechSynthesizer()
    private var done: [ObjectIdentifier: () -> Void] = [:]
    var course = Course.byId("zh")
    var voices: [String: String] = [:]   // chosen voice per course
    var rate = 0.85
    var muted = false
    private var player: AVAudioPlayer?

    override init() {
        super.init()
        synth.delegate = self
        AudioSession.playback()
    }

    /// Voices for the course language, best first: premium, enhanced, the regular voice, its smallest version,
    /// and last the Eloquence voices (Eddy, Flo, Grandma…), which share the regular voice's quality level
    /// but sound deliberately robotic
    /// Kept per language: speechVoices() loads every voice on the device and is far too slow to call on each
    /// redraw. Cleared when the app comes back to the front (a voice may have been downloaded meanwhile).
    private var voiceCache: [String: [AVSpeechSynthesisVoice]] = [:]
    func reloadVoices() { voiceCache = [:] }
    func courseVoices(_ c: Course? = nil) -> [AVSpeechSynthesisVoice] {
        let lang = (c ?? course).tts, base = String(lang.prefix(2))
        if let v = voiceCache[lang] { return v }
        let v = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix(base) }
            .sorted { a, b in
                let ea = a.language == lang, eb = b.language == lang
                if ea != eb { return ea }
                return Self.rank(a) > Self.rank(b)
            }
        voiceCache[lang] = v
        return v
    }
    enum Level { case none, robotic, basic, natural }
    /// How good the best installed voice for the course is
    func level(_ c: Course? = nil) -> Level {
        guard let best = courseVoices(c).first else { return .none }
        let r = Self.rank(best)
        return r >= 40 ? .natural : r > 0 ? .basic : .robotic
    }
    /// Voices worth downloading, by course
    static let suggested = ["zh": "Lilian, Tingting", "ko": "Yuna", "ja": "Kyoko, Otoya", "vi": "Linh", "de": "Anna, Markus", "es": "Mónica, Jorge"]
    static func rank(_ v: AVSpeechSynthesisVoice) -> Int {
        let id = v.identifier.lowercased()
        if id.contains("eloquence") || id.contains("speech.synthesis") { return 0 } // robotic and novelty voices
        switch v.quality {
        case .premium: return 50
        case .enhanced: return 40
        default: return id.contains("super-compact") ? 20 : 30
        }
    }
    var currentVoice: AVSpeechSynthesisVoice? {
        if let id = voices[course.id], let v = AVSpeechSynthesisVoice(identifier: id) { return v }
        return courseVoices().first ?? AVSpeechSynthesisVoice(language: course.tts)
    }

    /// rate: 1 = normal speed (the web app's scale)
    func say(_ text: String, rate r: Double? = nil, then: (() -> Void)? = nil) {
        if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
        AudioSession.playback()
        let u = AVSpeechUtterance(string: text)
        u.voice = currentVoice
        let scale = Float(r ?? rate)
        u.rate = max(AVSpeechUtteranceMinimumSpeechRate, min(AVSpeechUtteranceMaximumSpeechRate, AVSpeechUtteranceDefaultSpeechRate * scale))
        if muted { u.volume = 0 }
        if let then { done[ObjectIdentifier(u)] = then }
        synth.speak(u)
    }
    func stop() { done.removeAll(); synth.stopSpeaking(at: .immediate) }
    var isSpeaking: Bool { synth.isSpeaking }

    func play(_ wav: Data) {
        AudioSession.playback()
        player = try? AVAudioPlayer(data: wav)
        if muted { player?.volume = 0 }
        player?.play()
    }

    nonisolated func speechSynthesizer(_ s: AVSpeechSynthesizer, didFinish u: AVSpeechUtterance) {
        let key = ObjectIdentifier(u)
        Task { @MainActor in self.done.removeValue(forKey: key)?() }
    }
    nonisolated func speechSynthesizer(_ s: AVSpeechSynthesizer, didCancel u: AVSpeechUtterance) {
        let key = ObjectIdentifier(u)
        Task { @MainActor in self.done.removeValue(forKey: key) }
    }
}

/// What the microphone brought back
struct Spoken {
    var heard: Check.Heard?       // speech recognition against the target
    var tones: Pitch.Result?      // the tone curve (Chinese words)
    var wav: Data                 // your voice, to play back
    var ms: Double
    /// The recogniser wrote exactly the word, with the right tones (in Chinese a homophone with the same tones counts)
    var heardExact: Bool { (heard?.score ?? 0) >= 1 && !(heard?.text.isEmpty ?? true) }
    /// The tone curve decides, but when the recogniser heard exactly the word it counts as right: Apple's recogniser
    /// tells tones apart well, and the curve can misjudge a syllable split or a short 4th tone
    var score: Double { tones.map { $0.none ? (heardExact ? 1 : 0) : max($0.score, heardExact ? 1 : 0) } ?? heard?.score ?? 0 }
    var curveOverruled: Bool { heardExact && (tones.map { !$0.none && $0.score < 0.8 } ?? false) }
}

@Observable @MainActor
final class Microphone {
    enum Phase: Equatable { case idle, listening(String) }
    var phase: Phase = .idle
    private(set) var recognitionOK = true
    private(set) var permitted: Bool?
    private let engine = AVAudioEngine()

    /// One recording. Each has its own recogniser task and results, so a recording that is still finishing
    /// (waiting for the recogniser's last word) can never cancel or read the next one.
    @MainActor final class Session {
        let target: String, py: String, course: String, pitch: Bool, f0base: Double?
        let buffer: SampleBuffer
        var request: SFSpeechAudioBufferRecognitionRequest?
        var task: SFSpeechRecognitionTask?
        var alts: [String] = []
        var final = false
        var lastText = Date()
        let started = Date()
        var done: ((Spoken?) -> Void)?
        var watchdog: Task<Void, Never>?
        init(target: String, py: String, course: String, pitch: Bool, f0base: Double?, done: @escaping (Spoken?) -> Void) {
            self.target = target; self.py = py; self.course = course; self.pitch = pitch; self.f0base = f0base; self.done = done
            buffer = SampleBuffer(maxSeconds: pitch ? 6 : 15, quiet: pitch ? 0.8 : 1.2)
        }
    }
    private var session: Session?

    var isListening: Bool { phase != .idle }
    func isListening(_ key: String) -> Bool { phase == .listening(key) }

    /// Asks for microphone and speech recognition the first time
    func authorize() async -> Bool {
        if let permitted { return permitted }
        let mic = await AVAudioApplication.requestRecordPermission()
        let speech = await withCheckedContinuation { c in SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0) } }
        recognitionOK = speech == .authorized
        permitted = mic
        return mic
    }

    /// Listens until you have spoken and gone quiet. key: which button is live. pitch: also draw the tone curve.
    func listen(key: String, target: String, py: String, course: Course, pitch: Bool, f0base: Double?, done: @escaping (Spoken?) -> Void) {
        if isListening { stop(); return }
        Task {
            guard await authorize() else { done(nil); return }
            start(key: key, session: Session(target: target, py: py, course: course.id, pitch: pitch, f0base: f0base, done: done), tts: course.tts)
        }
    }

    private func start(key: String, session s: Session, tts: String) {
        do { try AudioSession.record() } catch { s.done?(nil); return }
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0 else { s.done?(nil); return }
        s.buffer.rate = format.sampleRate

        if recognitionOK, let rec = SFSpeechRecognizer(locale: Locale(identifier: tts)), rec.isAvailable {
            let req = SFSpeechAudioBufferRecognitionRequest()
            req.shouldReportPartialResults = true // partial results show when the words stop coming
            // Apple's recogniser picks on the device or its servers; forcing the device gave nothing back whenever
            // the on-device model was missing or unsure. The expected word is passed as a hint.
            req.requiresOnDeviceRecognition = false
            req.contextualStrings = [s.target]
            req.taskHint = s.target.count <= 8 ? .search : .dictation
            req.addsPunctuation = false
            s.request = req
            s.task = rec.recognitionTask(with: req) { [weak s] result, error in
                let texts = result.map { r in r.transcriptions.map(\.formattedString) } ?? []
                let isFinal = result?.isFinal ?? (error != nil)
                Task { @MainActor in
                    guard let s else { return }
                    if !texts.isEmpty && texts != s.alts { s.alts = texts; s.lastText = Date() }
                    if isFinal { s.final = true }
                }
            }
        }
        let buf = s.buffer, req = s.request
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 2048, format: format) { [weak self, weak s] pcm, _ in
            req?.append(pcm)
            if buf.add(pcm) { Task { @MainActor in if let s, self?.session === s { self?.stop() } } }
        }
        engine.prepare()
        do { try engine.start() } catch { input.removeTap(onBus: 0); s.done?(nil); return }
        session = s
        phase = .listening(key)
        // Second way to notice the end: the recogniser has heard words and no new ones came for a while
        // (in a noisy room the level may never drop low enough for the pause detection)
        let quietAfterWords = s.pitch ? 1.0 : 1.4
        s.watchdog = Task { [weak self, weak s] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(200))
                guard let self, let s, self.session === s else { return }
                if !s.alts.isEmpty, Date().timeIntervalSince(s.started) > 1.5, Date().timeIntervalSince(s.lastText) > quietAfterWords { self.stop() }
            }
        }
    }

    /// Stops listening (the second tap, or by itself after a pause)
    func stop() {
        guard isListening, let s = session else { return }
        session = nil
        phase = .idle
        s.watchdog?.cancel()
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        s.request?.endAudio()
        let ms = Date().timeIntervalSince(s.started) * 1000
        let samples = Pitch.resample(s.buffer.samples(), from: s.buffer.rate)
        let wav = Pitch.wav(samples)
        let callback = s.done
        s.done = nil
        let recognising = recognitionOK
        Task {
            // Give the recogniser a moment for its final result (this recording's only)
            if s.request != nil { for _ in 0..<30 where !s.final { try? await Task.sleep(for: .milliseconds(100)) } }
            s.task?.cancel()
            if self.session == nil { AudioSession.playback() } // releases the mic, unless a new recording has started
            var spoken = Spoken(heard: nil, tones: nil, wav: wav, ms: ms)
            if !s.alts.isEmpty || !s.pitch && recognising && s.request != nil {
                spoken.heard = Check.matchHeard(s.target, s.alts, course: s.course, py: s.py)
            }
            if s.pitch {
                let tracked = await Task.detached { Pitch.trackWithEnergy(samples) }.value
                spoken.tones = Pitch.check(py: s.py, frames: tracked.f0, f0base: s.f0base, energy: tracked.rms)
            }
            callback?(spoken)
        }
    }

    /// Ends a capture without a result (leaving the screen)
    func cancel() {
        session?.done = nil
        stop()
    }
}

/// Microphone samples, collected on the audio thread; a PauseDetector decides when you have finished
final class SampleBuffer: @unchecked Sendable {
    private let lock = NSLock()
    private var chunks: [[Float]] = []
    private var pause: PauseDetector
    private var stopped = false
    var rate = 48_000.0
    init(maxSeconds: Double = 6, quiet: Double = 0.8) { pause = PauseDetector(maxSeconds: maxSeconds, quiet: quiet) }

    /// Returns true once it is time to stop
    func add(_ pcm: AVAudioPCMBuffer) -> Bool {
        guard let ch = pcm.floatChannelData?[0] else { return false }
        let n = Int(pcm.frameLength)
        let x = Array(UnsafeBufferPointer(start: ch, count: n))
        var s: Float = 0
        for v in x { s += v * v }
        let rms = n > 0 ? (s / Float(n)).squareRoot() : 0
        lock.lock(); defer { lock.unlock() }
        chunks.append(x)
        if !stopped && pause.feed(rms: rms, seconds: Double(n) / rate) { stopped = true; return true }
        return false
    }
    func samples() -> [Float] { lock.lock(); defer { lock.unlock() }; return chunks.flatMap { $0 } }
}
