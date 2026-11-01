import SwiftUI
import LanguageCore

/* The exercises. Each takes a list of words and reports a SessionResult when finished;
 * the practice screens and the guided session (Today) decide what happens next. */

struct SessionResult {
    var correct: Int
    var total: Int
    var mistakes: [Word]
    var extra: String?
}

/// "Again" means a word comes back at the end of the session
struct Flashcards: View {
    @Environment(Store.self) var store
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @Environment(\.dynamicTypeSize) var dynamicType
    @State var queue: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var flipped = false
    @State private var mistakes: [Word] = []
    private let count: Int

    init(words: [Word], done: @escaping (SessionResult) -> Void) { _queue = State(initialValue: words); count = words.count; self.done = done }

    var body: some View {
        let w = queue[min(i, queue.count - 1)]
        Page {
            ProgressHeader(i: i, n: queue.count)
            Button { if !flipped { flip(w) } else { store.speaker.say(w.ex ?? w.hz) } } label: {
                ZStack {
                    // Front and back as two faces of one card; the card turns over around its vertical axis
                    VStack(spacing: 10) {
                        WordFace(word: w, size: 56)
                        Text(store.t("tapToFlip")).font(.footnote).foregroundStyle(Color.ink3)
                    }
                    .opacity(flipped ? 0 : 1)
                    VStack(spacing: 10) {
                        WordPicture(word: w, size: 64)
                        WordFace(word: w, size: 56)
                        if store.pyFirst { Text(w.hz).hanziFont(22).foregroundStyle(Color.ink2) } else { Pron(py: w.py, size: 20) }
                        Text(store.tr(w)).font(.title3).multilineTextAlignment(.center)
                        if let t2 = store.tr2(w) { Text(t2).font(.subheadline).foregroundStyle(Color.ink3) }
                        if let ex = w.ex {
                            VStack(spacing: 2) {
                                if store.pyFirst, let p = w.exPy { PinyinText(py: p, size: 16); Text(ex).font(.footnote).foregroundStyle(Color.ink2) }
                                else { Text(ex).font(.body); if let p = w.exPy { Text(p).font(.footnote).foregroundStyle(Color.ink2) } }
                                Text(store.exTr(w)).font(.footnote).foregroundStyle(Color.ink3)
                            }.padding(.top, 6).multilineTextAlignment(.center)
                        }
                    }
                    .opacity(flipped ? 1 : 0)
                    .rotation3DEffect(.degrees(reduceMotion ? 0 : 180), axis: (x: 0, y: 1, z: 0))
                }
                .frame(maxWidth: .infinity, minHeight: 260).padding(20)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: 20))
                .foregroundStyle(Color.ink)
                .rotation3DEffect(.degrees(flipped && !reduceMotion ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.4)
            }
            .buttonStyle(.plain)
            .id(i) // a new card arrives face up instead of turning back
            .accessibilityHint(flipped ? "" : store.t("tapToFlip"))
            if flipped {
                // Four in a row, two by two at the largest text sizes
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: dynamicType.isAccessibilitySize ? 2 : 4), spacing: 8) {
                    rate(0, store.t("rateAgain"), "< 10 min", .bad)
                    rate(1, store.t("rateHard"), store.state.nextInterval(w.id, 1), .gold)
                    rate(2, store.t("rateGood"), store.state.nextInterval(w.id, 2), .good)
                    rate(3, store.t("rateEasy"), store.state.nextInterval(w.id, 3), .info)
                }
                SpeakButton(text: w.hz).frame(maxWidth: .infinity)
            } else {
                Button(store.t("showAnswer")) { flip(w) }.buttonStyle(.primary)
            }
        }
    }
    func flip(_ w: Word) {
        withAnimation(reduceMotion ? .easeInOut(duration: 0.2) : .spring(duration: 0.45, bounce: 0)) { flipped = true }
        if store.state.settings.autoSpeak { store.speaker.say(w.hz) }
    }
    func rate(_ q: Int, _ label: String, _ sub: String, _ c: Color) -> some View {
        Button {
            let w = queue[i]
            store.grade(w.id, q); store.recordAnswer(q >= 2)
            if q < 2 && !mistakes.contains(w) { mistakes.append(w) }
            if q == 0 { queue.append(w) }
            flipped = false
            if i + 1 >= queue.count { done(SessionResult(correct: count - mistakes.count, total: count, mistakes: mistakes)) } else { i += 1 }
        } label: {
            VStack(spacing: 2) { Text(label).font(.subheadline.weight(.semibold)); Text(sub).font(.caption2) }
                .frame(maxWidth: .infinity).padding(.vertical, 10)
                .background(c.opacity(0.14), in: RoundedRectangle(cornerRadius: 12)).foregroundStyle(c)
        }.buttonStyle(.plain)
    }
}

