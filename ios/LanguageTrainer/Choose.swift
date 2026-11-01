import SwiftUI
import LanguageCore

/* Choose the right word (style canvas): a sentence with a gap and four words that sound alike —
 * 茶 chá / 查 chá / 差 chà / 叉 chā, trà / tra / trả / trại. You pick by meaning, so the tone and the
 * character start to matter. Without an example sentence (Japanese) the meaning is the question. */

enum ViTone {
    static let names = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"]
    static func name(_ n: Int) -> String { names[max(0, min(5, n - 1))] }
}

struct ChooseWord: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var picked: Word?
    @State private var mistakes: [Word] = []
    @State private var options: [Word] = []

    var radius: CGFloat { Look.current.radius }

    var body: some View {
        let w = list[i], gap = Gap(w: w, store: store)
        Page {
            ProgressHeader(i: i + (picked == nil ? 0 : 1), n: list.count)
            VStack(alignment: .leading, spacing: 6) {
                CapsLabel(text: store.t("chooseTitle"))
                Text(gap.sentence == nil ? store.t("chooseNoEx") : store.course.id == "vi" ? store.t("chooseSubTone") : store.t("chooseSub"))
                    .font(.subheadline).foregroundStyle(Color.ink2)
            }.padding(.top, 8)
            question(w, gap).padding(.vertical, 8)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                ForEach(options) { x in option(x, w, showMeaning: gap.sentence != nil) }
            }
        }
        .safeAreaInset(edge: .bottom) { if let p = picked { feedback(w, p) } }
        .onAppear { if options.isEmpty { options = optionsFor(w) } }
    }

    // MARK: The sentence with its gap

    @ViewBuilder func question(_ w: Word, _ gap: Gap) -> some View {
        let filled = picked != nil
        if let s = gap.sentence {
            VStack(alignment: .leading, spacing: 6) {
                let zh = store.course.id == "zh"
                // Pinyin first: the pinyin sentence is the main line and the characters come under it
                if let r = gap.reading, !store.pyFirst, zh || store.readingLayer != "off" || filled {
                    Text(gap.attributed(r, filled: filled, pinyin: zh)).scaledFont(14, .medium)
                }
                HStack(alignment: .center, spacing: 12) {
                    Group {
                        if store.pyFirst, let r = gap.reading { Text(gap.attributed(r, filled: filled, pinyin: true)).scaledFont(24, .semibold) }
                        else { Text(gap.attributed(s, filled: filled, pinyin: false, vi: store.course.id == "vi")).hanziFont(store.course.script == .cjk ? 30 : 24, .regular) }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                    Button { store.speaker.say(w.ex ?? w.hz) } label: {
                        Image(systemName: "speaker.wave.2").frame(width: 44, height: 44)
                            .background(Color.elevated, in: RoundedRectangle(cornerRadius: radius)).overlay(RoundedRectangle(cornerRadius: radius).stroke(Color.line))
                    }.buttonStyle(.plain).foregroundStyle(Color.ink).accessibilityLabel(store.t("play"))
                }
                if store.pyFirst && (store.state.settings.dlgHz == true || filled) { Text(gap.attributed(s, filled: filled, pinyin: false)).hanziFont(17).foregroundStyle(Color.ink2) }
                if let tr = gap.translation(filled: filled) { Text(tr).font(.subheadline).foregroundStyle(Color.ink2) }
            }
        } else {
            VStack(alignment: .leading, spacing: 6) {
                Text(store.tr(w)).font(.title.weight(.bold))
                if let p = store.words.picture(w.id) { Text(p).scaledFont(48).accessibilityHidden(true) }
            }
        }
    }

    // MARK: Options: the word large, its sound, its meaning

    func option(_ x: Word, _ w: Word, showMeaning: Bool) -> some View {
        let right = picked != nil && x.id == w.id, wrong = picked?.id == x.id && x.id != w.id
        let stroke: Color = right ? .good : wrong ? .bad : .line
        return Button { answer(x, w) } label: {
            VStack(spacing: 4) {
                WordFace(word: x, size: 48).lineLimit(1).minimumScaleFactor(0.4)
                sound(x)
                if showMeaning || picked != nil { Text(store.tr(x)).font(.caption).foregroundStyle(Color.ink2).lineLimit(2).multilineTextAlignment(.center) }
            }
            .padding(10).frame(maxWidth: .infinity, minHeight: 140)
            .background(right ? Color.good.opacity(0.08) : wrong ? Color.bad.opacity(0.08) : Color.elevated, in: RoundedRectangle(cornerRadius: radius))
            .overlay(RoundedRectangle(cornerRadius: radius).stroke(stroke, lineWidth: right || wrong ? 2 : 1))
            .overlay(alignment: .topTrailing) {
                if right || wrong {
                    Image(systemName: right ? "checkmark" : "xmark").font(.caption.weight(.bold)).foregroundStyle(.white)
                        .frame(width: 22, height: 22).background(right ? Color.good : Color.bad).padding(8)
                }
            }
            .foregroundStyle(Color.ink).contentShape(Rectangle())
        }
        .buttonStyle(.plain).disabled(picked != nil)
        .accessibilityLabel("\(x.hz), \(x.py)" + (showMeaning ? ", \(store.tr(x))" : ""))
    }
    @ViewBuilder func sound(_ x: Word) -> some View {
        switch store.course.id {
        case "zh": if store.pyFirst { Text(x.hz).hanziFont(15) } else { PinyinText(py: x.py, size: 15, weight: .bold) }
        case "vi":
            let n = Lingo.firstTone(x.hz, course: "vi")
            Text(ViTone.name(n)).font(.footnote.weight(.bold)).foregroundStyle(Look.toneColors ? Color.viTone(n) : Color.ink2)
        case "ja": Text(x.kana != nil && x.kana != x.hz ? x.kana! : (x.romaji ?? x.py)).font(.footnote.weight(.semibold)).foregroundStyle(Color.ink2)
        default: Text(x.py).font(.footnote.weight(.semibold)).foregroundStyle(Color.ink2)
        }
    }

    // MARK: After the answer: why, then continue

    func feedback(_ w: Word, _ p: Word) -> some View {
        let ok = p.id == w.id
        let other = ok ? options.first { $0.id != w.id } : p
        let reading = store.course.id == "vi" ? ViTone.name(Lingo.firstTone(w.hz, course: "vi")) : w.py
        return VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: ok ? "checkmark" : "xmark").font(.headline).foregroundStyle(.white)
                    .frame(width: 36, height: 36).background(ok ? Color.good : Color.bad, in: RoundedRectangle(cornerRadius: max(2, radius - 4)))
                VStack(alignment: .leading, spacing: 2) {
                    Text("\((ok ? store.t("correct") : store.t("wrong")).trimmingCharacters(in: CharacterSet(charactersIn: ".!"))) — \(w.hz) \(reading), \(store.tr(w))").font(.headline)
                    if let o = other { Text(store.t("soundsLike", "\(o.hz) (\(store.course.id == "vi" ? ViTone.name(Lingo.firstTone(o.hz, course: "vi")) : o.py))", store.tr(o))).font(.subheadline).foregroundStyle(Color.ink2) }
                }
                Spacer(minLength: 0)
                SpeakButton(text: w.hz, small: true)
            }
            Button(store.t("continue")) { next() }.buttonStyle(.primary)
        }
        .padding(.horizontal, 20).padding(.top, 16).padding(.bottom, 12)
        .background(Color.elevated)
        .overlay(alignment: .top) { Rectangle().fill(ok ? Color.good : Color.bad).frame(height: 2) }
    }

    func optionsFor(_ w: Word) -> [Word] {
        ([w] + store.words.soundAlikes(w, meaning: { store.tr($0) })).shuffled()
    }
    func answer(_ x: Word, _ w: Word) {
        guard picked == nil else { return }
        let ok = x.id == w.id
        withAnimation(.easeOut(duration: 0.2)) { picked = x }
        Haptic.answer(ok)
        store.answer(w, ok: ok)
        if ok { correct += 1 } else { mistakes.append(w) }
        if store.state.settings.autoSpeak { store.speaker.say(w.hz) }
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes)); return }
        i += 1; picked = nil; options = optionsFor(list[i])
    }
}

