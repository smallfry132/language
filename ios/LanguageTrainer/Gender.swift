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
                    Text(picked == nil ? "___" : (w.articleSplit?.article ?? "")).font(.system(size: 34, weight: .bold))
                        .foregroundStyle(picked == nil ? Color.ink3 : Color.gender(w.g ?? "m"))
                    Text(noun).font(.system(size: 34, weight: .bold))
                }
                Text(store.tr(w)).font(.subheadline).foregroundStyle(Color.ink2)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 24)
            HStack(spacing: 10) {
                ForEach(Array(articles.enumerated()), id: \.offset) { _, a in button(a.0, a.1, w) }
            }
            if let p = picked {
                let ok = p == w.g
                FeedbackBar(ok: ok, text: GenderText.attributed(w) + AttributedString(w.plural.map { " · " + $0 } ?? ""), speak: w.hz)
                Button(store.t("next")) { next() }.buttonStyle(.primary)
            }
        }
    }
    func button(_ article: String, _ g: String, _ w: Word) -> some View {
        let isPicked = picked == g, isRight = picked != nil && g == w.g
        let border: Color = isRight ? .good : isPicked ? .bad : .line
        return Button { answer(g, article, w) } label: {
            VStack(spacing: 2) {
                Text(article).font(.system(size: 26, weight: .bold)).foregroundStyle(Color.gender(g))
                Text(store.t("gender_" + g)).font(.caption).foregroundStyle(Color.ink2)
            }
            .frame(maxWidth: .infinity, minHeight: 88)
            .background(isRight ? Color.good.opacity(0.1) : isPicked ? Color.bad.opacity(0.1) : Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(alignment: .top) { Rectangle().fill(Color.gender(g)).frame(height: 4).clipShape(RoundedRectangle(cornerRadius: 2)).padding(.horizontal, 1) }
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(border, lineWidth: isRight || isPicked ? 2 : 1))
        }
        .buttonStyle(.card).disabled(picked != nil)
        .accessibilityLabel("\(article), \(store.t("gender_" + g))")
        .accessibilityIdentifier("article-" + article)
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
