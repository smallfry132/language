import SwiftUI
import LanguageCore

/* The exercises. Each takes a list of words and reports a SessionResult when finished;
 * the practice screens and the guided session (Today) decide what happens next. */

struct SessionResult {
    var correct: Int
    var total: Int
    var mistakes: [Word]
    var extra: String?
    /// Why each mistake was one (typed …, picked …, Again), for the Watch these list of the daily session
    var why: [String: String] = [:]
}

/// "Again" means a word comes back at the end of the session. The card as on the style canvas: the word large
/// (in its 田字格 for Chinese), its sound with the tone, the meaning, an example; Vietnamese starts from the sound.
struct Flashcards: View {
    @Environment(Store.self) var store
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    @Environment(\.dynamicTypeSize) var dynamicType
    @State var queue: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var flipped = false
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]
    private let count: Int

    init(words: [Word], done: @escaping (SessionResult) -> Void) { _queue = State(initialValue: words); count = words.count; self.done = done }

    var listenFirst: Bool { store.course.id == "vi" }
    var radius: CGFloat { Look.current.radius }

    var body: some View {
        let w = queue[min(i, queue.count - 1)]
        Page {
            ProgressHeader(i: i, n: queue.count)
            ZStack {
                front(w).opacity(flipped ? 0 : 1)
                back(w).opacity(flipped ? 1 : 0)
                    .rotation3DEffect(.degrees(reduceMotion ? 0 : 180), axis: (x: 0, y: 1, z: 0))
            }
            .frame(maxWidth: .infinity, minHeight: 360, alignment: .top).padding(18)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: radius + 2))
            .overlay(RoundedRectangle(cornerRadius: radius + 2).stroke(Color.line))
            .overlay(alignment: .top) {
                HStack { Text(store.t(frontLabel(w))); Spacer(); Text(flipped ? "2 / 2" : "1 / 2") }
                    .font(.caption2).foregroundStyle(Color.ink2).padding(.horizontal, 18).padding(.top, 12)
                    // turns with the card: turned back once more so it reads the right way round
                    .rotation3DEffect(.degrees(flipped && !reduceMotion ? 180 : 0), axis: (x: 0, y: 1, z: 0))
            }
            .foregroundStyle(Color.ink)
            .rotation3DEffect(.degrees(flipped && !reduceMotion ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.4)
            .contentShape(Rectangle())
            .onTapGesture { if !flipped { flip(w) } }
            .id(i) // a new card arrives face up instead of turning back
            .accessibilityHint(flipped ? "" : store.t("tapToFlip"))
            if flipped {
                // Four in a row, two by two at the largest text sizes
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: dynamicType.isAccessibilitySize ? 2 : 4), spacing: 6) {
                    rate(0, store.t("rateAgain"), "< 10 min")
                    rate(1, store.t("rateHard"), store.state.nextInterval(w.id, 1))
                    rate(2, store.t("rateGood"), store.state.nextInterval(w.id, 2))
                    rate(3, store.t("rateEasy"), store.state.nextInterval(w.id, 3))
                }
            } else {
                Button(store.t("showAnswer")) { flip(w) }.buttonStyle(.primary)
            }
        }
        .onAppear { if listenFirst { store.speaker.say(w.hz) }; if Launch.has("-flip") && !flipped { flip(w) } } // -flip: for screenshots
        .onChange(of: i) { if listenFirst { store.speaker.say(queue[i].hz) } }
    }

    /// Korean (round 2): a word with a picture starts from the picture
    func picFirst(_ w: Word) -> Bool { store.course.id == "ko" && store.words.picture(w.id) != nil }
    func frontLabel(_ w: Word) -> String {
        listenFirst ? "cardListen" : picFirst(w) ? "cardPicKo" : store.course.id == "ja" && w.kana != nil && w.kana != w.hz ? "cardKanji" : "cardFront"
    }

    @ViewBuilder func front(_ w: Word) -> some View {
        VStack(spacing: 14) {
            Spacer(minLength: 30)
            if picFirst(w), let p = store.words.picture(w.id) {
                Text(p).font(.system(size: 84)).accessibilityLabel(store.t("picture"))
            } else if listenFirst {
                Button { store.speaker.say(w.hz) } label: {
                    Image(systemName: "speaker.wave.2.fill").font(.largeTitle).frame(width: 96, height: 96)
                        .background(Color.action, in: RoundedRectangle(cornerRadius: 24)).foregroundStyle(Color.onAction)
                }.buttonStyle(.card).accessibilityLabel(store.t("play"))
                Text(store.t("listenHint")).font(.footnote).foregroundStyle(Color.ink2)
            } else if store.course.id == "zh" && !store.pyFirst {
                GridChars(text: w.hz, cell: w.hz.count > 2 ? 72 : w.hz.count == 2 ? 104 : 140)
            } else {
                WordFace(word: w, size: 64)
            }
            Text(store.t("tapToFlip")).font(.footnote).foregroundStyle(Color.ink3)
            Spacer(minLength: 0)
        }.frame(maxWidth: .infinity)
    }

    @ViewBuilder func back(_ w: Word) -> some View {
        VStack(spacing: 10) {
            Spacer(minLength: 22)
            if store.course.id == "zh" { GridChars(text: w.hz, cell: w.hz.count > 2 ? 64 : w.hz.count == 2 ? 92 : 120) }
            else if store.course.id == "vi" {
                let n = Lingo.firstTone(w.hz, course: "vi")
                HStack(spacing: 6) { ToneIcon(n: n, course: "vi").scaleEffect(0.6).frame(width: 30, height: 22); Text(ViTone.name(n)).font(.caption.weight(.bold)) }
                    .foregroundStyle(Look.toneColors ? Color.viTone(n) : Color.ink2)
                VietText(text: w.hz, size: 52, weight: .heavy).lineLimit(1).minimumScaleFactor(0.5)
            } else if store.course.id == "ja" {
                // Kanji with its reading above (ruby), romaji under it
                VStack(spacing: 0) {
                    if let k = w.kana, k != w.hz { Text(k).hanziFont(16).foregroundStyle(Color.ink2) }
                    Text(w.hz).hanziFont(60).lineLimit(1).minimumScaleFactor(0.4)
                }
                Text(w.romaji ?? w.py).font(.title3).foregroundStyle(Color.ink2)
            } else if store.course.id == "ko" {
                if picFirst(w), let p = store.words.picture(w.id) { Text(p).font(.system(size: 44)).accessibilityHidden(true) }
                Text(w.hz).hanziFont(52).lineLimit(1).minimumScaleFactor(0.4)
                Text(w.py + (w.pron.map { " · [\($0)]" } ?? "")).font(.title3.weight(.semibold)).foregroundStyle(Color.ink2)
                JamoTiles(text: w.hz)
            } else { WordHero(word: w, size: 52) }
            HStack(spacing: 10) {
                if store.course.id == "zh" {
                    PinyinText(py: w.py, size: 30, weight: .bold)
                    let n = Lingo.firstTone(w.py, course: "zh")
                    if n >= 1 && n <= 4 {
                        Text(store.t("toneN", n)).font(.caption.weight(.medium)).padding(.horizontal, 8).padding(.vertical, 4)
                            .foregroundStyle(Look.toneColors ? Color.tone(n) : Color.ink2)
                            .overlay(Rectangle().stroke(Look.toneColors ? Color.tone(n) : Color.line))
                    }
                } else if store.course.id == "vi" { Text(w.py).font(.subheadline).foregroundStyle(Color.ink3) }
                Button { store.speaker.say(w.hz) } label: {
                    Image(systemName: "speaker.wave.2").frame(width: 40, height: 40)
                        .background(Color.paper, in: RoundedRectangle(cornerRadius: radius)).overlay(RoundedRectangle(cornerRadius: radius).stroke(Color.line))
                }.buttonStyle(.card).accessibilityLabel(store.t("play"))
            }
            Text(store.tr(w)).font(.title3.weight(.medium)).multilineTextAlignment(.center)
            if store.course.id == "ja", let k = w.kana {
                HStack(spacing: 4) {
                    ForEach(Array(k.enumerated()), id: \.offset) { _, c in
                        Text(String(c)).hanziFont(18).frame(width: 34, height: 34)
                            .background(Color.paper, in: RoundedRectangle(cornerRadius: 6)).overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.line))
                    }
                }.accessibilityHidden(true)
            }
            if store.course.id == "ko", let tip = Library.shared.tips.tip(for: w, lang: store.state.lang), !tip.sound.isEmpty {
                Text(tip.sound).font(.footnote).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
            }
            if let p = store.words.picture(w.id), !picFirst(w) { Text(p).font(.title).accessibilityHidden(true) }
            if store.course.id == "vi" { ToneFamily(word: w) }
            Spacer(minLength: 0)
            if let ex = w.ex {
                Divider()
                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(highlight(ex, w.hz)).hanziFont(store.course.script == .cjk ? 18 : 16)
                        if let p = w.exPy, store.course.id != "vi" { (store.course.id == "zh" ? Text(PinyinText.attributed(p)) : Text(p)).font(.caption) }
                        Text(store.exTr(w)).font(.caption).foregroundStyle(Color.ink2)
                    }
                    Spacer(minLength: 8)
                    Button { store.speaker.say(ex) } label: { Image(systemName: "speaker.wave.2").frame(width: 40, height: 40) }
                        .buttonStyle(.card).accessibilityLabel(store.t("play"))
                }
            }
        }.frame(maxWidth: .infinity)
    }
    func highlight(_ s: String, _ part: String) -> AttributedString {
        var a = AttributedString(s)
        if let r = a.range(of: part, options: .caseInsensitive) { a[r].foregroundColor = .accent }
        return a
    }

    func flip(_ w: Word) {
        withAnimation(reduceMotion ? .easeInOut(duration: 0.2) : .spring(duration: 0.45, bounce: 0)) { flipped = true }
        if store.state.settings.autoSpeak && !listenFirst { store.speaker.say(w.hz) }
    }
    /// Again in the accent, Good filled (the usual answer), Hard and Easy outlined
    func rate(_ q: Int, _ label: String, _ sub: String) -> some View {
        Button {
            let w = queue[i]
            store.grade(w.id, q); store.recordAnswer(q >= 2)
            if q < 2 && !mistakes.contains(w) { mistakes.append(w); why[w.id] = store.t(q == 0 ? "whyAgain" : "rateHard") }
            if q == 0 { queue.append(w) }
            flipped = false
            if i + 1 >= queue.count { done(SessionResult(correct: count - mistakes.count, total: count, mistakes: mistakes, why: why)) } else { i += 1 }
        } label: {
            VStack(spacing: 2) { Text(label).font(.subheadline.weight(.bold)); Text(sub).font(.caption2).opacity(0.8) }
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(q == 2 ? Color.action : Color.elevated, in: RoundedRectangle(cornerRadius: radius))
                .overlay(RoundedRectangle(cornerRadius: radius).stroke(q == 0 ? Color.accent : q == 2 ? Color.clear : Color.line, lineWidth: q == 0 ? 1.5 : 1))
                .foregroundStyle(q == 2 ? Color.onAction : q == 0 ? Color.accent : Color.ink)
        }.buttonStyle(.card)
    }
}

