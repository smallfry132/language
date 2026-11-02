import SwiftUI
import LanguageCore

/* Small parts from the round-2 canvas, shared by Practice, Words, Lessons and Dialogues:
 * status as a shape, the NEW badge, a segmented control, square icon buttons, a heading under a heavy rule,
 * Korean letter tiles without arrows, "Say it like" and an example line with the word underlined. */

/// Status by shape, never colour alone: □ new · ◧ learning · ■ known
struct StatusShape: View {
    @Environment(Store.self) var store
    let status: WordStatus
    var size: CGFloat = 12
    var body: some View {
        let fill = status == .known ? 1.0 : status == .learning ? 0.5 : 0
        ZStack(alignment: .bottom) {
            Rectangle().stroke(Color.ink, lineWidth: 1.5)
            Rectangle().fill(Color.ink).frame(height: size * fill)
        }
        .frame(width: size, height: size)
        .accessibilityLabel(store.t(status.rawValue))
    }
}

struct NewBadge: View {
    @Environment(Store.self) var store
    var body: some View {
        let vi = Look.current.id == "vi"
        Text(store.t("newBadge").uppercased()).font(.caption2.weight(.bold)).tracking(0.8)
            .padding(.horizontal, 5).padding(.vertical, 1)
            .background(vi ? Color.dynamic(0xC5F27A, 0xC5F27A, text: false) : Color.accent, in: RoundedRectangle(cornerRadius: 3))
            .foregroundStyle(vi ? Color.dynamic(0x0F2A24, 0x0F2A24, text: false) : Look.current.id == "de" ? Color.dynamic(0x161616, 0x141414, text: false) : Color.dynamic(0xFFFFFF, 0x141414, text: false))
    }
}

/// A row of equal segments, the chosen one filled
struct SegBar: View {
    let options: [(key: String, label: String)]
    let selected: String?
    let pick: (String) -> Void
    var body: some View {
        let r = max(2, Look.current.radius - 4)
        HStack(spacing: 0) {
            ForEach(Array(options.enumerated()), id: \.offset) { k, o in
                let on = o.key == selected
                Button { pick(o.key) } label: {
                    Text(o.label).font(.subheadline.weight(on ? .bold : .regular)).lineLimit(1).minimumScaleFactor(0.7)
                        .frame(maxWidth: .infinity, minHeight: 40).padding(.horizontal, 4)
                        .background(on ? Color.ink : Color.clear)
                        .foregroundStyle(on ? Color.paper : Color.ink).contentShape(Rectangle())
                }
                .buttonStyle(.card)
                .accessibilityAddTraits(on ? .isSelected : [])
                if k < options.count - 1 { Rectangle().fill(Color.line).frame(width: 1) }
            }
        }
        .background(Color.elevated)
        .clipShape(RoundedRectangle(cornerRadius: r))
        .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
    }
}

/// A 44 pt square button with a system icon, outlined
struct SquareButton: View {
    let icon: String
    let label: String
    var on = false
    var size: CGFloat = 44
    let action: () -> Void
    var body: some View {
        let r = max(2, Look.current.radius - 4)
        Button(action: action) {
            Image(systemName: icon).font(.system(size: size * 0.36, weight: .semibold)).frame(width: size, height: size)
                .background(on ? Color.ink : Color.elevated, in: RoundedRectangle(cornerRadius: r))
                .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
                .foregroundStyle(on ? Color.paper : Color.ink)
        }
        .buttonStyle(.card)
        .accessibilityLabel(label)
        .accessibilityAddTraits(on ? .isSelected : [])
    }
}

/// A section heading under a heavy rule: bold caps on the left, a note on the right
struct RuleHead: View {
    let left: String
    var right: String = ""
    var caps = true
    var body: some View {
        VStack(spacing: 6) {
            Rectangle().fill(Color.ink).frame(height: 2)
            HStack(alignment: .firstTextBaseline) {
                if caps { Text(left.uppercased()).font(.caption.weight(.bold)).tracking(1.4).foregroundStyle(Color.ink2) }
                else { Text(left).font(.subheadline.weight(.bold)).foregroundStyle(Color.ink) }
                Spacer(minLength: 8)
                Text(right).font(.caption).foregroundStyle(Color.ink2).lineLimit(1)
            }
        }
        .padding(.top, 10)
    }
}

/// Korean: the letters of each block as tiles (consonants blue, vowels yellow, finals red), blocks a little apart
struct JamoTiles: View {
    let text: String
    var tile: CGFloat = 28
    var body: some View {
        WrapLayout(spacing: 10) {
            ForEach(Array(text.enumerated()), id: \.offset) { _, c in
                if let j = Lingo.koJamo(c) {
                    HStack(spacing: 2) {
                        JamoTile(s: j.i, kind: 0, size: tile)
                        JamoTile(s: j.v, kind: 1, size: tile)
                        if !j.f.isEmpty { JamoTile(s: j.f, kind: 2, size: tile) }
                    }
                }
            }
        }
        .accessibilityHidden(true)
    }
}

struct JamoTile: View {
    let s: String
    /// 0 initial, 1 vowel, 2 final, 3 no final (dashed)
    let kind: Int
    var size: CGFloat = 28
    var body: some View {
        let bg: Color = kind == 0 ? .action : kind == 1 ? Color.dynamic(0xF2B544, 0xF2B544, text: false) : kind == 2 ? Color.dynamic(0xC8323C, 0xC8323C, text: false) : .clear
        let fg: Color = kind == 0 ? .onAction : kind == 1 ? Color.dynamic(0x16213E, 0x16213E, text: false) : .white
        Text(s).font(.system(size: size * 0.55, weight: .bold)).frame(width: size, height: size)
            .background(bg, in: RoundedRectangle(cornerRadius: 6)).foregroundStyle(fg)
            .overlay { if kind == 3 { RoundedRectangle(cornerRadius: 6).strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [3, 3])).foregroundStyle(Color.ink2) } }
    }
}

