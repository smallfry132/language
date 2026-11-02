import SwiftUI
import LanguageCore

/* Word families (as on the web): similar words side by side — opposites and the word they make together
 * (大 + 小 → 大小 "size"), the same syllable with another tone, one part inside many words, one Korean final
 * consonant. A list by kind, a compare page per family, and Which one? (pick a word among its family). */

/// Opens a route in the current tab from places that have no navigation path (the word sheet)
struct OpenRouteKey: EnvironmentKey { static let defaultValue: (Route) -> Void = { _ in } }
extension EnvironmentValues {
    var openRoute: (Route) -> Void { get { self[OpenRouteKey.self] } set { self[OpenRouteKey.self] = newValue } }
}

/// A word as the family pages show it: pinyin for Chinese, the tone-coloured word for Vietnamese, else the word
struct FamilyReading: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 30
    var body: some View {
        switch store.course.id {
        case "zh": PinyinText(py: word.py, size: size, weight: .bold)
        case "vi": VietText(text: word.hz, size: size, weight: .bold)
        case "de", "es": GenderText(word: word, size: size >= 24 ? size * 0.85 : size)
        default: Text(word.hz).hanziFont(size - 2)
        }
    }
}
extension Store {
    /// The line under a family word: characters for Chinese, romaji or romanization for Japanese and Korean
    func familySub(_ w: Word) -> String? {
        switch course.id {
        case "zh": return w.hz
        case "ja": return w.romaji ?? (w.py.isEmpty ? nil : w.py)
        case "ko": return w.py.isEmpty ? nil : w.py
        default: return nil
        }
    }
    func shortMeaning(_ w: Word) -> String { tr(w).split(whereSeparator: { ";,(".contains($0) }).first.map { $0.trimmingCharacters(in: .whitespaces) } ?? tr(w) }
}

/// All families, grouped by kind
struct FamiliesScreen: View {
    @Environment(Store.self) var store
    var body: some View {
        let fs = store.words.families
        Page {
            HStack(alignment: .firstTextBaseline) {
                Text(store.t("famSub", fs.count)).font(.subheadline).foregroundStyle(Color.ink2)
                Spacer()
                NavigationLink(value: Route.familyQuiz(nil)) {
                    Text(store.t("whichOne")).font(.subheadline.weight(.semibold)).padding(.horizontal, 14).frame(height: 36)
                        .background(Color.action, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 4))).foregroundStyle(Color.onAction)
                }.buttonStyle(.card)
            }
            ForEach(Family.kinds.filter { k in fs.contains { $0.kind == k } }, id: \.self) { k in
                let sets = fs.filter { $0.kind == k }
                VStack(spacing: 0) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(store.t("fam_" + k)).font(.headline)
                        Spacer()
                        Text("\(sets.count)").font(.caption).foregroundStyle(Color.ink2)
                    }.padding(.bottom, 6)
                    Rectangle().fill(Color.ink).frame(height: 2)
                    ForEach(sets) { f in
                        NavigationLink(value: Route.family(f.id)) {
                            HStack(spacing: 10) {
                                VStack(alignment: .leading, spacing: 2) {
                                    FamilyLine(family: f)
                                    Text(f.items.map { store.shortMeaning($0) }.joined(separator: " · ") + (f.whole.map { " → " + store.shortMeaning($0) } ?? ""))
                                        .font(.caption).foregroundStyle(Color.ink2).multilineTextAlignment(.leading)
                                }
                                Spacer(minLength: 8)
                                Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Color.ink2)
                            }.padding(.vertical, 9).frame(minHeight: 52)
                        }.buttonStyle(.card)
                        Rectangle().fill(Color.line).frame(height: 1)
                    }
                }.padding(.top, 10)
            }
        }
        .navigationTitle(store.t("modeFamilies")).navigationBarTitleDisplayMode(.inline)
    }
}

