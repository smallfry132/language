import Foundation
import Accelerate

/* Pitch and tones, all on the device.
 * YIN pitch tracking every 10 ms, split into syllables, each syllable's contour compared with the
 * shape of the tone it should have. A rough guide, not a verdict: it shows what to change. */

public enum Pitch {
    public static let sampleRate = 16_000.0

    /// f0 in Hz per 10 ms frame (nil = unvoiced)
    public static func track(_ x: [Float], sr: Double = sampleRate) -> [Double?] { trackWithEnergy(x, sr: sr).f0 }
    /// f0 per 10 ms frame and the loudness of each frame (used to find where one syllable ends and the next begins)
    public static func trackWithEnergy(_ x: [Float], sr: Double = sampleRate) -> (f0: [Double?], rms: [Double]) {
        let hop = Int((sr * 0.01).rounded()), W = Int((sr * 0.032).rounded())
        let tMin = Int(sr / 450), tMax = Int(sr / 70)
        guard x.count > W + tMax + 1 else { return ([], []) }
        var d = [Float](repeating: 1, count: tMax + 1)
        var frames: [(rms: Double, f0: Double?)] = []
        x.withUnsafeBufferPointer { p in
            let base = p.baseAddress!
            var s = 0
            while s + W + tMax < x.count {
                var e: Float = 0
                vDSP_svesq(base + s, 1, &e, vDSP_Length(W))
                var run: Float = 0
                for k in 1...tMax {
                    var sum: Float = 0
                    vDSP_distancesq(base + s, 1, base + s + k, 1, &sum, vDSP_Length(W))
                    run += sum
                    d[k] = run > 0 ? sum * Float(k) / run : 1
                }
                var tau = -1
                var k = tMin
                while k <= tMax {
                    if d[k] < 0.15 { while k < tMax && d[k + 1] < d[k] { k += 1 }; tau = k; break }
                    k += 1
                }
                var f0: Double?
                if tau > 0 {
                    let a = Double(d[tau - 1]), b = Double(d[tau]), c = tau < tMax ? Double(d[tau + 1]) : b
                    let den = a - 2 * b + c, q = den != 0 ? (a - c) / (2 * den) : 0
                    f0 = sr / (Double(tau) + (abs(q) < 1 ? q : 0))
                }
                frames.append((Double((e / Float(W)).squareRoot()), f0))
                s += hop
            }
        }
        let maxR = frames.map(\.rms).max() ?? 0
        // Quiet frames still count while the pitch is clear: a 4th tone fades as it falls, and its end is what shows it
        var f = frames.map { $0.rms < max(0.004, maxR * 0.05) ? nil : $0.f0 }
        // Octave errors: fold back only real octave jumps (a 4th tone can fall almost an octave); then a light
        // 3-frame median filter, so a fast fall keeps its shape
        let med = median(f.compactMap { $0 })
        f = f.map { v in guard let v else { return nil }; return v > med * 1.8 ? v / 2 : v < med * 0.45 ? v * 2 : v }
        let smooth: [Double?] = f.indices.map { i in
            guard f[i] != nil else { return nil }
            return median(f[max(0, i - 1)..<min(f.count, i + 2)].compactMap { $0 })
        }
        return (smooth, frames.map(\.rms))
    }

    public static func median(_ a: [Double]) -> Double {
        guard !a.isEmpty else { return 0 }
        let s = a.sorted(); return s[s.count / 2]
    }

    /// Voiced stretches (short gaps bridged, tiny blips dropped) as arrays of frame indices
    static func voicedRuns(_ f: [Double?]) -> [[Int]] {
        var runs: [[Int]] = [], gap = 0
        for (i, v) in f.enumerated() {
            if v != nil {
                if !runs.isEmpty && gap <= 3 && gap < i { runs[runs.count - 1].append(i) } else { runs.append([i]) }
                gap = 0
            } else { gap += 1 }
        }
        return runs.filter { $0.count >= 4 }
    }

    /// Tone shapes on a 1–5 scale (5 = high), five points each; the 3rd tone stays low inside words
    public static let shapes: [Int: [Double]] = [1: [4.5, 4.5, 4.5, 4.5, 4.5], 2: [2.8, 3.1, 3.6, 4.2, 4.8], 3: [2.2, 1.6, 1.2, 1.3, 1.8], 4: [4.8, 4.2, 3.3, 2.4, 1.6]]
    public static let tone3End: [Double] = [2.2, 1.5, 1.2, 2, 3.3] // a 3rd tone at the end may rise again