/// Vietnamese: the words that differ from this one only by tone (tra · trà · trả · trại), tap to hear the contrast
struct ToneFamily: View {
    @Environment(Store.self) var store
    let word: Word
    var body: some View {
        let key = Lingo.stripVi(word.hz)
        let family = store.words.all.filter { Lingo.stripVi($0.hz) == key }.reduce(into: [Word]()) { l, x in if !l.contains(where: { $0.hz == x.hz }) { l.append(x) } }
        if family.count > 1 {
            VStack(spacing: 6) {
                HStack(spacing: 6) {
                    ForEach(family.prefix(5)) { x in
                        Button { store.speaker.say(x.hz); store.toast("\(x.hz) · \(store.tr(x))") } label: {
                            VietText(text: x.hz, size: 17, weight: .bold).padding(.horizontal, 12).frame(minHeight: 40)
                                .background(x.id == word.id ? Color.sunken : Color.paper, in: RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(x.id == word.id ? Color.ink : Color.line))
                        }.buttonStyle(.card)
                    }
                }
                Text(store.t("toneFamily")).font(.caption2).foregroundStyle(Color.ink2)
            }
        }
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
    @State private var why: [String: String] = [:]
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
                            .contentShape(RoundedRectangle(cornerRadius: 16)) // the whole tile is the button, not only the picture
                        }
                        .buttonStyle(.card).disabled(picked != nil)
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
                        .contentShape(RoundedRectangle(cornerRadius: 14)) // the whole card is the button, not only the word
                    }.buttonStyle(.card).disabled(picked != nil)
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
        if ok { correct += 1 } else {
            mistakes.append(w)
            let c = store.course.id
            why[w.id] = store.t("whyPicked", [.hzTr, .picWord, .listenPic].contains(direction) ? store.tr(x) : "\(store.tr(x)) (\(c == "zh" || c == "ja" ? x.py : x.hz))")
        }
        if store.state.settings.autoSpeak && !direction.listens { store.speaker.say(w.hz) }
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes, why: why)); return }
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
            .onSubmit { settleMarks(); submit() }
            // Tone numbers become marks once typing pauses: rewriting the field while keys are still arriving loses letters
            .task(id: text) {
                try? await Task.sleep(for: .milliseconds(700))
                if !Task.isCancelled { settleMarks() }
            }
            .onAppear { if autofocus { focused = true } }
    }
    func settleMarks() {
        if store.course.id == "zh", text.contains(where: { ("1"..."5").contains($0) }) { text = Lingo.numToMarks(text) }
    }
}