enum QuizDirection: String, CaseIterable {
    case hzTr, trHz, hzPy, pyHz, listen
    case picWord    // see a picture, pick the word
    case listenPic  // hear a word, pick the picture
    var listens: Bool { self == .listen || self == .listenPic }
}

/// Multiple choice, also used for listening (hear the word, pick it). Where a word has a picture, the meaning is
/// asked as a picture instead of a translation, so you connect the word with the thing itself.
struct ChoiceQuiz: View {
    @Environment(Store.self) var store
    let list: [Word]
    let direction: QuizDirection
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var picked: String?
    @State private var mistakes: [Word] = []
    @State private var options: [Word] = []

    var body: some View {
        let w = list[i]
        Page {
            ProgressHeader(i: i, n: list.count, extra: "✓ \(correct)")
            VStack(spacing: 10) { prompt(w) }.frame(maxWidth: .infinity).padding(.vertical, 20)
            if picturesOnly(w) {
                // Pictures as large tiles, two by two
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                    ForEach(options) { x in
                        Button { answer(x) } label: {
                            VStack(spacing: 4) {
                                Text(store.words.picture(x.id) ?? "").scaledFont(52)
                                if picked != nil { Text(store.tr(x)).font(.caption).foregroundStyle(Color.ink2).lineLimit(1) }
                            }
                            .frame(maxWidth: .infinity, minHeight: 104)
                            .background(bg(x), in: RoundedRectangle(cornerRadius: 16))
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(border(x), lineWidth: 1.5))
                        }
                        .buttonStyle(.plain).disabled(picked != nil)
                        .accessibilityLabel(store.tr(x))
                    }
                }
            } else {
                ForEach(Array(options.enumerated()), id: \.element.id) { k, x in
                    Button { answer(x) } label: {
                        HStack(spacing: 12) {
                            Text("\(k + 1)").font(.caption.weight(.bold)).frame(width: 24, height: 24).background(Color.sunken, in: Circle())
                            label(x).frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(14)
                        .background(bg(x), in: RoundedRectangle(cornerRadius: 14))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(border(x), lineWidth: 1.5))
                        .foregroundStyle(Color.ink)
                    }.buttonStyle(.plain).disabled(picked != nil)
                }
            }
            if let p = picked {
                let ok = p == w.id
                FeedbackBar(ok: ok, text: feedbackText(w, ok), speak: w.hz)
                Button(store.t("next")) { next() }.buttonStyle(.primary)
            }
        }
        .onAppear { if options.isEmpty { options = optionsFor(w) } ; if direction.listens { store.speaker.say(w.hz) } }
    }

    /// This question works with pictures: the picture modes, and meaning or listening questions about a word that has one
    func usesPictures(_ w: Word) -> Bool {
        [.picWord, .listenPic].contains(direction) || ([.hzTr, .listen].contains(direction) && store.words.picture(w.id) != nil)
    }
    /// The options are pictures alone (no words): the meaning is what is asked
    func picturesOnly(_ w: Word) -> Bool { usesPictures(w) && [.hzTr, .listenPic].contains(direction) }

    func feedbackText(_ w: Word, _ ok: Bool) -> AttributedString {
        var a = AttributedString((ok ? store.t("correct") : store.t("wrong")) + "  ")
        a.font = .body.bold()
        return a + AttributedString("\(w.hz) · \(w.py) · \(store.tr(w))")
    }

    @ViewBuilder func prompt(_ w: Word) -> some View {
        switch direction {
        case .hzTr, .hzPy:
            WordFace(word: w, size: 56)
            SpeakButton(text: w.hz, small: true)
        case .trHz:
            Text(store.tr(w)).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
            if let t2 = store.tr2(w) { Text(t2).foregroundStyle(Color.ink3) }
        case .pyHz:
            Text(w.py).font(.title)
        case .picWord:
            Text(store.words.picture(w.id) ?? "").scaledFont(88).accessibilityLabel(store.tr(w))
            Text(store.t("pictureQ")).foregroundStyle(Color.ink2)
        case .listen, .listenPic:
            Text(store.t(direction == .listenPic ? "hearPicQ" : "listenPrompt")).foregroundStyle(Color.ink2)
            Button { store.speaker.say(w.hz) } label: { Label(store.t("play"), systemImage: "play.fill").padding(.horizontal, 20) }.buttonStyle(PrimaryButtonStyle()).frame(width: 180)
            Text(store.t("listenHint")).font(.footnote).foregroundStyle(Color.ink3)
        }
    }
    @ViewBuilder func label(_ x: Word) -> some View {
        switch direction {
        case .hzTr: Text(store.tr(x)).lineLimit(2)
        case .hzPy: Pron(py: x.py, size: 19)
        case .listen where usesPictures(list[i]):
            HStack(spacing: 12) { Text(store.words.picture(x.id) ?? "").scaledFont(30); WordFace(word: x, size: 26) }
        default: WordFace(word: x, size: 26)
        }
    }
    func bg(_ x: Word) -> Color {
        guard let p = picked else { return .elevated }
        if x.id == list[i].id { return Color.good.opacity(0.15) }
        if x.id == p { return Color.bad.opacity(0.15) }
        return .elevated
    }
    func border(_ x: Word) -> Color {
        guard let p = picked else { return .ink.opacity(0.08) }
        return x.id == list[i].id ? .good : x.id == p ? .bad : .ink.opacity(0.08)
    }

    /// Options must look different: no repeated meaning, and with pinyin shown no repeated pinyin (他/她 are both tā)
    func optionsFor(_ w: Word) -> [Word] {
        let shown = { (x: Word) -> String in
            direction == .hzPy || store.pyFirst && direction != .hzTr ? x.py : direction == .hzTr ? store.tr(x) : x.hz
        }
        var seen: Set<String> = [shown(w)], out: [Word] = []
        var pool = store.words.selected.count >= 8 ? store.words.selected : store.words.all
        if usesPictures(w) {
            // Only words with pictures, preferably from the selected levels
            let withPics = { (l: [Word]) in l.filter { store.words.picture($0.id) != nil } }
            pool = withPics(store.words.selected).count >= 8 ? withPics(store.words.selected) : withPics(store.words.all)
        }
        for x in pool.shuffled() {
            if out.count == 3 { break }
            if x.id == w.id || seen.contains(shown(x)) { continue }
            if [.hzTr, .trHz].contains(direction) && store.tr(x) == store.tr(w) { continue }
            seen.insert(shown(x)); out.append(x)
        }
        return ([w] + out).shuffled()
    }
    func answer(_ x: Word) {
        guard picked == nil else { return }
        let w = list[i], ok = x.id == w.id
        picked = x.id
        Haptic.answer(ok)
        store.answer(w, ok: ok)
        if ok { correct += 1 } else { mistakes.append(w) }
        if store.state.settings.autoSpeak && !direction.listens { store.speaker.say(w.hz) }
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes)); return }
        i += 1; picked = nil; options = optionsFor(list[i])
        if direction.listens { store.speaker.say(list[i].hz) }
    }
}