    public struct Syllable: Equatable {
        public let text: String
        public let want: Int          // the tone to say (after the 3rd-tone change); 5 = neutral, not checked
        public let got: Int?
        public let ok: Bool?
        public let levels: [Double]   // your pitch, 1–5
        public let tip: String?       // text key: tipFlat, tipHigher, tipRise, tipLower, tipFall
        public let last: Bool
        public var shape: [Double]? { want == 3 && last ? Pitch.tone3End : Pitch.shapes[want] }
    }
    public struct Result: Equatable {
        public let syllables: [Syllable]
        public let sandhi: Bool
        public let score: Double
        public let f0base: Double     // the learnt middle of your voice, updated
        public let none: Bool
    }

    /// Compares what was said with the tones of the pinyin. f0base: the middle of your voice so far (nil at first).
    public static func check(py: String, frames: [Double?], f0base: Double?, energy: [Double]? = nil) -> Result {
        let sylls = Lingo.pyParts(py).filter { !$0.sep }
        var want = sylls.map(\.tone)
        var sandhi = false
        // Tone change: 3rd + 3rd is said 2nd + 3rd (nǐ hǎo → ní hǎo)
        if want.count > 1 { for i in 0..<(want.count - 1) where want[i] == 3 && want[i + 1] == 3 { want[i] = 2; sandhi = true } }
        var runs = voicedRuns(frames).map { $0.filter { frames[$0] != nil } }
        let none = Result(syllables: [], sandhi: false, score: 0, f0base: f0base ?? 0, none: true)
        if runs.isEmpty || runs.joined().count < sylls.count || sylls.isEmpty { return none }
        let n = sylls.count
        while runs.count > n { // merge across the smallest gap
            var k = 0, g = Int.max
            for i in 0..<(runs.count - 1) { let gi = runs[i + 1][0] - runs[i].last!; if gi < g { g = gi; k = i } }
            runs.replaceSubrange(k...(k + 1), with: [runs[k] + runs[k + 1]])
        }
        while runs.count < n { // split the longest stretch in two, where the voice is quietest (between syllables)
            var k = 0
            for (i, r) in runs.enumerated() where r.count > runs[k].count { k = i }
            let r = runs[k]
            var h = (r.count + 1) / 2
            if r.count >= 8 {
                let e = energy ?? []
                // syllables still to place in this stretch decide where to look: the middle 60 % of one syllable's share
                let lo = max(2, r.count / 5), hi = min(r.count - 2, r.count - r.count / 5)
                let loud = { (j: Int) -> Double in (max(0, j - 1)...min(r.count - 1, j + 1)).map { r[$0] < e.count ? e[r[$0]] : 0 }.reduce(0, +) / 3 }
                // The joint is a dip with louder voice on both sides, not just the quietest moment (a fading tone's
                // tail is quiet too): how far it lies below the loudest point before it and after it
                let depth = { (j: Int) -> Double in
                    let before = (max(0, j - 12)..<j).map(loud).max() ?? 0, after = ((j + 1)...min(r.count - 1, j + 12)).map(loud).max() ?? 0
                    return min(before, after) - loud(j)
                }
                // Clearest sign first: a short break the voice tracker bridged, then a jump in pitch, then the dip in loudness
                let breaks = (lo..<hi).filter { r[$0] - r[$0 - 1] > 1 }
                let jump = { (j: Int) -> Double in guard let a = frames[r[j - 1]], let b = frames[r[j]] else { return 0 }; return abs(12 * log2(b / a)) }
                if let b = breaks.max(by: { r[$0] - r[$0 - 1] < r[$1] - r[$1 - 1] }) { h = b }
                else if let j = (lo..<hi).max(by: { jump($0) < jump($1) }), jump(j) > 1.5 { h = j }
                else if lo < hi, let best = (lo..<hi).max(by: { depth($0) < depth($1) }), depth(best) > 0 { h = best }
            }
            runs.replaceSubrange(k...k, with: [Array(r[..<h]), Array(r[h...])])
        }
        let all = runs.joined().compactMap { frames[$0] }, med = median(all)
        let center = f0base.map { n > 1 ? ($0 * med).squareRoot() : $0 } ?? med
        let newBase = (f0base.map { pow($0, 0.85) * pow(med, 0.15) } ?? med).rounded()
        let level = { (f0: Double) in max(0.3, min(5.7, 3 + (12 * log2(f0 / center)) / 3.5)) }
        let mean = { (a: [Double]) in a.reduce(0, +) / Double(a.count) }

        let res: [Syllable] = sylls.enumerated().map { i, x in
            let lv = runs[i].compactMap { frames[$0] }.map(level)
            // The start is the consonant; the end is kept almost whole, because a falling or dipping tone shows there
            let cutStart = lv.count >= 10 ? Int(Double(lv.count) * 0.15) : lv.count >= 6 ? 1 : 0
            let cutEnd = lv.count >= 14 ? Int(Double(lv.count) * 0.05) : 0
            let core = Array(lv[cutStart..<(lv.count - cutEnd)])
            let pts: [Double] = (0..<5).map { b in
                let lo = b * core.count / 5, hi = max((b + 1) * core.count / 5, lo + 1)
                return mean(Array(core[lo..<min(hi, core.count)]))
            }
            let w = want[i], last = i == n - 1
            if w == 5 { return Syllable(text: x.text, want: w, got: nil, ok: nil, levels: lv, tip: nil, last: last) }
            let dist = { (tpl: [Double]) -> Double in
                let ms = mean(pts), mt = mean(tpl)
                return zip(pts, tpl).reduce(0) { $0 + pow(($1.0 - ms) - ($1.1 - mt), 2) } / 5 + 0.3 * pow(ms - mt, 2)
            }
            let ds: [Int: Double] = [1: dist(shapes[1]!), 2: dist(shapes[2]!), 3: min(dist(shapes[3]!), last ? dist(tone3End) : .infinity), 4: dist(shapes[4]!)]
            // A 1st tone is decided by its shape: level (on the smoothed five points: under about 1.6 semitones of movement, under 0.8 of dip)
            // and not down at the bottom of the voice. Height alone can't decide it: it depends on the voice range the
            // app has guessed, which made level-but-low 1st tones fail and dips in a high voice pass.
            let range = pts.max()! - pts.min()!, dip = (pts[0] + pts[4]) / 2 - pts[1...3].min()!
            let isLevel = range < 0.45 && dip < 0.22
            let firstTone = isLevel && mean(pts) >= 2.0
            let got = firstTone ? 1 : [2, 3, 4].min { ds[$0]! < ds[$1]! }!
            let ok = w == 1 ? firstTone : got == w || (ds[w]! <= ds[got]! + 0.35 && !firstTone)
            let slope = pts[4] - pts[0]
            let tip = ok ? nil : w == 1 ? (isLevel ? "tipHigher" : "tipFlat") : w == 2 ? "tipRise" : w == 3 ? "tipLower" : "tipFall"
            return Syllable(text: x.text, want: w, got: got, ok: ok, levels: lv, tip: tip, last: last)
        }
        let scored = res.filter { $0.ok != nil }
        let score = scored.isEmpty ? 1 : Double(scored.filter { $0.ok == true }.count) / Double(scored.count)
        return Result(syllables: res, sandhi: sandhi, score: score, f0base: newBase, none: false)
    }