/// See (or hear) a word, type its pinyin / reading / Vietnamese spelling. Chinese and Vietnamese (style canvas,
/// round 2): type the letters, then tap each syllable's tone (4 or 6 tiles; a second tap clears a Chinese tone =
/// neutral). Tone numbers and Telex marks work too; every tone has to be right.
struct TypeWord: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var input = ""
    @State private var result: Bool?
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]
    @FocusState private var focused: Bool

    var course: String { store.course.id }
    var pick: Bool { course == "zh" || course == "vi" }

    var body: some View {
        let w = list[i]
        Page {
            ProgressHeader(i: i, n: list.count, extra: "✓ \(correct)")
            if pick { pickerPrompt(w) } else {
                VStack(spacing: 10) {
                    // Only Japanese shows the word (you type its reading); elsewhere the meaning is the prompt, as on the web
                    if store.pyFirst || course != "ja" {
                        if let p = store.words.picture(w.id), course != "zh" { Text(p).font(.system(size: 48)).accessibilityHidden(true) }
                        Text(store.tr(w)).font(.title2.weight(.semibold)).multilineTextAlignment(.center)
                        SpeakButton(text: w.hz, small: true)
                    } else {
                        Text(w.hz).hanziFont(52)
                        Text(store.tr(w)).foregroundStyle(Color.ink2)
                    }
                }.frame(maxWidth: .infinity).padding(.vertical, 20)
                PinyinField(placeholder: store.t("typePlaceholder"), text: $input) { result == nil ? check() : next() }
                    .id(i)
                    .disabled(result != nil)
                Text(store.t("typeHint")).font(.footnote).foregroundStyle(Color.ink3).frame(maxWidth: .infinity)
            }
            if let ok = result {
                FeedbackBar(ok: ok, text: answerText(w, ok), speak: w.hz)
                Button(store.t("next")) { next() }.buttonStyle(.primary)
            } else {
                VStack(spacing: 6) {
                    Button(store.t("check")) { check() }.buttonStyle(.primary)
                    Button(store.t(pick ? "dontKnow" : "skip")) { reveal(false) }
                        .font(.subheadline).foregroundStyle(Color.ink2).frame(maxWidth: .infinity, minHeight: 44)
                }.padding(.top, 6)
            }
        }
        .onAppear {
            if store.pyFirst || pick { store.speaker.say(list[i].hz) }
            if let v = Launch.value("-typed") { input = v } // for screenshots
        }
    }

    @ViewBuilder func pickerPrompt(_ w: Word) -> some View {
        let r = Look.current.radius
        HStack(spacing: 14) {
            if let p = store.words.picture(w.id) {
                Text(p).font(.system(size: 40)).frame(width: 72, height: 72)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: r)).overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(store.tr(w)).font(.title3.weight(.bold))
                if course == "zh" { Text(w.hz).hanziFont(18).foregroundStyle(Color.ink2) } else if let t2 = store.tr2(w) { Text(t2).foregroundStyle(Color.ink2) }
            }
            Spacer()
            Button { store.speaker.say(w.hz) } label: {
                Image(systemName: "speaker.wave.2").frame(width: 44, height: 44)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: r)).overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
            }.buttonStyle(.card).foregroundStyle(Color.ink).accessibilityLabel(store.t("hearIt"))
        }.padding(.bottom, 8)
        CapsLabel(text: store.t(course == "zh" ? "typeThePinyin" : "typeTheWord"))
        TextField("", text: $input)
            .font(.system(size: 26, weight: .medium))
            .textInputAutocapitalization(.never).autocorrectionDisabled()
            .keyboardType(course == "zh" ? .asciiCapable : .default)
            .submitLabel(.done)
            .frame(height: 52)
            .overlay(alignment: .bottom) { Rectangle().fill(Color.ink).frame(height: 2) }
            .focused($focused)
            .disabled(result != nil)
            .onSubmit { result == nil ? check() : next() }
            // Tone numbers become marks once typing pauses (the syllable tiles show them right away);
            // rewriting the field while keys are still arriving loses letters
            .task(id: input) {
                try? await Task.sleep(for: .milliseconds(700))
                if !Task.isCancelled, result == nil, course == "zh", input.contains(where: { ("1"..."5").contains($0) }) { input = Lingo.numToMarks(input) }
            }
            .onAppear { focused = true }
            .id(i)
            .accessibilityIdentifier("TypeField")
        Text(store.t(course == "vi" ? "typePickHintVi" : "typePickHint")).font(.caption).foregroundStyle(Color.ink2)
        let syls = typedSyllables(input)
        if !syls.isEmpty {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                ForEach(Array(syls.enumerated()), id: \.offset) { k, x in syllableCard(k, x) }
            }.padding(.top, 8)
            Text(store.t(course == "vi" ? "eachSyllableVi" : "eachSyllable")).font(.caption).foregroundStyle(Color.ink2).multilineTextAlignment(.center).frame(maxWidth: .infinity)
        }
    }

    func syllableCard(_ k: Int, _ x: (text: String, tone: Int)) -> some View {
        let n = course == "zh" ? 4 : 6, r = Look.current.radius
        let color = { (t: Int) -> Color in Look.toneColors ? (course == "zh" ? Color.tone(t) : Color.viTone(t)) : Color.ink }
        return VStack(spacing: 10) {
            Text(x.text).font(.system(size: 28, weight: .bold)).foregroundStyle(x.tone > 0 ? color(x.tone) : Color.ink).lineLimit(1).minimumScaleFactor(0.5)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: n == 4 ? 4 : 3), spacing: 4) {
                ForEach(1...n, id: \.self) { t in
                    let on = x.tone == t
                    Button { tap(k, t) } label: {
                        ToneIcon(n: t, course: course).scaleEffect(0.45).frame(width: 24, height: 18)
                            .frame(maxWidth: .infinity, minHeight: 40)
                            .background(on ? color(t).opacity(0.12) : Color.paper, in: RoundedRectangle(cornerRadius: max(r - 4, 2)))
                            .overlay(RoundedRectangle(cornerRadius: max(r - 4, 2)).stroke(on ? color(t) : Color.line, lineWidth: on ? 2 : 1))
                    }
                    .buttonStyle(.card).disabled(result != nil)
                    .accessibilityLabel(toneName(store, t)).accessibilityAddTraits(on ? .isSelected : [])
                }
            }
        }
        .padding(12).frame(maxWidth: .infinity)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
        .overlay(RoundedRectangle(cornerRadius: r).stroke(x.tone > 0 ? Color.line : Color.ink2, style: StrokeStyle(lineWidth: x.tone > 0 ? 1 : 1.5, dash: x.tone > 0 ? [] : [5, 3])))
    }

    /// The syllables typed so far, each with its tone (Chinese: 0 = none chosen yet; Vietnamese: no mark = ngang)
    func typedSyllables(_ v: String) -> [(text: String, tone: Int)] {
        if course == "vi" { return v.split(whereSeparator: { $0.isWhitespace }).map { (String($0), Lingo.firstTone(String($0), course: "vi")) } }
        return Lingo.pyParts(Lingo.numToMarks(v)).filter { !$0.sep }.map { ($0.text, Lingo.toneSeq($0.text).first ?? 0) }
    }
    func tap(_ k: Int, _ t: Int) {
        var cur = typedSyllables(input)
        guard k < cur.count else { return }
        if course == "vi" { cur[k].text = Lingo.viMark(cur[k].text, t) }
        else {
            let marks: Set<Unicode.Scalar> = ["\u{0300}", "\u{0301}", "\u{0304}", "\u{030C}"]
            let plain = String(String.UnicodeScalarView(cur[k].text.decomposedStringWithCanonicalMapping.unicodeScalars.filter { !marks.contains($0) })).precomposedStringWithCanonicalMapping
            cur[k].text = Lingo.markSyllable(plain, cur[k].tone == t ? 5 : t)
        }
        input = cur.map(\.text).joined(separator: course == "vi" ? " " : "")
    }

    func answerText(_ w: Word, _ ok: Bool) -> AttributedString {
        var a = AttributedString((ok ? store.t("correct") : store.t("wrong")) + "  " + store.t("answerWas") + " ")
        switch course {
        case "zh": a += PinyinText.attributed(w.py)
        case "vi": a += VietText.attributed(w.hz)
        case "ja": a += AttributedString(w.py)
        case "de", "es": a += GenderText.attributed(w)
        default: a += AttributedString(w.py.isEmpty ? w.hz : "\(w.hz) [\(w.py)]")
        }
        return a
    }
    func check() {
        let w = list[i]
        // Tone numbers typed just before Return may not have turned into marks yet
        let v = course == "zh" ? Lingo.numToMarks(input) : input
        guard !v.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        switch course {
        case "zh": reveal(Lingo.stripTones(v) == Lingo.stripTones(w.py) && Lingo.toneSeq(v) == Lingo.toneSeq(w.py))
        case "vi":
            let a = v.lowercased().split(whereSeparator: { $0.isWhitespace }), b = w.hz.lowercased().split(whereSeparator: { $0.isWhitespace })
            reveal(Lingo.stripVi(v) == Lingo.stripVi(w.hz) && a.count == b.count && zip(a, b).allSatisfy { Lingo.firstTone(String($0), course: "vi") == Lingo.firstTone(String($1), course: "vi") })
        default: reveal(Check.typedWord(v, w))
        }
    }
    func reveal(_ ok: Bool) {
        let w = list[i]
        result = ok
        Haptic.answer(ok)
        store.answer(w, ok: ok)
        if ok { correct += 1 } else {
            mistakes.append(w)
            let v = input.trimmingCharacters(in: .whitespaces)
            why[w.id] = v.isEmpty ? store.t("whyNotHeard") : store.t("whyTyped", v)
        }
        if store.state.settings.autoSpeak { store.speaker.say(w.hz) }
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes, why: why)); return }
        i += 1; input = ""; result = nil
        if store.pyFirst || pick { store.speaker.say(list[i].hz) }
    }
}

