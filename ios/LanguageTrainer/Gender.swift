import SwiftUI
import LanguageCore

/* Der, die, das? / El or la?: the noun without its article (with its picture and meaning), pick the article.
 * The buttons carry the gender colours used everywhere, and each also says its gender in words. */

struct GenderQuiz: View {
    @Environment(Store.self) var store
    let list: [Word]
    let done: (SessionResult) -> Void
    @State private var i = 0
    @State private var correct = 0
    @State private var picked: String?
    @State private var mistakes: [Word] = []
    @State private var why: [String: String] = [:]

    var articles: [(String, String)] { store.course.id == "de" ? [("der", "m"), ("die", "f"), ("das", "n")] : [("el", "m"), ("la", "f")] }

    var body: some View {
        let w = list[i], noun = w.articleSplit?.noun ?? w.hz
        Page {
            ProgressHeader(i: i + (picked == nil ? 0 : 1), n: list.count, extra: "✓ \(correct)")
            VStack(spacing: 8) {
                if let p = store.words.picture(w.id) { Text(p).font(.system(size: 64)).accessibilityHidden(true) }
                HStack(spacing: 8) {
                    Text(picked == nil ? "___" : (w.articleSplit?.article ?? "")).hanziFont(36, .bold)
                        .foregroundStyle(picked == nil ? Color.ink3 : Color.gender(w.g ?? "m"))
                    Text(LatinWord.noun(w, course: store.course.id, nouns: LatinWord.nouns(store))).hanziFont(36, .bold)
                }
                .accessibilityElement(children: .ignore).accessibilityLabel(picked == nil ? noun : w.hz)
                Text(store.tr(w)).font(.subheadline).foregroundStyle(Color.ink2)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 24)
            HStack(spacing: 10) {
                ForEach(Array(articles.enumerated()), id: \.offset) { k, a in button(a.0, a.1, w).numberKey(k) }
            }
            if let p = picked {
                let ok = p == w.g
                FeedbackBar(ok: ok, text: GenderText.attributed(w) + AttributedString(w.plural.map { " · " + $0 } ?? ""), speak: w.hz)
                if let rule = rule(w) { Text(.init(rule)).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true) }
                Button(store.course.id == "es" ? "Seguir" : "Weiter") { next() }.buttonStyle(.primary).nextKey().accessibilityIdentifier("Next")
            }
        }
    }
    func button(_ article: String, _ g: String, _ w: Word) -> some View {
        let isPicked = picked == g, isRight = picked != nil && g == w.g
        let border: Color = isRight ? .good : isPicked ? .bad : .line
        return Button { answer(g, article, w) } label: {
            VStack(spacing: 2) {
                Text(article).hanziFont(28, .bold).foregroundStyle(Color.gender(g))
                Text(store.t("gender_" + g) + (isRight ? " ✓" : "")).font(.caption).foregroundStyle(Color.ink2)
            }
            .frame(maxWidth: .infinity, minHeight: 88)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            // Gender colours are outlines only: the right answer gets its gender's colour, a wrong pick the red of a mistake
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(isRight ? Color.gender(g) : isPicked ? Color.bad : border, lineWidth: isRight || isPicked ? 2.5 : 1))
        }
        .buttonStyle(.card).disabled(picked != nil)
        .accessibilityLabel("\(article), \(store.t("gender_" + g))")
        .accessibilityIdentifier("article-" + article)
    }
    /// Why it is this article: in German a compound takes the article of its last part; in Spanish the -o/-a traps
    func rule(_ w: Word) -> String? {
        guard let (art, noun) = w.articleSplit else { return nil }
        if store.course.id == "de" {
            let parts = Lingo.deCompound(noun, nouns: LatinWord.nouns(store))
            guard parts.count == 2, let last = parts.last else { return nil }
            let tail = last.prefix(1).uppercased() + last.dropFirst()
            guard let base = store.words.all.first(where: { $0.articleSplit?.noun == tail && $0.g != nil }) else { return nil }
            return store.t("compoundRule", "**\(base.hz)**", "**\(art) \(noun)**")
        }
        if Lingo.elButFeminine(w) { return store.t("elAguaText") }
        if w.g == "f" && noun.hasSuffix("o") { return store.t("trapO", "**\(noun)**") }
        if w.g == "m" && noun.hasSuffix("a") { return store.t("trapA", "**\(noun)**") }
        return nil
    }
    func answer(_ g: String, _ article: String, _ w: Word) {
        guard picked == nil else { return }
        picked = g
        let ok = g == w.g
        store.answer(w, ok: ok)
        if ok { correct += 1 } else { mistakes.append(w); why[w.id] = store.t("whyPicked", article) }
        store.speaker.say(w.hz)
    }
    func next() {
        if i + 1 >= list.count { done(SessionResult(correct: correct, total: list.count, mistakes: mistakes, why: why)); return }
        i += 1; picked = nil
    }
}
