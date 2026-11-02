import SwiftUI
import CoreText
import LanguageCore

/* What gives each language its own look: the big word with its reading layer, the 田字格 grid for Chinese,
 * furigana for Japanese, the letters of each block for Korean, tone colours and contours for Vietnamese,
 * and the dock's labels written in the language (Look.tabs, drawn by Dock). */

enum Fonts {
    /// Fonts shipped with the app, all under the SIL Open Font License: Be Vietnam Pro, Barlow (German), Work Sans and
    /// Fraunces (Spanish, both cut to static weights from the variable fonts); the Chinese and Japanese serifs are built into iOS
    static func register() {
        for url in Bundle.main.urls(forResourcesWithExtension: "ttf", subdirectory: nil) ?? [] {
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}

/// The word large, with the reading layer the language needs
struct WordHero: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 60
    var body: some View {
        VStack(spacing: 8) {
            switch store.course.id {
            case "zh":
                if store.pyFirst {
                    PinyinText(py: word.py, size: size * 0.8, weight: .semibold)
                    GridChars(text: word.hz, cell: 52)
                } else {
                    GridChars(text: word.hz, cell: word.hz.count > 2 ? 72 : 96)
                    Pron(py: word.py, size: 22)
                }
            case "ja":
                // Furigana: the kana reading above the word, rōmaji fading out below
                if let kana = word.kana, kana != word.hz { Text(kana).hanziFont(17).foregroundStyle(Color.ink2) }
                Text(word.hz).hanziFont(word.hz.count >= 4 ? size * 0.7 : size)
                if let r = word.romaji { Text(r).font(.subheadline).foregroundStyle(Color.ink3) }
            case "ko":
                Text(word.hz).hanziFont(word.hz.count >= 4 ? size * 0.7 : size)
                Text(word.py).font(.title3).foregroundStyle(Color.ink2)
                PronHint(word: word)
                KoBlocks(text: word.hz)
            case "vi":
                WordFace(word: word, size: size)
                Text(word.py).font(.subheadline).foregroundStyle(Color.ink3)
                ToneContours(text: word.hz)
            case "de", "es":
                LatinWord(word: word, size: size * 0.75, longGender: true)
                if let pl = word.plural { Text("\(store.t("plural")): \(pl)").font(.subheadline).foregroundStyle(Color.ink2) }
            default:
                WordFace(word: word, size: size)
                Pron(py: word.py, size: 20)
            }
        }
        .multilineTextAlignment(.center)
    }
}

/// German and Spanish (Klar, Sol): the article as an outlined chip in its gender's colour, then the noun in the look's
/// font. German compounds show their parts (Kühl·schrank); Spanish underlines where the voice lands (ma·ña·na).
struct LatinWord: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 44
    var leading = false
    /// "das · neuter" instead of "das · n"
    var longGender = false
    var body: some View {
        VStack(alignment: leading ? .leading : .center, spacing: 6) {
            if let (art, _) = word.articleSplit, let g = word.g { GenderChip(word: word, article: art, g: g, long: longGender) }
            Text(Self.noun(word, course: store.course.id, nouns: Self.nouns(store))).hanziFont(size, .bold).foregroundStyle(Color.ink)
                .lineLimit(2).minimumScaleFactor(leading ? 1 : 0.5)
        }
        .accessibilityElement(children: .ignore).accessibilityLabel(word.hz)
    }
    /// The nouns of the German list without article, for the compound parts
    @MainActor static var nounCache: (count: Int, set: Set<String>) = (0, [])
    @MainActor static func nouns(_ store: Store) -> Set<String> {
        guard store.course.id == "de" else { return [] }
        let all = store.words.all
        if nounCache.count != all.count { nounCache = (all.count, Set(all.compactMap { $0.g == nil ? nil : $0.articleSplit?.noun })) }
        return nounCache.set
    }
    static func noun(_ w: Word, course: String, nouns: Set<String>) -> AttributedString {
        let noun = w.articleSplit?.noun ?? w.hz
        if course == "de" {
            let parts = Lingo.deCompound(noun, nouns: nouns)
            var out = AttributedString()
            for (k, part) in parts.enumerated() {
                if k > 0 { var dot = AttributedString("·"); dot.foregroundColor = .ink3; out += dot }
                out += AttributedString(part)
            }
            return out
        }
        if course == "es", let syl = Lingo.esSyllables(noun), syl.parts.count > 1 {
            var out = AttributedString()
            for (k, part) in syl.parts.enumerated() {
                var a = AttributedString(part)
                if k == syl.stressed { a.foregroundColor = .accent; a.underlineStyle = .single }
                out += a
            }
            return out
        }
        return AttributedString(noun)
    }
}