/// A text field for pinyin: tone numbers turn into marks as you type (ni3 → nǐ)
struct PinyinField: View {
    @Environment(Store.self) var store
    let placeholder: String
    @Binding var text: String
    var submit: () -> Void
    @FocusState private var focused: Bool
    var autofocus = true
    var body: some View {
        TextField(placeholder, text: $text)
            .font(.title3)
            .textInputAutocapitalization(.never).autocorrectionDisabled()
            .keyboardType(store.course.id == "zh" ? .asciiCapable : .default)
            .submitLabel(.done)
            .padding(14).background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.ink.opacity(0.12)))
            .focused($focused)
            .onSubmit(submit)
            .onChange(of: text) { _, v in
                if store.course.id == "zh", v.contains(where: { ("1"..."5").contains($0) }) { text = Lingo.numToMarks(v) }
            }
            .onAppear { if autofocus { focused = true } }
    }
}

/// See (or hear) a word, type its pinyin / reading / Vietnamese spelling
struct TypeWord: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var input = ""
    @State private var result: Bool?
    @State private var mistakes: [Word] = []

    var body: some View {
        let w = list[i]
        Page {
            ProgressHeader(i: i, n: list.count, extra: "✓ \(correct)")
            VStack(spacing: 10) {
                if store.pyFirst || store.course.id == "vi" {
                    Text(store.tr(w)).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
                    if store.pyFirst { SpeakButton(text: w.hz, small: true) }
                } else {
                    Text(w.hz).hanziFont(52)
                    Text(store.tr(w)).foregroundStyle(Color.ink2)
                }
            }.frame(maxWidth: .infinity).padding(.vertical, 20)
            PinyinField(placeholder: store.t("typePlaceholder"), text: $input) { result == nil ? check() : next() }
                .id(i)
                .disabled(result != nil)
            Text(store.t("typeHint")).font(.footnote).foregroundStyle(Color.ink3).frame(maxWidth: .infinity)
            if let ok = result {
                let shown = store.course.id == "vi" ? "\(w.hz) [\(w.py)]" : w.py
                FeedbackBar(ok: ok, text: AttributedString((ok ? store.t("correct") : store.t("wrong")) + "  " + store.t("answerWas") + " " + shown), speak: w.hz)
                Button(store.t("next")) { next() }.buttonStyle(.primary)
            } else {
                HStack {
                    Button(store.t("skip")) { reveal(false) }.buttonStyle(.secondary)
                    Button(store.t("check")) { check() }.buttonStyle(.primary)
                }
            }
        }
        .onAppear { if store.pyFirst { store.speaker.say(list[i].hz) } }
    }
    func check() {
        // Tone numbers typed just before Return may not have turned into marks yet
        let v = store.course.id == "zh" ? Lingo.numToMarks(input) : input
        if !v.trimmingCharacters(in: .whitespaces).isEmpty { reveal(Check.typedWord(v, list[i])) }
    }
    func reveal(_ ok: Bool) {
        let w = list[i]
        result = ok
        Haptic.answer(ok)
        store.answer(w, ok: ok)
        if ok { correct += 1 } else { mistakes.append(w) }
        if store.state.settings.autoSpeak { store.speaker.say(w.hz) }
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes)); return }
        i += 1; input = ""; result = nil
        if store.pyFirst { store.speaker.say(list[i].hz) }
    }
}

