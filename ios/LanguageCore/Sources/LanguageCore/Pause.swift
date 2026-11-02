import Foundation

/// Notices when someone has spoken and then paused, from the loudness (rms) of short microphone chunks.
/// Speech and silence are judged against the room's own background level, not a fixed loudness:
/// iPhone microphones, headsets and rooms differ a lot.
public struct PauseDetector {
    public let maxSeconds: Double
    public let quiet: Double          // seconds of silence after speech that end the recording
    public private(set) var heard = false
    private var floor: Float = 0      // background level, follows the quiet moments
    private var quietFor = 0.0
    private var total = 0.0
    private var voiced = 0.0

    public init(maxSeconds: Double = 6, quiet: Double = 0.8) { self.maxSeconds = maxSeconds; self.quiet = quiet }

    /// Feed one chunk; returns true once it is time to stop
    public mutating func feed(rms: Float, seconds: Double) -> Bool {
        total += seconds
        if rms > 1e-5 {
            // Down quickly to a quieter moment, up only slowly (about 12 % a second) so a long sentence doesn't raise it
            let up = Float(pow(1.12, seconds))
            floor = floor == 0 ? rms : min(floor * up, max(rms, floor * 0.85))
        }
        let speech = max(floor * 3, 0.004), silence = max(floor * 2, 0.003)
        // A tap or a breath is not speech: the level has to stay up for a fifth of a second
        if rms > speech { voiced += seconds; quietFor = 0; if voiced >= 0.2 { heard = true } }
        else if heard && rms < silence { quietFor += seconds }
        else if heard { quietFor = max(0, quietFor - seconds / 2) }
        else { voiced = max(0, voiced - seconds) }
        // Never stop in the first 1.5 s: there is time to start speaking after the tap
        return (heard && quietFor > quiet && total > 1.5) || total > maxSeconds
    }
}
