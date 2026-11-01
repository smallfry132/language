import AVFoundation
import Speech
import LanguageCore

/* Voice output, microphone and speech recognition. Everything runs on the iPhone:
 * Apple's voices speak, Apple's recogniser listens (on the device when the language supports it),
 * and the tone curve is computed from the raw microphone samples. */

enum AudioSession {
    /// Playback that ignores the silent switch
    static func playback() {
        let s = AVAudioSession.sharedInstance()
        try? s.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? s.setActive(true)
    }
    static func record() throws {
        let s = AVAudioSession.sharedInstance()
        try s.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetoothHFP])
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

    /// Voices for the course language, best first (premium, enhanced, then the rest)
    func courseVoices(_ c: Course? = nil) -> [AVSpeechSynthesisVoice] {
        let lang = (c ?? course).tts, base = String(lang.prefix(2))
        return AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix(base) }
            .sorted { a, b in
                let ea = a.language == lang, eb = b.language == lang
                if ea != eb { return ea }
                return a.quality.rawValue > b.quality.rawValue
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
    var score: Double { tones.map { $0.none ? 0 : $0.score } ?? heard?.score ?? 0 }
}

@Observable @MainActor
final class Microphone {
    enum Phase: Equatable { case idle, listening(String) }
    var phase: Phase = .idle
    private(set) var recognitionOK = true
    private(set) var permitted: Bool?

    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var buffer = SampleBuffer()
    private var started = Date()
    private var finish: ((Spoken?) -> Void)?
    private var target = ""
    private var py = ""
    private var course = "zh"
    private var alts: [String] = []
    private var final = false

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
            start(key: key, target: target, py: py, course: course, pitch: pitch, f0base: f0base, done: done)
        }
    }

    private var pitchMode = false
    private var f0base: Double?

    private func start(key: String, target: String, py: String, course: Course, pitch: Bool, f0base: Double?, done: @escaping (Spoken?) -> Void) {
        self.target = target; self.py = py; self.course = course.id; self.pitchMode = pitch; self.f0base = f0base
        finish = done; alts = []; final = false
        buffer = SampleBuffer(maxSeconds: pitch ? 6 : 15, quiet: pitch ? 0.8 : 1.2)
        do { try AudioSession.record() } catch { done(nil); return }
        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0 else { done(nil); return }
        buffer.rate = format.sampleRate

        if recognitionOK, let rec = SFSpeechRecognizer(locale: Locale(identifier: course.tts)), rec.isAvailable {
            let req = SFSpeechAudioBufferRecognitionRequest()
            req.shouldReportPartialResults = false
            if rec.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
            request = req
            task = rec.recognitionTask(with: req) { [weak self] result, error in
                let texts = result.map { r in r.transcriptions.map(\.formattedString) } ?? []
                let isFinal = result?.isFinal ?? (error != nil)
                Task { @MainActor in
                    guard let self else { return }
                    if !texts.isEmpty { self.alts = texts }
                    if isFinal { self.final = true }
                }
            }
        }
        let buf = buffer
        let req = request
        input.installTap(onBus: 0, bufferSize: 2048, format: format) { [weak self] pcm, _ in
            req?.append(pcm)
            if buf.add(pcm) { Task { @MainActor in self?.stop() } }
        }
        engine.prepare()
        do { try engine.start() } catch { input.removeTap(onBus: 0); done(nil); return }
        started = Date()
        phase = .listening(key)
    }

    /// Stops listening (the second tap, or by itself after a pause)
    func stop() {
        guard isListening else { return }
        phase = .idle
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        request?.endAudio()
        let ms = Date().timeIntervalSince(started) * 1000
        let samples = Pitch.resample(buffer.samples(), from: buffer.rate)
        let wav = Pitch.wav(samples)
        let callback = finish
        finish = nil
        Task {
            // Give the recogniser a moment for its final result
            if self.request != nil { for _ in 0..<30 where !self.final { try? await Task.sleep(for: .milliseconds(100)) } }
            self.task?.cancel(); self.task = nil; self.request = nil
            AudioSession.playback() // releases the mic: speech plays at full volume again
            var spoken = Spoken(heard: nil, tones: nil, wav: wav, ms: ms)
            if !self.alts.isEmpty || !self.pitchMode && self.recognitionOK {
                spoken.heard = Check.matchHeard(self.target, self.alts, course: self.course)
            }
            if self.pitchMode {
                let frames = await Task.detached { Pitch.track(samples) }.value
                spoken.tones = Pitch.check(py: self.py, frames: frames, f0base: self.f0base)
            }
            callback?(spoken)
        }
    }

    /// Ends a capture without a result (leaving the screen)
    func cancel() {
        finish = nil
        stop()
    }
}

/// Microphone samples, collected on the audio thread; detects the pause after speaking
final class SampleBuffer: @unchecked Sendable {
    private let lock = NSLock()
    private var chunks: [[Float]] = []
    private var heard = false
    private var quietFor = 0.0
    private var total = 0.0
    private var stopped = false
    var rate = 48_000.0
    let maxSeconds: Double
    let quiet: Double
    init(maxSeconds: Double = 6, quiet: Double = 0.8) { self.maxSeconds = maxSeconds; self.quiet = quiet }

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
        let secs = Double(n) / rate
        total += secs
        if rms > 0.02 { heard = true; quietFor = 0 } else if heard { quietFor += secs }
        if !stopped && ((heard && quietFor > quiet) || total > maxSeconds) { stopped = true; return true }
        return false
    }
    func samples() -> [Float] { lock.lock(); defer { lock.unlock() }; return chunks.flatMap { $0 } }
}