/// First contact with a new word: listen and repeat
struct Meet: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0

    var body: some View {
        let w = list[i]
        Page {
            ProgressHeader(i: i, n: list.count)
            CardBox(padding: 24) {
                VStack(spacing: 10) {
                    WordPicture(word: w, size: 72)
                    WordFace(word: w, size: 60)
                    if store.pyFirst { Text(w.hz).hanziFont(24).foregroundStyle(Color.ink2) } else { Pron(py: w.py, size: 22) }
                    Text(store.tr(w)).font(.title3).multilineTextAlignment(.center)
                    HStack {
                        Button { store.speaker.say(w.hz) } label: { Label(store.t("play"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.secondary)
                        Button { store.speaker.say(w.hz, rate: 0.55) } label: { Label(store.t("slowly"), systemImage: "tortoise.fill") }.buttonStyle(.secondary)
                    }.padding(.top, 6)
                    if let ex = w.ex { ExampleBox(word: w, ex: ex) }
                    Label(store.t("sayAloud"), systemImage: "person.wave.2").font(.subheadline).foregroundStyle(Color.ink2).padding(.top, 4)
                }.frame(maxWidth: .infinity)
            }
            Button(store.t("next")) {
                if store.state.card(w.id) == nil { store.update { $0.markLearning(w.id) } }
                if i + 1 >= list.count { done(SessionResult(correct: list.count, total: list.count, mistakes: [])) } else { i += 1; store.speaker.say(list[i].hz) }
            }.buttonStyle(.primary)
        }
        .onAppear { store.speaker.say(w.hz) }
    }
}

struct ExampleBox: View {
    @Environment(Store.self) var store
    let word: Word
    let ex: String
    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                if store.pyFirst, let p = word.exPy { PinyinText(py: p, size: 17); Text(ex).font(.footnote).foregroundStyle(Color.ink2) }
                else { Text(ex).font(.body); if let p = word.exPy { Text(p).font(.footnote).foregroundStyle(Color.ink2) } }
                Text(store.exTr(word)).font(.footnote).foregroundStyle(Color.ink3)
            }.frame(maxWidth: .infinity, alignment: .leading)
            SpeakButton(text: ex, small: true)
        }
        .padding(12).background(Color.sunken, in: RoundedRectangle(cornerRadius: 12))
    }
}