/// "Say it like": how a word is said in the way its language needs it, with the Say-it tip and a play button
struct SayLike: View {
    @Environment(Store.self) var store
    let word: Word
    var body: some View {
        let tip = Library.shared.tips.tip(for: word, lang: store.state.lang)
        let text = [tip?.sound ?? "", tip?.tone ?? ""].filter { !$0.isEmpty }.joined(separator: " ")
        CardBox {
            CapsLabel(text: store.t("sayItLike"))
            switch store.course.id {
            case "ko":
                HStack(spacing: 10) {
                    JamoTiles(text: word.hz)
                    if let p = word.pron { Image(systemName: "arrow.right").foregroundStyle(Color.ink2); Text("[\(p)]").hanziFont(24) }
                }
            case "zh": GridChars(text: word.hz, cell: word.hz.count > 2 ? 52 : 72)
            case "ja":
                VStack(alignment: .leading, spacing: 0) {
                    if let k = word.kana, k != word.hz { Text(k).hanziFont(14).foregroundStyle(Color.ink2) }
                    Text(word.hz).hanziFont(40)
                }
            case "de", "es":
                // the stressed Spanish syllable, or the word with its article; then gender and plural
                VStack(alignment: .leading, spacing: 2) {
                    if store.course.id == "es", !(word.articleSplit?.noun ?? word.hz).contains(" ") { Text(Lingo.esStress(word.articleSplit?.noun ?? word.hz)).font(.title2.weight(.bold)) }
                    else { GenderText(word: word, size: 22) }
                    if let g = word.g { Text(([store.t("gender_" + (Lingo.elButFeminine(word) ? "f" : g))] + (word.plural.map { [store.t("plural") + ": " + $0] } ?? [])).joined(separator: " · ")).font(.footnote).foregroundStyle(Color.ink2) }
                }
            default: ToneContours(text: word.hz)
            }
            HStack(spacing: 10) {
                Text(text).font(.footnote).foregroundStyle(Color.ink2).frame(maxWidth: .infinity, alignment: .leading)
                SquareButton(icon: "speaker.wave.2", label: store.t("play") + " " + word.hz) { store.speaker.say(word.hz) }
            }
        }
    }
}

/// An example sentence with the word underlined, its reading and translation small, and a play button
struct ExampleLine: View {
    @Environment(Store.self) var store
    let word: Word
    let ex: String
    var body: some View {
        let pf = store.pyFirst && word.exPy != nil
        let main = pf ? word.exPy! : ex, key = pf ? word.py : word.hz
        var a = AttributedString(main)
        if let rg = a.range(of: key, options: .caseInsensitive) { a[rg].underlineStyle = .single }
        let sub = pf ? "\(ex) · \(store.exTr(word))" : ([store.course.id != "vi" ? word.exPy : nil, store.exTr(word)].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · "))
        return VStack(spacing: 0) {
            Divider().padding(.bottom, 12)
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(a).font(.body.weight(.bold))
                    Text(sub).font(.footnote).foregroundStyle(Color.ink2)
                }.frame(maxWidth: .infinity, alignment: .leading)
                SquareButton(icon: "play.fill", label: store.t("playExample")) { store.speaker.say(ex) }
            }
        }
    }
}

/// The written word as the learner reads it, in one line (pinyin in pinyin-first, Vietnamese in tone colours)
struct WordLine: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 16
    var body: some View {
        switch store.course.id {
        case "zh":
            if store.pyFirst { PinyinText(py: word.py, size: size, weight: .bold) } else { Text(word.hz).hanziFont(size + 2) }
        case "vi": VietText(text: word.hz, size: size, weight: .semibold)
        case "de", "es": GenderText(word: word, size: size)
        default: Text(word.hz).hanziFont(size + 2)
        }
    }
}

/// A word's picture: the drawn one when there is one, else its emoji. `size` is the emoji's point size (it grows
/// with Dynamic Type); with `box`, a drawn picture fills that square frame instead.
struct WordPic: View {
    let id: String
    var size: CGFloat
    var box: CGFloat? = nil
    @ScaledMetric(relativeTo: .title) private var scale: CGFloat = 1
    var body: some View {
        if let img = ArtImages.image(id) {
            let side = box ?? min(200, size * 2.1 * scale) // a drawn picture carries the meaning: more room than the emoji
            Image(uiImage: img).resizable().scaledToFill().frame(width: side, height: side)
                .clipShape(RoundedRectangle(cornerRadius: box == nil ? side * 0.18 : max(2, Look.current.radius - 2)))
        } else if let p = Library.shared.pictures[id] {
            Text(p).scaledFont(size)
        }
    }
}

/// The frame for a word's picture: larger when it is a drawn one
func picBox(_ id: String, _ emoji: CGFloat, _ drawn: CGFloat) -> CGFloat { Library.shared.art[id] != nil ? drawn : emoji }

/// Decoded drawn pictures, kept while memory allows (a list scrolls past the same tiles again)
@MainActor enum ArtImages {
    private static let cache = NSCache<NSString, UIImage>()
    static func image(_ id: String) -> UIImage? {
        if let img = cache.object(forKey: id as NSString) { return img }
        guard let url = Library.shared.artURL(id), let img = UIImage(contentsOfFile: url.path) else { return nil }
        cache.setObject(img, forKey: id as NSString)
        return img
    }
}