/// The words of a family in one line with · between them (→ the word they make)
struct FamilyLine: View {
    @Environment(Store.self) var store
    let family: Family
    var body: some View {
        WrapLayout(spacing: 4) {
            ForEach(Array(family.items.enumerated()), id: \.offset) { k, w in
                HStack(spacing: 4) {
                    if k > 0 { Text("·").foregroundStyle(Color.ink2) }
                    FamilyReading(word: w, size: 16)
                }
            }
            if let whole = family.whole {
                HStack(spacing: 4) { Text("→").foregroundStyle(Color.ink2); FamilyReading(word: whole, size: 16) }
            }
        }
    }
}

/// One family side by side: a card per word; the word they make; the note
struct FamilyScreen: View {
    @Environment(Store.self) var store
    let id: Int
    var body: some View {
        let fs = store.words.families
        if let f = fs.first(where: { $0.id == id }), let pos = fs.firstIndex(of: f) {
            let next = fs[(pos + 1) % fs.count]
            Page {
                Text(store.t("dlgOf", pos + 1, fs.count)).font(.subheadline).foregroundStyle(Color.ink2)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: min(f.items.count, f.items.count == 3 ? 3 : 2)), spacing: 10) {
                    ForEach(f.items) { w in FamilyCard(word: w, family: f) }
                }
                if let whole = f.whole {
                    HStack(spacing: 10) {
                        Text(f.items.map(\.hz).joined(separator: " + ") + " →").hanziFont(18).lineLimit(1).minimumScaleFactor(0.6)
                        Button { store.speaker.say(whole.hz) } label: {
                            HStack(spacing: 8) {
                                FamilyReading(word: whole, size: 24)
                                if store.course.id == "zh" { Text(whole.hz).hanziFont(16).foregroundStyle(Color.ink2) }
                                Text(store.tr(whole)).font(.footnote).foregroundStyle(Color.ink2).lineLimit(2)
                                Spacer(minLength: 0)
                            }
                            .padding(12).frame(maxWidth: .infinity)
                            .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius)))
                            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius)).stroke(Color.ink, lineWidth: 1.5))
                        }.buttonStyle(.card)
                    }
                }
                if let note = f.note {
                    Text(note.get(store.state.lang)).font(.footnote).foregroundStyle(Color.ink2).padding(12).frame(maxWidth: .infinity, alignment: .leading)
                        .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(style: StrokeStyle(lineWidth: 1, dash: [4, 3])).foregroundStyle(Color.line))
                }
                HStack(spacing: 10) {
                    NavigationLink(value: Route.familyQuiz(f.id)) { Text(store.t("whichOne")) }.buttonStyle(.primary)
                    NavigationLink(value: Route.family(next.id)) { Text(store.t("nextFamily") + " →") }.buttonStyle(.secondary)
                }.padding(.top, 6)
            }
            .navigationTitle(store.t("fam_" + f.kind)).navigationBarTitleDisplayMode(.inline)
        } else {
            Page { Text(store.t("noResults")).foregroundStyle(Color.ink2) }
        }
    }
}

/// A family word as a card: picture, reading, characters or romanization, the tone or final consonant where that
/// is the difference, the meaning; tapping plays it
struct FamilyCard: View {
    @Environment(Store.self) var store
    let word: Word
    let family: Family
    var reveal = true
    var body: some View {
        let r = max(2, Look.current.radius)
        VStack(spacing: 4) {
            if store.words.hasPicture(word.id) { WordPic(id: word.id, size: 34) }
            FamilyReading(word: word).lineLimit(1).minimumScaleFactor(0.5)
            if let sub = store.familySub(word) { Text(sub).hanziFont(16).foregroundStyle(Color.ink2).lineLimit(1).minimumScaleFactor(0.6) }
            if family.kind == "tone" { ToneChip(word: word) }
            if family.kind == "final", let ch = differingSyllable { JamoTiles(text: String(ch), tile: 22) }
            if reveal { Text(store.tr(word)).font(.footnote).foregroundStyle(Color.ink2).multilineTextAlignment(.center).lineLimit(3) }
        }
        .padding(.vertical, 14).padding(.horizontal, 8)
        .frame(maxWidth: .infinity, minHeight: 140)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
        .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
        .overlay(alignment: .topTrailing) { Image(systemName: "speaker.wave.2").font(.caption2).foregroundStyle(Color.ink2).padding(8) }
        .contentShape(RoundedRectangle(cornerRadius: r))
        .onTapGesture { store.speaker.say(word.hz) }
        .accessibilityElement(children: .combine).accessibilityAddTraits(.isButton)
    }
    /// Korean: the syllable that differs between the family's words
    var differingSyllable: Character? {
        let me = Array(word.hz)
        for (k, c) in me.enumerated() where family.items.contains(where: { o in let a = Array(o.hz); return k >= a.count || a[k] != c }) { return c }
        return me.last
    }
}