/// The article of a noun, outlined in its gender's colour: der · m, la · f, el · but feminine
struct GenderChip: View {
    @Environment(Store.self) var store
    let word: Word
    let article: String
    let g: String
    var long = false
    var body: some View {
        let es = store.course.id == "es", odd = es && Lingo.elButFeminine(word)
        let label = odd ? store.t("elButFem") : "\(article) · " + (long ? store.t("gender_" + g) : g)
        let color = Look.toneColors ? Color.gender(odd ? "f" : g) : Color.ink
        Text(label).scaledFont(13, .bold).foregroundStyle(color)
            .padding(.horizontal, es ? 10 : 8).frame(height: 26)
            .overlay { if es { Capsule().stroke(color, lineWidth: 1.5) } else { RoundedRectangle(cornerRadius: 6).stroke(color, lineWidth: 1.5) } }
    }
}

/// Chinese: each character in a 田字格 practice square, the way it is learnt on paper
struct GridChars: View {
    let text: String
    var cell: CGFloat = 96
    var body: some View {
        let chars = Array(text).filter { !$0.isWhitespace }
        HStack(spacing: 4) {
            ForEach(Array(chars.enumerated()), id: \.offset) { _, c in
                ZStack {
                    Rectangle().fill(Color.elevated)
                    Path { p in
                        p.move(to: CGPoint(x: 0, y: cell / 2)); p.addLine(to: CGPoint(x: cell, y: cell / 2))
                        p.move(to: CGPoint(x: cell / 2, y: 0)); p.addLine(to: CGPoint(x: cell / 2, y: cell))
                    }
                    .stroke(Color.dynamic(0xE8B4AC, 0x5A3A36, text: false), style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
                    Text(String(c)).hanziFont(cell * 0.7, .regular).foregroundStyle(Color.ink)
                }
                .frame(width: cell, height: cell)
                .overlay(Rectangle().stroke(Color.accent, lineWidth: 1.5))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(text)
    }
}

/// Korean: each syllable block with its letters — consonants blue, vowels yellow, final consonants red
struct KoBlocks: View {
    let text: String
    var body: some View {
        WrapLayout(spacing: 12) {
            ForEach(Array(text.enumerated()), id: \.offset) { _, c in
                if let j = Lingo.koJamo(c) {
                    HStack(spacing: 3) {
                        tile(j.i, bg: .action, fg: .onAction)
                        tile(j.v, bg: Color.dynamic(0xF2B544, 0xF2B544, text: false), fg: Color.dynamic(0x16213E, 0x16213E, text: false))
                        if !j.f.isEmpty { tile(j.f, bg: Color.dynamic(0xC8323C, 0xC8323C, text: false), fg: .white) }
                        Image(systemName: "arrow.right").font(.caption2).foregroundStyle(Color.ink3).padding(.horizontal, 2)
                        Text(String(c)).hanziFont(20)
                    }
                }
            }
        }
        .accessibilityHidden(true) // the word itself is read out above
    }
    func tile(_ s: String, bg: Color, fg: Color) -> some View {
        Text(s).font(.system(size: 15, weight: .semibold)).frame(width: 26, height: 26)
            .background(bg, in: RoundedRectangle(cornerRadius: 6)).foregroundStyle(fg)
    }
}

/// Vietnamese: each syllable with the contour of its tone, in the tone's colour
struct ToneContours: View {
    @Environment(Store.self) var store
    let text: String
    var body: some View {
        WrapLayout(spacing: 10) {
            ForEach(Array(text.split(separator: " ").enumerated()), id: \.offset) { _, syl in
                let n = Lingo.firstTone(String(syl), course: "vi")
                HStack(spacing: 4) {
                    ToneIcon(n: n, course: "vi").scaleEffect(0.6).frame(width: 30, height: 22)
                    Text(["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"][max(0, min(5, n - 1))]).font(.caption.weight(.semibold))
                        .foregroundStyle(Color.viTone(n))
                }
                .padding(.horizontal, 8).padding(.vertical, 4)
                .background(Color.sunken, in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }
}

extension Store {
    /// The reading layer (pinyin, romanization, kana) under a word: always, for words not yet known, or off
    var readingLayer: String { state.settings.readingLayer ?? (state.settings.tilePinyin ? "always" : "off") }
    func showsReading(_ w: Word) -> Bool {
        switch readingLayer {
        case "off": return false
        case "new": return status(w.id) != .known
        default: return true
        }
    }
}