    /// Linear resampling to 16 kHz
    public static func resample(_ x: [Float], from: Double, to: Double = sampleRate) -> [Float] {
        if from == to { return x }
        let n = Int(Double(x.count) * to / from), step = from / to
        var out = [Float](repeating: 0, count: n)
        for i in 0..<n {
            let p = Double(i) * step, k = Int(p), f = Float(p - Double(k))
            out[i] = x[k] * (1 - f) + (k + 1 < x.count ? x[k + 1] : 0) * f
        }
        return out
    }

    /// 16-bit mono WAV, for playing back your own voice
    public static func wav(_ x: [Float], rate: Int = Int(sampleRate)) -> Data {
        var d = Data()
        func u32(_ v: UInt32) { withUnsafeBytes(of: v.littleEndian) { d.append(contentsOf: $0) } }
        func u16(_ v: UInt16) { withUnsafeBytes(of: v.littleEndian) { d.append(contentsOf: $0) } }
        d.append(contentsOf: Array("RIFF".utf8)); u32(UInt32(36 + x.count * 2)); d.append(contentsOf: Array("WAVEfmt ".utf8))
        u32(16); u16(1); u16(1); u32(UInt32(rate)); u32(UInt32(rate * 2)); u16(2); u16(16)
        d.append(contentsOf: Array("data".utf8)); u32(UInt32(x.count * 2))
        for v in x { u16(UInt16(bitPattern: Int16(max(-1, min(1, v)) * 32767))) }
        return d
    }
}