/// Say the word: the microphone checks it; for short Chinese words you see your tone curve
struct SayWord: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var spoken: Spoken?
    @State private var selfOK: Bool?
    @State private var mistakes: [Word] = []

    var body: some View {
        let w = list[i]
        let pitch = w.py.split(separator: " ").count <= 2 && Lingo.pyParts(w.py).filter { !$0.sep }.count <= 4
        Page {
            ProgressHeader(i: i, n: list.count, extra: "✓ \(correct)")
            CardBox(padding: 22) {
                VStack(spacing: 10) {
                    WordPicture(word: w, size: 72)
                    WordFace(word: w, size: 60)
                    if store.pyFirst { Text(w.hz).hanziFont(24).foregroundStyle(Color.ink2) } else { Pron(py: w.py, size: 22) }
                    Text(store.tr(w)).font(.title3).multilineTextAlignment(.center)
                    HStack(spacing: 12) {
                        Button { store.speaker.say(w.hz) } label: { Label(store.t("playModel"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.bordered).tint(.ink)
                        MicButton(key: "w\(i)", target: w.hz, py: w.py, pitch: pitch) { spoken = $0; selfOK = nil }
                    }.padding(.top, 6)
                }.frame(maxWidth: .infinity)
                if let s = spoken {
                    Divider()
                    SpokenResult(hz: w.hz, py: w.py, spoken: s) { selfOK = $0 }.id(s.ms)
                }
            }
            if spoken != nil {
                HStack {
                    Button { spoken = nil } label: { Label(store.t("again"), systemImage: "arrow.counterclockwise") }.buttonStyle(.secondary)
                    Button(store.t("next")) { next() }.buttonStyle(.primary)
                }
            } else {
                // No microphone at hand: move on without grading the word
                Button(store.t("skip")) { store.mic.cancel(); advance() }.buttonStyle(.secondary)
            }
        }
        .onDisappear { store.mic.cancel() }
    }
    func advance() {
        spoken = nil; selfOK = nil
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes)) } else { i += 1 }
    }
    func next() {
        let w = list[i]
        let ok = selfOK ?? ((spoken?.score ?? 0) >= 0.8)
        store.answer(w, ok: ok)
        if ok { correct += 1 } else { mistakes.append(w) }
        advance()
    }
}

/// Match six words with their meanings against the clock
struct MatchGame: View {
    @Environment(Store.self) var store
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    let pairs: [Word]
    let done: (SessionResult) -> Void
    @State private var left: [Word] = []
    @State private var right: [Word] = []
    @State private var selected: (side: Int, id: String)?
    @State private var matched: Set<String> = []
    @State private var shake: Set<String> = []
    @State private var mistakes = 0
    @State private var wrong: [Word] = []
    @State private var start = Date()