/// The example sentence of a word, split around the word so it can be shown as a gap
@MainActor struct Gap {
    var sentence: (before: String, after: String)?
    var reading: (before: String, after: String)?
    var tr: (before: String, after: String)?
    var fullTr: String
    let word: Word

    init(w: Word, store: Store) {
        word = w; fullTr = store.exTr(w)
        func split(_ s: String?, _ part: String) -> (String, String)? {
            guard let s, !part.isEmpty, let r = s.range(of: part, options: [.caseInsensitive]) else { return nil }
            return (String(s[..<r.lowerBound]), String(s[r.upperBound...]))
        }
        sentence = split(w.ex, w.hz)
        if sentence != nil { reading = split(w.exPy, w.py) }
        // The main meaning ("tea" of "tea; tea leaves") blanked in the translation
        let main = store.tr(w).split(whereSeparator: { ",;/(".contains($0) }).first.map { $0.trimmingCharacters(in: .whitespaces) } ?? ""
        let core = main.hasPrefix("to ") ? String(main.dropFirst(3)) : main
        tr = split(fullTr, core)
    }
    /// The translation: with its own gap, or only once answered (it would give the word away)
    func translation(filled: Bool) -> String? {
        if fullTr.isEmpty { return nil }
        if filled { return fullTr }
        return tr.map { $0.before + "___" + $0.after }
    }
    func attributed(_ parts: (before: String, after: String), filled: Bool, pinyin: Bool, vi: Bool = false) -> AttributedString {
        let piece = { (s: String) in pinyin ? PinyinText.attributed(s) : vi ? VietText.attributed(s) : AttributedString(s) }
        // A visible gap: full-width low lines next to characters, underscores next to letters
        var gap = AttributedString(filled ? (pinyin ? word.py : word.hz) : pinyin || !word.hz.unicodeScalars.contains { $0.value > 0x2E80 } ? "____" : "＿＿")
        if filled { gap.underlineStyle = .single }
        gap.foregroundColor = .accent
        return piece(parts.before) + gap + piece(parts.after)
    }
}