/// Which one? Hear a word (or see its meaning) and pick it among its family: 6 questions for one family,
/// 10 across all; list words are graded, family-only words just count
struct FamilyQuiz: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let familyId: Int?
    struct Q { let family: Family; let word: Word; let listen: Bool; let order: [Word] }
    @State private var qs: [Q] = []
    @State private var i = 0
    @State private var correct = 0
    @State private var picked: String?
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]
    @State private var result: SessionResult?
    @State private var started = Date()

    var body: some View {
        Group {
            if let r = result {
                ResultView(result: r, seconds: Int(Date().timeIntervalSince(started)), retry: r.mistakes.isEmpty ? nil : { start(only: r.mistakes) }, again: { start() }, back: { dismiss() })
            } else if i < qs.count {
                let q = qs[i]
                Page {
                    ProgressHeader(i: i, n: qs.count, extra: "✓ \(correct)")
                    VStack(alignment: .leading, spacing: 2) {
                        CapsLabel(text: store.t("fam_" + q.family.kind))
                        Text(store.t(q.listen ? "famQListen" : "famQMeaning")).font(.subheadline).foregroundStyle(Color.ink2)
                    }
                    Group {
                        if q.listen {
                            Button { store.speaker.say(q.word.hz) } label: { Label(store.t("play"), systemImage: "play.fill").padding(.horizontal, 24) }.buttonStyle(.primary).frame(maxWidth: 220)
                        } else {
                            Text(store.tr(q.word)).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
                        }
                    }.frame(maxWidth: .infinity).padding(.vertical, 18)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: q.order.count == 3 ? 3 : 2), spacing: 10) {
                        ForEach(q.order) { w in
                            Button { answer(w) } label: { option(w, q) }.buttonStyle(.card).disabled(picked != nil)
                        }
                    }
                    if picked != nil {
                        let ok = picked == q.word.id
                        FeedbackBar(ok: ok, text: AttributedString((ok ? store.t("correct") : store.t("wrong")) + "  " + (store.course.id == "zh" ? q.word.py : q.word.hz) + " · " + store.tr(q.word)), speak: q.word.hz)
                        Button(store.t("next")) { next() }.buttonStyle(.primary).nextKey()
                    }
                }
                .onAppear { if q.listen { store.speaker.say(q.word.hz) } }
                .id(i)
            } else {
                Color.paper.onAppear { start() }
            }
        }
        .navigationTitle(store.t("whichOne")).navigationBarTitleDisplayMode(.inline)
        .background(Color.paper)
        .onAppear { store.currentSkill = "read" }
        .onDisappear { store.currentSkill = nil }
    }
    func option(_ w: Word, _ q: Q) -> some View {
        let r = max(2, Look.current.radius)
        let state: Color = picked == nil ? Color.line : w.id == q.word.id ? Color.good : w.id == picked ? Color.bad : Color.line
        return VStack(spacing: 4) {
            FamilyReading(word: w, size: 28).lineLimit(1).minimumScaleFactor(0.5)
            if let sub = store.familySub(w) { Text(sub).hanziFont(15).foregroundStyle(Color.ink2) }
            if picked != nil { Text(store.tr(w)).font(.caption).foregroundStyle(Color.ink2).lineLimit(2).multilineTextAlignment(.center) }
        }
        .padding(.vertical, 14).padding(.horizontal, 8).frame(maxWidth: .infinity, minHeight: 110)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
        .overlay(RoundedRectangle(cornerRadius: r).stroke(state, lineWidth: picked != nil && state != Color.line ? 2 : 1))
        .foregroundStyle(Color.ink)
    }
    func start(only: [Word]? = nil) {
        let all = store.words.families
        var sets = familyId.map { id in all.filter { $0.id == id } } ?? all
        if let only { sets = sets.filter { f in f.items.contains { w in only.contains(w) } } }
        guard !sets.isEmpty else { dismiss(); return }
        let want = sets.count == 1 ? 6 : 10, pool = sets.shuffled()
        let canListen = !store.noVoice
        qs = (0..<want).map { k in
            let f = pool[k % pool.count]
            let w = only.flatMap { o in f.items.filter { o.contains($0) }.randomElement() } ?? f.items.randomElement()!
            return Q(family: f, word: w, listen: canListen && f.kind != "build" && Double.random(in: 0..<1) < 0.6, order: f.items.shuffled())
        }
        i = 0; correct = 0; picked = nil; mistakes = []; why = [:]; result = nil; started = Date(); store.marks = []
    }
    func answer(_ w: Word) {
        guard picked == nil else { return }
        let q = qs[i], ok = w.id == q.word.id
        picked = w.id
        if q.word.isFamilyOnly { store.recordAnswer(ok) } else { store.answer(q.word, ok: ok) }
        if ok { correct += 1 } else if !mistakes.contains(q.word) { mistakes.append(q.word); why[q.word.id] = store.t("whyPicked", store.tr(w)) }
        if !q.listen { store.speaker.say(q.word.hz) }
    }
    func next() {
        picked = nil
        if i + 1 >= qs.count { result = SessionResult(correct: correct, total: qs.count, mistakes: mistakes, why: why) } else { i += 1 }
    }
}

