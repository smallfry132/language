import Foundation

/* Stroke order for Chinese characters (Data/strokes-zh.json, from hanzi-writer-data / Make Me a Hanzi, Arphic
 * Public License — see Data/ARPHICPL.TXT). Per character: the stroke outlines as SVG paths ("s") and each stroke's
 * centre line ("m"). Coordinates are in a 1024 × 1024 box with y pointing up and the baseline at 900.
 * A port of the web app's trace checks (strokeMatches, resampleLine, strokeDir). */

public struct StrokeChar: Codable, Sendable {
    public let s: [String]
    public let m: [[[Double]]]
}

public final class Strokes: @unchecked Sendable {
    /// Loaded on first use (1.4 MB)
    public static let shared = Strokes()
    public let chars: [String: StrokeChar]
    private init() {
        if let url = Bundle.module.url(forResource: "strokes-zh", withExtension: "json", subdirectory: "Data"),
           let data = try? Data(contentsOf: url), let d = try? JSONDecoder().decode([String: StrokeChar].self, from: data) { chars = d } else { chars = [:] }
    }
    public func char(_ c: Character) -> StrokeChar? { chars[String(c)] }
    public func covers(_ word: String) -> Bool { !word.isEmpty && word.allSatisfy { chars[String($0)] != nil } }

    public typealias Pt = (x: Double, y: Double)

    static func resample(_ pts: [Pt], _ n: Int) -> (pts: [Pt], total: Double) {
        var len: [Double] = [0]
        for k in 1..<max(pts.count, 1) { len.append(len[k - 1] + hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)) }
        let total = max(len.last ?? 0, 0.0001)
        var out: [Pt] = []
        for j in 0..<n {
            let d = Double(j) / Double(n - 1) * total
            var k = 1
            while k < len.count - 1 && len[k] < d { k += 1 }
            let a = pts[max(0, min(k - 1, pts.count - 1))], b = k < pts.count ? pts[k] : a
            let seg = k < len.count ? len[k] - len[k - 1] : 0
            let f = seg > 0 ? (d - len[k - 1]) / seg : 0
            out.append((a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f))
        }
        return (out, len.last ?? 0)
    }

    /// Does a drawn stroke (data coordinates, y up) follow the expected stroke's centre line?
    public static func matches(_ drawn: [Pt], median: [[Double]]) -> Bool {
        let m = median.map { (x: $0[0], y: $0[1]) }
        guard let first = drawn.first, !m.isEmpty else { return false }
        if drawn.count < 2 { return hypot(first.x - m[0].x, first.y - m[0].y) < 120 && resample(m, 2).total < 160 } // a dot
        let a = resample(drawn, 16), b = resample(m, 16)
        let avg = zip(a.pts, b.pts).reduce(0) { $0 + hypot($1.0.x - $1.1.x, $1.0.y - $1.1.y) } / 16
        let start = hypot(a.pts[0].x - b.pts[0].x, a.pts[0].y - b.pts[0].y), end = hypot(a.pts[15].x - b.pts[15].x, a.pts[15].y - b.pts[15].y)
        return avg < 150 && start < 230 && end < 260 && a.total > b.total * 0.35
    }

    /// Which way a stroke goes, as a string key (dirDot, dirRight, dirDownRight, dirDown, dirDownLeft, dirUpRight, dirLeft)
    public static func direction(_ median: [[Double]]) -> String {
        guard let f = median.first, let l = median.last else { return "dirDot" }
        let dx = l[0] - f[0], dy = l[1] - f[1]
        if hypot(dx, dy) < 140 { return "dirDot" }
        let ang = atan2(-dy, dx) * 180 / .pi // screen angle: 0 = right, 90 = down
        if ang > -25 && ang < 25 { return "dirRight" }
        if ang >= 25 && ang < 65 { return "dirDownRight" }
        if ang >= 65 && ang < 115 { return "dirDown" }
        if ang >= 115 && ang < 160 { return "dirDownLeft" }
        if ang <= -25 && ang > -90 { return "dirUpRight" }
        return "dirLeft"
    }
}
