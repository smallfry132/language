import SwiftUI
import LanguageCore

/* Typewriter: copy-type pinyin or Vietnamese for speed. Return reads the line aloud and moves on. */

struct TyperRun: View {
    struct Item { let text: String; let show: String; let sub: String; let say: String }
    struct Done { let item: Item; let typed: String; let acc: Int; let wpm: Int }

    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var items: [Item] = []
    @State private var i = 0
    @State private var typed = ""
    @State private var startedAt: Date?
    @State private var finished: [Done] = []
    @FocusState private var focused: Bool

    static func norm(_ s: String) -> String {
        s.precomposedStringWithCanonicalMapping.replacingOccurrences(of: "’", with: "'").replacingOccurrences(of: "‘", with: "'")
            .replacingOccurrences(of: "—", with: "-").replacingOccurrences(of: "–", with: "-")
            .split(separator: " ", omittingEmptySubsequences: false).joined(separator: " ")
    }
    func makeItems() -> [Item] {
        let zh = store.course.id == "zh", content = SetupPrefs.shared.typerContent
        let word = { (w: Word) in Item(text: Self.norm(zh ? w.py : w.hz), show: zh ? w.hz : "", sub: store.tr(w), say: w.hz) }
        let sent = { (w: Word) -> Item? in
            guard let ex = w.ex else { return nil }
            if zh { guard let p = w.exPy else { return nil }; return Item(text: Self.norm(p), show: ex, sub: store.exTr(w), say: ex) }
            return Item(text: Self.norm(ex), show: "", sub: store.exTr(w), say: ex)
        }
        return list.map { w in content == "words" ? word(w) : content == "sentences" ? (sent(w) ?? word(w)) : Bool.random() ? word(w) : (sent(w) ?? word(w)) }
    }
    static func score(_ target: String, _ typed: String) -> Int {
        let t = Array(target), y = Array(typed)
        let ok = t.indices.filter { $0 < y.count && y[$0] == t[$0] }.count
        return Int((Double(ok) / Double(max(t.count, y.count, 1)) * 100).rounded())
    }
    /// Net speed: only correctly typed characters count (5 characters = 1 word)
    static func wpm(_ target: String, _ typed: String, _ secs: Double) -> Int {
        let t = Array(target), ok = Array(typed).enumerated().filter { $0.offset < t.count && $0.element == t[$0.offset] }.count
        return Int((Double(ok) / 5 / max(secs / 60, 1.0 / 600)).rounded())
    }
    func line(_ target: String, _ typed: String) -> AttributedString {
        let t = Array(target), y = Array(typed)
        var out = AttributedString()
        for (k, c) in t.enumerated() {
            var a = AttributedString(String(c))
            if k < y.count { a.foregroundColor = y[k] == c ? Color.good : Color.bad; if y[k] != c { a.backgroundColor = Color.bad.opacity(0.15) } }
            else if k == y.count { a.foregroundColor = Color.ink; a.underlineStyle = .single }
            else { a.foregroundColor = Color.ink3 }
            out += a
        }
        if y.count > t.count { var a = AttributedString(String(y[t.count...])); a.foregroundColor = .bad; a.strikethroughStyle = .single; out += a }
        return out
    }

    var body: some View {
        Page {
            if items.isEmpty { EmptyView() } else {
                let it = items[i]
                ProgressHeader(i: i, n: items.count)
                CardBox(padding: 20) {
                    if !it.show.isEmpty { Text(it.show).hanziFont(26).frame(maxWidth: .infinity) }
                    Text(line(it.text, typed)).scaledFont(24, design: .monospaced).frame(maxWidth: .infinity)
                    Text(it.sub).font(.footnote).foregroundStyle(Color.ink2).frame(maxWidth: .infinity)
                    TextField("", text: $typed)
                        .font(.title3).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .keyboardType(store.course.id == "zh" ? .asciiCapable : .default)
                        .padding(12).background(Color.sunken, in: RoundedRectangle(cornerRadius: 12))
                        .focused($focused).submitLabel(.next).onSubmit(submit)
                        .onChange(of: typed) { _, v in
                            if startedAt == nil && !v.isEmpty { startedAt = Date() }
                            if store.course.id == "zh", v.contains(where: { ("1"..."5").contains($0) }) { typed = Lingo.numToMarks(v) }
                        }
                    HStack {
                        let secs = startedAt.map { Date().timeIntervalSince($0) } ?? 0
                        Text("\(secs > 1 ? Self.wpm(it.text, Self.norm(typed), secs) : 0) \(store.t("wpm"))")
                        Text("\(typed.isEmpty ? 100 : Self.score(String(it.text.prefix(typed.count)), Self.norm(typed)))%")
                        Spacer()
                        Button { store.speaker.say(it.say); focused = true } label: { Label(store.t("play"), systemImage: "speaker.wave.2") }.buttonStyle(.bordered).tint(.ink)
                    }.font(.footnote.monospacedDigit()).foregroundStyle(Color.ink2)
                }
                if let last = finished.last {
                    HStack {
                        Text(line(last.item.text, last.typed)).scaledFont(15, design: .monospaced)
                        Spacer()
                        Text("\(last.wpm) \(store.t("wpm")) · \(last.acc)%").font(.footnote.monospacedDigit()).foregroundStyle(last.acc == 100 ? Color.good : Color.bad)
                    }.padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: 12))
                }
                Text(store.t("typerHint")).font(.footnote).foregroundStyle(Color.ink3)
            }
        }
        .onAppear { if items.isEmpty { items = makeItems() }; focused = true }
    }

    func submit() {
        let it = items[i], y = Self.norm(store.course.id == "zh" ? Lingo.numToMarks(typed) : typed).trimmingCharacters(in: .whitespaces)
        guard !y.isEmpty else { focused = true; return }
        let acc = Self.score(it.text, y), w = startedAt.map { Self.wpm(it.text, y, Date().timeIntervalSince($0)) } ?? 0
        store.speaker.say(it.say)
        store.recordAnswer(acc == 100)
        finished.append(Done(item: it, typed: y, acc: acc, wpm: w))
        typed = ""; startedAt = nil
        if i + 1 < items.count { i += 1; focused = true; return }
        let n = Double(max(finished.count, 1))
        let avgW = Int((Double(finished.map(\.wpm).reduce(0, +)) / n).rounded()), avgA = Int((Double(finished.map(\.acc).reduce(0, +)) / n).rounded())
        let top = finished.filter { $0.acc >= 90 }.map(\.wpm).max() ?? 0
        let record = top > (store.state.typer?[store.course.id] ?? 0)
        if record { store.update { var t = $0.typer ?? [:]; t[$0.course] = top; $0.typer = t } }
        let misses = finished.filter { $0.acc < 100 }.map { d in
            Word(id: "typer-\(d.item.text)", hz: d.item.show.isEmpty ? d.item.text : d.item.show, py: d.item.show.isEmpty ? "" : d.item.text, en: d.item.sub, cat: "misc", lvl: 1, course: store.course.id)
        }
        done(SessionResult(correct: finished.count - misses.count, total: finished.count, mistakes: misses, extra: "\(avgW) \(store.t("wpm")) · \(avgA)%" + (record ? " · 🏆 " + store.t("typerRecord") : "")))
    }
}