    var body: some View {
        Page {
            HStack {
                Text(store.t("matchTitle")).font(.headline)
                Text(store.t("pairsLeft", pairs.count - matched.count)).font(.subheadline).foregroundStyle(Color.ink2)
                Spacer()
                TimelineView(.periodic(from: start, by: 1)) { ctx in Text(fmtTime(ctx.date.timeIntervalSince(start) * 1000)).monospacedDigit().foregroundStyle(Color.ink2) }
            }
            HStack(alignment: .top, spacing: 10) {
                VStack(spacing: 10) { ForEach(left) { w in card(w, side: 0) { WordFace(word: w, size: 26) } } }
                VStack(spacing: 10) { ForEach(right) { w in card(w, side: 1) { Text(store.tr(w)).font(.subheadline).multilineTextAlignment(.center).lineLimit(3) } } }
            }
        }
        .onAppear { if left.isEmpty { left = pairs.shuffled(); right = pairs.shuffled(); start = Date() } }
    }
    func card<C: View>(_ w: Word, side: Int, @ViewBuilder content: () -> C) -> some View {
        let isSel = selected?.side == side && selected?.id == w.id, isDone = matched.contains(w.id)
        return Button { pick(w, side) } label: {
            content().frame(maxWidth: .infinity, minHeight: 64).padding(8)
                .background(isDone ? Color.good.opacity(0.15) : shake.contains("\(side)\(w.id)") ? Color.bad.opacity(0.15) : isSel ? Color.accentRed.opacity(0.14) : Color.elevated, in: RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(isSel ? Color.accentRed : Color.ink.opacity(0.08), lineWidth: 1.5))
                .foregroundStyle(Color.ink).opacity(isDone ? 0.45 : 1)
                .offset(x: shake.contains("\(side)\(w.id)") && !reduceMotion ? 6 : 0)
        }
        .buttonStyle(.plain).disabled(isDone)
        .accessibilityAddTraits(isSel ? .isSelected : [])
    }
    func pick(_ w: Word, _ side: Int) {
        if side == 0 { store.speaker.say(w.hz) }
        guard let s = selected, s.side != side else { selected = (side, w.id); return }
        selected = nil
        if s.id == w.id {
            withAnimation(.easeOut(duration: 0.2)) { _ = matched.insert(w.id) }
            Haptic.success(); store.recordAnswer(true)
            if matched.count == pairs.count {
                let elapsed = fmtTime(Date().timeIntervalSince(start) * 1000)
                Task { try? await Task.sleep(for: .milliseconds(400)); done(SessionResult(correct: pairs.count, total: pairs.count, mistakes: wrong, extra: "\(store.t("timeTaken")) \(elapsed) · \(mistakes) \(store.t("mistakes"))")) }
            }
        } else {
            mistakes += 1; Haptic.error(); store.recordAnswer(false)
            if let a = pairs.first(where: { $0.id == s.id }), !wrong.contains(a) { wrong.append(a) }
            let keys: Set<String> = ["\(s.side)\(s.id)", "\(side)\(w.id)"]
            // A short nudge for a wrong pair; with Reduce Motion the red tint alone says it
            withAnimation(reduceMotion ? nil : .spring(duration: 0.12, bounce: 0.5)) { shake = keys }
            Task { try? await Task.sleep(for: .milliseconds(reduceMotion ? 500 : 250)); withAnimation(.spring(duration: 0.3, bounce: 0)) { shake = [] } }
        }
    }
}

/// Generic "hear it, pick one" round: tones, numbers and similar sounds use it
struct PickRound: View {
    struct Question { let play: () -> Void; let prompt: AnyView; let options: [AnyView]; let answer: Int; let reveal: AttributedString; let mistake: Word? }
    @Environment(Store.self) var store
    let questions: [Question]
    var header: AnyView?
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var picked: Int?
    @State private var mistakes: [Word] = []

    var body: some View {
        let q = questions[i]
        Page {
            if let header { header }
            ProgressHeader(i: i, n: questions.count, extra: "✓ \(correct)")
            VStack(spacing: 10) { q.prompt }.frame(maxWidth: .infinity).padding(.vertical, 16)
            ForEach(Array(q.options.enumerated()), id: \.offset) { k, v in
                Button { pick(k) } label: {
                    HStack(spacing: 12) {
                        Text("\(k + 1)").font(.caption.weight(.bold)).frame(width: 24, height: 24).background(Color.sunken, in: Circle())
                        v.frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(14)
                    .background(picked == nil ? Color.elevated : k == q.answer ? Color.good.opacity(0.15) : k == picked ? Color.bad.opacity(0.15) : Color.elevated, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(picked == nil ? Color.ink.opacity(0.08) : k == q.answer ? Color.good : k == picked ? Color.bad : Color.ink.opacity(0.08), lineWidth: 1.5))
                    .foregroundStyle(Color.ink)
                }.buttonStyle(.plain).disabled(picked != nil)
            }
            if let p = picked {
                FeedbackBar(ok: p == q.answer, text: q.reveal)
                Button(store.t("next")) { next() }.buttonStyle(.primary)
            }
        }
        .onAppear { q.play() }
    }
    func pick(_ k: Int) {
        let q = questions[i]
        picked = k
        Haptic.answer(k == q.answer)
        store.recordAnswer(k == q.answer)
        if k == q.answer { correct += 1 } else if let m = q.mistake { mistakes.append(m) }
    }
    func next() {
        if i + 1 >= questions.count { done(SessionResult(correct: correct, total: questions.count, mistakes: mistakes)); return }
        i += 1; picked = nil; questions[i].play()
    }
}