/// First contact with a new word (style canvas, round 2): its tone, picture and reading, Play and 0.75×,
/// a Say-it tip for the trickiest sound and the tone, an example with the word underlined; I know it · Next word
struct Meet: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0

    var course: String { store.course.id }

    var body: some View {
        let w = list[i], r = Look.current.radius
        Page {
            ProgressHeader(i: i, n: list.count)
            VStack(spacing: 8) {
                HStack { CapsLabel(text: store.t("newWord")); Spacer(); ToneChip(word: w) }
                if let p = store.words.picture(w.id) {
                    Text(p).font(.system(size: 46)).frame(width: 84, height: 84)
                        .background(Color.paper, in: RoundedRectangle(cornerRadius: r)).overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
                        .accessibilityHidden(true)
                }
                wordBlock(w)
                HStack(spacing: 8) {
                    Button { store.speaker.say(w.hz) } label: {
                        Label(store.t("play"), systemImage: "play.fill").font(.footnote.weight(.bold)).padding(.horizontal, 14).frame(height: 40)
                            .background(Color.action, in: RoundedRectangle(cornerRadius: r)).foregroundStyle(Color.onAction)
                    }.buttonStyle(.card)
                    Button { store.speaker.say(w.hz, rate: store.state.settings.rate * 0.75) } label: {
                        Text("0.75×").font(.footnote).padding(.horizontal, 14).frame(height: 40)
                            .background(Color.elevated, in: RoundedRectangle(cornerRadius: r)).overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
                    }.buttonStyle(.card).foregroundStyle(Color.ink)
                }.padding(.top, 4)
            }
            .padding(20).frame(maxWidth: .infinity)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: r + 2)).overlay(RoundedRectangle(cornerRadius: r + 2).stroke(Color.line))
            .multilineTextAlignment(.center)
            if let tip = Library.shared.tips.tip(for: w, lang: store.state.lang), !(tip.sound + tip.tone).isEmpty {
                (Text(store.t("sayIt")).bold().foregroundColor(Color.accent) + Text(" · " + [tip.sound, tip.tone].filter { !$0.isEmpty }.joined(separator: " ")).foregroundColor(Color.ink2))
                    .font(.footnote).lineSpacing(3).padding(.horizontal, 12).padding(.vertical, 10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.dynamic(0xE8B4AC, 0x5A3A36, text: false), style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
            }
            if let ex = w.ex { example(w, ex) }
            HStack(spacing: 10) {
                Button(store.t("iKnowIt")) { store.update { $0.markKnown(w.id) }; advance() }.buttonStyle(.secondary)
                Button(store.t("nextWord") + " →") {
                    if store.state.card(w.id) == nil { store.update { $0.markLearning(w.id) } }
                    advance()
                }.buttonStyle(SealButtonStyle()).accessibilityIdentifier("NextWord")
            }.padding(.top, 6)
        }
        .onAppear { store.speaker.say(w.hz) }
    }

    func advance() {
        if i + 1 >= list.count { done(SessionResult(correct: list.count, total: list.count, mistakes: [])) } else { i += 1; store.speaker.say(list[i].hz) }
    }

    @ViewBuilder func wordBlock(_ w: Word) -> some View {
        switch course {
        case "zh":
            if store.pyFirst {
                PinyinText(py: w.py, size: 52, weight: .bold)
                Text(store.tr(w)).font(.title3.weight(.medium))
                HStack(spacing: 10) {
                    GridChars(text: w.hz, cell: 52)
                    Text(store.t("charSmall")).font(.caption).foregroundStyle(Color.ink2).multilineTextAlignment(.leading).frame(maxWidth: 180, alignment: .leading)
                }
            } else {
                GridChars(text: w.hz, cell: w.hz.count > 2 ? 72 : 96)
                PinyinText(py: w.py, size: 30, weight: .bold)
                Text(store.tr(w)).font(.title3.weight(.medium))
            }
        case "vi":
            VietText(text: w.hz, size: 52, weight: .heavy).lineLimit(2).minimumScaleFactor(0.5)
            Text(w.py).font(.subheadline).foregroundStyle(Color.ink3)
            Text(store.tr(w)).font(.title3.weight(.medium))
        default:
            WordHero(word: w, size: 56)
            Text(store.tr(w)).font(.title3.weight(.medium))
        }
    }

    func example(_ w: Word, _ ex: String) -> some View {
        let pf = store.pyFirst && w.exPy != nil
        let main = pf ? w.exPy! : ex, key = pf ? w.py : w.hz
        var a = AttributedString(main)
        if let rg = a.range(of: key, options: .caseInsensitive) { a[rg].underlineStyle = .single }
        let sub = pf ? "\(ex) · \(store.exTr(w))" : ([course != "vi" ? w.exPy : nil, store.exTr(w)].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · "))
        return VStack(spacing: 0) {
            Divider().padding(.bottom, 12)
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(a).font(.body.weight(.bold))
                    Text(sub).font(.footnote).foregroundStyle(Color.ink2)
                }.frame(maxWidth: .infinity, alignment: .leading)
                Button { store.speaker.say(ex) } label: {
                    Image(systemName: "play.fill").font(.footnote).frame(width: 44, height: 44)
                        .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius)).overlay(RoundedRectangle(cornerRadius: Look.current.radius).stroke(Color.line))
                }.buttonStyle(.card).foregroundStyle(Color.ink).accessibilityLabel(store.t("playExample"))
            }
        }
    }
}

