import SwiftUI
import LanguageCore

/* Trace characters (round-2 canvas, as on the web): one character at a time in a 田字格. Trace shows the character
 * faintly, Copy shows it beside the grid, From memory shows nothing until two misses. The next stroke is dashed with
 * a red start dot; a stroke counts when it follows the stroke's centre line (LanguageCore Strokes). */

/// A stroke outline (SVG path with M L Q C Z, data coordinates) as a SwiftUI path in a square of `size`
func strokePath(_ d: String, size: CGFloat) -> Path {
    let s = size / 1024
    let pt = { (x: Double, y: Double) in CGPoint(x: x * s, y: (900 - y) * s) }
    var p = Path()
    let toks = d.split(separator: " ")
    var k = 0, cmd: Substring = "M"
    func num() -> Double { defer { k += 1 }; return k < toks.count ? Double(toks[k]) ?? 0 : 0 }
    while k < toks.count {
        if let c = toks[k].first, c.isLetter { cmd = toks[k]; k += 1 }
        switch cmd {
        case "M": p.move(to: pt(num(), num()))
        case "L": p.addLine(to: pt(num(), num()))
        case "Q": let c = pt(num(), num()); p.addQuadCurve(to: pt(num(), num()), control: c)
        case "C": let c1 = pt(num(), num()), c2 = pt(num(), num()); p.addCurve(to: pt(num(), num()), control1: c1, control2: c2)
        case "Z": p.closeSubpath(); if k < toks.count, !(toks[k].first?.isLetter ?? false) { k += 1 }
        default: k += 1
        }
    }
    return p
}