/// On the word sheet: the word's family, the word they make, Compare →
struct FamilySection: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    @Environment(\.openRoute) var openRoute
    let word: Word
    var body: some View {
        let fs = Array(store.words.families(of: word.id).prefix(2))
        if !fs.isEmpty {
            CapsLabel(text: store.t("wordFamily"))
            ForEach(fs) { f in
                let r = max(2, Look.current.radius)
                VStack(alignment: .leading, spacing: 8) {
                    WrapLayout(spacing: 6) {
                        ForEach(f.items) { w in
                            Button { store.speaker.say(w.hz) } label: {
                                VStack(alignment: .leading, spacing: 1) {
                                    FamilyReading(word: w, size: 16)
                                    Text(store.shortMeaning(w)).font(.caption2).foregroundStyle(Color.ink2).lineLimit(1)
                                }
                                .padding(.horizontal, 10).padding(.vertical, 6)
                                .background(Color.paper, in: RoundedRectangle(cornerRadius: max(2, r - 4)))
                                .overlay(RoundedRectangle(cornerRadius: max(2, r - 4)).stroke(w.id == word.id ? Color.ink : Color.line, lineWidth: w.id == word.id ? 1.5 : 1))
                            }.buttonStyle(.card)
                        }
                    }
                    if let whole = f.whole {
                        HStack(spacing: 6) {
                            Text(store.t("together")).font(.subheadline).foregroundStyle(Color.ink2)
                            FamilyReading(word: whole, size: 16)
                            if store.course.id == "zh" { Text(whole.hz).hanziFont(15) }
                            Text("· " + store.tr(whole)).font(.subheadline).lineLimit(1)
                        }
                    }
                    Button {
                        dismiss()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { openRoute(.family(f.id)) }
                    } label: { Text(store.t("compare") + " →").font(.subheadline.weight(.semibold)) }.buttonStyle(.card)
                }
                .padding(12).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
                .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
            }
        }
    }
}
