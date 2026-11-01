import SwiftUI
import LanguageCore

/* Words: every word of the course as tiles, with search and filters. Words you have met come first. */

struct WordsView: View {
    @Environment(Store.self) var store
    @State private var q = ""
    @State private var statusFilter = "all"
    @State private var cat = "all"
    @State private var limit = 240
    @State private var open: Word?

    var filtered: [Word] {
        let query = q.trimmingCharacters(in: .whitespaces).lowercased(), c = store.course.id, qs = Lingo.norm(query, course: c)
        let favs = Set(store.state.favs.map(\.id)), now = nowMs()
        let list = store.words.selected.filter { w in
            if cat != "all" && w.cat != cat { return false }
            switch statusFilter {
            case "favs": if !favs.contains(w.id) { return false }
            case "due": if !store.state.isDue(w.id, now: now) { return false }
            case "new", "learning", "known": if store.status(w.id).rawValue != statusFilter { return false }
            default: break
            }
            if query.isEmpty { return true }
            return w.hz.lowercased().contains(query) || Lingo.norm(w.hz, course: c).contains(qs) || Lingo.norm(w.py, course: c).contains(qs) || w.py.lowercased().contains(query)
                || (w.romaji?.contains(qs) ?? false) || w.en.lowercased().contains(query) || (w.de ?? "").lowercased().contains(query)
        }
        return list.filter { store.status($0.id) != .new } + list.filter { store.status($0.id) == .new } // words you have met first
    }

    var body: some View {
        let list = filtered
        Page {
            LevelChips()
            ChipRow {
                ForEach([("all", "all"), ("due", "due"), ("new", "new"), ("learning", "learning"), ("known", "known"), ("favs", "favorites")], id: \.0) { k, l in
                    ChipButton(label: (k == "favs" ? "★ " : "") + store.t(l), active: statusFilter == k) { statusFilter = k; limit = 240 }
                }
            }
            ChipRow {
                ChipButton(label: store.t("all"), active: cat == "all") { cat = "all"; limit = 240 }
                ForEach(Library.shared.categoryOrder.filter { c in store.words.selected.contains { $0.cat == c } }, id: \.self) { c in
                    ChipButton(label: "\(Library.shared.categories[c]?.icon ?? "") \(store.catName(c))", active: cat == c) { cat = c; limit = 240 }
                }
            }
            Text(store.t("wordsCount", list.count, store.words.selected.count)).font(.footnote).foregroundStyle(Color.ink3)
            if list.isEmpty { Text("🔍  " + store.t("noResults")).foregroundStyle(Color.ink2).frame(maxWidth: .infinity).padding(.top, 30) }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 10)], spacing: 10) {
                ForEach(list.prefix(limit)) { w in
                    Button { open = w } label: { Tile(w: w) }.buttonStyle(.plain)
                }
            }
            if list.count > limit {
                Button(store.t("showMore", min(240, list.count - limit), list.count - limit)) { limit += 240 }.buttonStyle(.secondary)
            }
        }
        .searchable(text: $q, prompt: store.t("search"))
        .textInputAutocapitalization(.never)
        .sheet(item: $open) { w in WordDetail(w: w).presentationDetents([.medium, .large]) }
    }
}

struct Tile: View {
    @Environment(Store.self) var store
    let w: Word
    var body: some View {
        let st = store.status(w.id)
        VStack(spacing: 4) {
            HStack {
                Circle().fill(st == .known ? Color.good : st == .learning ? Color.gold : Color.ink.opacity(0.12)).frame(width: 7, height: 7)
                Spacer()
                if store.state.favs.contains(WordRef(w.id)) { Text("★").font(.caption2).foregroundStyle(Color.gold) }
            }
            if store.pyFirst {
                PinyinText(py: w.py, size: w.py.count > 10 ? 15 : 19, weight: .semibold).lineLimit(1).minimumScaleFactor(0.6)
                Text(w.hz).font(.caption).foregroundStyle(Color.ink3)
            } else {
                Text(w.hz).font(.hanzi(w.hz.count >= 3 ? 20 : 28)).lineLimit(1).minimumScaleFactor(0.5)
                if store.state.settings.tilePinyin { Pron(py: w.py, size: 12).lineLimit(1) }
            }
            Text(store.tr(w)).font(.caption2).foregroundStyle(Color.ink2).lineLimit(2).multilineTextAlignment(.center)
            Spacer(minLength: 0)
        }
        .padding(10).frame(maxWidth: .infinity, minHeight: 112)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.ink.opacity(0.06)))
    }
}

struct WordDetail: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    let w: Word
    var body: some View {
        let st = store.status(w.id), fav = store.state.favs.contains(WordRef(w.id))
        let lessons = store.state.lessons(course: store.course.id)
        ScrollView {
            VStack(spacing: 12) {
                if store.pyFirst { PinyinText(py: w.py, size: 44, weight: .semibold); Text(w.hz).font(.hanzi(26)).foregroundStyle(Color.ink2) }
                else { Text(w.hz).font(.hanzi(64)); Pron(py: w.py, size: 22) }
                Text(store.tr(w)).font(.title3).multilineTextAlignment(.center)
                if let t2 = store.tr2(w) { Text(t2).foregroundStyle(Color.ink3) }
                HStack(spacing: 6) {
                    pill(store.t(st.rawValue), st == .known ? .good : st == .learning ? .gold : .ink2)
                    pill("\(Library.shared.categories[w.cat]?.icon ?? "") \(store.catName(w.cat))", .ink2)
                    pill(store.course.levelName(w.lvl) + (store.course.id == "zh" && Int(w.id) != nil ? " · #\(w.id)" : ""), .ink2)
                }
                SpeakButton(text: w.hz)
                if let ex = w.ex { ExampleBox(word: w, ex: ex) }
                HStack {
                    Button { store.update { st == .known ? $0.resetWord(w.id) : $0.markKnown(w.id) } } label: {
                        Text(st == .known ? "↺ " + store.t("resetWord") : "✓ " + store.t("markKnown")).lineLimit(1).minimumScaleFactor(0.7)
                    }.buttonStyle(SecondaryButtonStyle(tint: st == .known ? .ink : .good))
                    Button { store.update { if fav { $0.favs.removeAll { $0.id == w.id } } else { $0.favs.append(WordRef(w.id)) } } } label: {
                        Text(fav ? "★ " + store.t("unfav") : "☆ " + store.t("fav")).lineLimit(1)
                    }.buttonStyle(SecondaryButtonStyle(tint: fav ? .gold : .ink))
                }
                if st != .learning { Button("📝 " + store.t("markLearning")) { store.update { $0.markLearning(w.id) } }.buttonStyle(.secondary) }
                if !lessons.isEmpty {
                    SectionTitle(text: store.t("addToLesson"))
                    ChipRow {
                        ForEach(lessons, id: \.id) { l in
                            let has = l.lesson.words.contains(WordRef(w.id))
                            ChipButton(label: (has ? "✓ " : "+ ") + l.lesson.name, active: has) { store.update { $0.toggleLessonWord(l.id, w.id) } }
                        }
                    }
                }
            }.padding(20)
        }
        .background(Color.paper)
        .onAppear { if store.state.settings.autoSpeak { store.speaker.say(w.hz) } }
    }
    func pill(_ s: String, _ c: Color) -> some View {
        Text(s).font(.caption.weight(.medium)).padding(.horizontal, 9).padding(.vertical, 4).background(c.opacity(0.12), in: Capsule()).foregroundStyle(c)
    }
}