struct TraceRun: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    enum TMode: String, CaseIterable { case trace, copy, memory }
    @State private var mode = TMode.trace
    @State private var wi = 0
    @State private var ci = 0
    @State private var si = 0
    @State private var misses = 0
    @State private var wordMiss = 0
    @State private var right = 0
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]
    @State private var live: [CGPoint] = []
    @State private var lastOk = false
    @State private var hint: String?
    @State private var showing: Int?   // Show me: how many strokes are drawn so far
    private let gridSize: CGFloat = 320

    var chars: [Character] { Array(list[wi].hz).filter { Strokes.shared.char($0) != nil } }
    var body: some View {
        let w = list[wi], ch = chars[min(ci, chars.count - 1)], d = Strokes.shared.char(ch)!, n = d.s.count
        Page {
            ProgressHeader(i: wi, n: list.count)
            Picker("", selection: $mode) { ForEach(TMode.allCases, id: \.self) { Text(store.t("trace_" + $0.rawValue)).tag($0) } }
                .pickerStyle(.segmented)
                .onChange(of: mode) { si = 0; misses = 0; hint = nil }
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                PinyinText(py: w.py, size: 22, weight: .bold)
                Text(store.tr(w)).foregroundStyle(Color.ink2)
                if mode == .copy { Text(String(ch)).hanziFont(30, .regular) }
                Spacer()
                Text(store.t("strokeOf", min(si + 1, n), n)).font(.footnote).foregroundStyle(Color.ink2)
            }
            grid(d, n: n).frame(width: gridSize, height: gridSize).frame(maxWidth: .infinity)
            Text(hint ?? (si < n ? store.t("traceStart", store.t(Strokes.direction(d.m[si]))) + (lastOk && si > 0 ? " " + store.t("strokeGood", si) : "") : "✓ " + store.t("traceDone")))
                .font(.subheadline).foregroundStyle(Color.ink2).multilineTextAlignment(.center).frame(maxWidth: .infinity, minHeight: 40)
            if n <= 14 { order(d, n: n) }
            HStack(spacing: 8) {
                Button(store.t("showMe")) { showMe(n) }.buttonStyle(.secondary)
                Button(store.t("clear")) { si = 0; misses = 0; lastOk = false; hint = nil }.buttonStyle(.secondary)
                Button(store.t("next") + " →") { wordMiss += 1; nextChar() }.buttonStyle(.primary)
            }
        }
    }

    func grid(_ d: StrokeChar, n: Int) -> some View {
        let seal = Color.accent, m = si < n ? d.m[si] : []
        let s = gridSize / 1024, toView = { (p: [Double]) in CGPoint(x: p[0] * s, y: (900 - p[1]) * s) }
        let showNext = mode == .trace || misses >= 2
        return ZStack {
            Rectangle().fill(Color.elevated)
            Path { p in
                p.move(to: CGPoint(x: 0, y: gridSize / 2)); p.addLine(to: CGPoint(x: gridSize, y: gridSize / 2))
                p.move(to: CGPoint(x: gridSize / 2, y: 0)); p.addLine(to: CGPoint(x: gridSize / 2, y: gridSize))
            }.stroke(Color.dynamic(0xE8B4AC, 0x5A3A36, text: false), style: StrokeStyle(lineWidth: 1, dash: [6, 5]))
            if let k = showing {
                ForEach(0..<n, id: \.self) { j in strokePath(d.s[j], size: gridSize).fill(j < k ? Color.ink : Color.ink.opacity(0.12)) }
            } else {
                if mode == .trace { ForEach(0..<n, id: \.self) { j in strokePath(d.s[j], size: gridSize).fill(Color.ink.opacity(0.12)) } }
                ForEach(0..<min(si, n), id: \.self) { j in strokePath(d.s[j], size: gridSize).fill(Color.ink) }
                if si < n && showNext {
                    strokePath(d.s[si], size: gridSize).stroke(seal, style: StrokeStyle(lineWidth: 2, dash: [7, 5]))
                    if let f = m.first { Circle().fill(seal).frame(width: 22, height: 22).position(toView(f)) }
                    if m.count > 1 { Path { p in p.move(to: toView(m[0])); p.addLine(to: toView(m[min(2, m.count - 1)])) }.stroke(seal.opacity(0.6), style: StrokeStyle(lineWidth: 3, lineCap: .round)) }
                }
            }
            Path { p in if let f = live.first { p.move(to: f); live.dropFirst().forEach { p.addLine(to: $0) } } }
                .stroke(Color.ink.opacity(0.75), style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        }
        .overlay(Rectangle().stroke(seal, lineWidth: 1.5))
        .contentShape(Rectangle())
        .gesture(DragGesture(minimumDistance: 0)
            .onChanged { live.append($0.location) }
            .onEnded { _ in strokeEnded(m, n: n) })
        .accessibilityLabel(store.t("traceAria", String(chars[min(ci, chars.count - 1)])))
    }

    func order(_ d: StrokeChar, n: Int) -> some View {
        HStack(spacing: 6) {
            Text(store.t("order")).font(.caption).foregroundStyle(Color.ink2)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    ForEach(0..<n, id: \.self) { k in
                        ZStack { ForEach(0...k, id: \.self) { j in strokePath(d.s[j], size: 32).fill(j == k ? Color.accent : Color.ink) } }
                            .frame(width: 32, height: 32).background(Color.elevated)
                            .overlay(RoundedRectangle(cornerRadius: 4).stroke(k == si ? Color.accent : Color.line, lineWidth: k == si ? 1.5 : 1))
                    }
                }
            }
        }.accessibilityHidden(true)
    }

    func strokeEnded(_ m: [[Double]], n: Int) {
        let s = 1024 / gridSize
        let pts = live.map { (x: Double($0.x * s), y: Double(900 - $0.y * s)) }
        live = []
        guard si < n, !pts.isEmpty else { return }
        if Strokes.matches(pts, median: m) {
            si += 1; misses = 0; lastOk = true; hint = nil
            if si >= n { Haptic.success(); DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { nextChar() } }
        } else {
            misses += 1; wordMiss += 1; lastOk = false; Haptic.error()
            hint = store.t(misses >= 2 && mode != .trace ? "traceHelp" : "traceAgain")
        }
    }

    func showMe(_ n: Int) {
        store.speaker.say(list[wi].hz); wordMiss += 1
        for k in 0...n { DispatchQueue.main.asyncAfter(deadline: .now() + 0.45 * Double(k)) { showing = k } }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.45 * Double(n) + 0.9) { showing = nil }
    }

    func nextChar() {
        si = 0; misses = 0; lastOk = false; hint = nil; ci += 1
        if ci >= chars.count {
            let w = list[wi], good = wordMiss <= 1
            store.recordAnswer(good)
            if good { right += 1 } else { mistakes.append(w); why[w.id] = store.t("whyStrokes") }
            ci = 0; wordMiss = 0
            if wi + 1 >= list.count { done(SessionResult(correct: right, total: list.count, mistakes: mistakes, why: why)); return }
            wi += 1
        }
    }
}