/// The tone of a word's first syllable as a small outlined badge with its contour (Chinese, Vietnamese)
struct ToneChip: View {
    @Environment(Store.self) var store
    let word: Word
    var body: some View {
        let c = store.course.id
        if c == "zh" || c == "vi" {
            let n = Lingo.firstTone(c == "zh" ? word.py : word.hz, course: c)
            if c == "vi" || n <= 4 {
                let color = Look.toneColors ? (c == "zh" ? Color.tone(n) : Color.viTone(n)) : Color.ink2
                HStack(spacing: 4) {
                    ToneIcon(n: n, course: c).scaleEffect(0.35).frame(width: 17, height: 12)
                    Text(c == "zh" ? store.t("toneShort\(n)") : ViTone.name(n)).font(.caption2.weight(.medium))
                }
                .padding(.horizontal, 8).padding(.vertical, 3).foregroundStyle(color)
                .overlay(RoundedRectangle(cornerRadius: max(Look.current.radius - 4, 0)).stroke(color))
            }
        }
    }
}

/// The main forward button of the session in the look's strong colour: seal red, indigo, blue, lime
struct SealButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        let vi = Look.current.id == "vi"
        configuration.label.font(.headline).frame(maxWidth: .infinity).padding(.vertical, 14)
            .background((vi ? Color.dynamic(0xC5F27A, 0xC5F27A, text: false) : Color.accent).opacity(configuration.isPressed ? 0.8 : 1), in: RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2, style: .continuous))
            .foregroundStyle(vi ? Color.dynamic(0x0F2A24, 0x0F2A24, text: false) : Color.dynamic(0xFFFFFF, 0x161514, text: false))
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

/// A button style chosen at run time
struct AnyButtonStyle: ButtonStyle {
    private let make: (Configuration) -> AnyView
    init<S: ButtonStyle>(_ s: S) { make = { AnyView(s.makeBody(configuration: $0)) } }
    func makeBody(configuration: Configuration) -> some View { make(configuration) }
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
                .background(isDone ? Color.good.opacity(0.15) : shake.contains("\(side)\(w.id)") ? Color.bad.opacity(0.15) : isSel ? Color.accent.opacity(0.14) : Color.elevated, in: RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(isSel ? Color.accent : Color.ink.opacity(0.08), lineWidth: 1.5))
                .foregroundStyle(Color.ink).opacity(isDone ? 0.45 : 1)
                .offset(x: shake.contains("\(side)\(w.id)") && !reduceMotion ? 6 : 0)
        }
        .buttonStyle(.card).disabled(isDone)
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
                }.buttonStyle(.card).disabled(picked != nil)
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
