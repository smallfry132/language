import SwiftUI
import LanguageCore

/* Words: every word of the course as tiles, with search and filters. Courses with topics (Chinese) show the words
 * by topic and group, in learning order; the others list words you have met first, by category. */

struct WordsView: View {
    @Environment(Store.self) var store
    @ScaledMetric private var tileWidth: CGFloat = 104 // tiles get wider (fewer columns) with larger text
    @State private var q = ""
    @State private var statusFilter = "all"
    @State private var cat = "all"
    @State private var limit = 240
    @State private var open: Word?

    var filtered: [Word] {
        let query = q.trimmingCharacters(in: .whitespaces).lowercased(), c = store.course.id, qs = Lingo.norm(query, course: c)
        let favs = Set(store.state.favs.map(\.id)), now = nowMs()
        let list = store.words.selected.filter { w in
            if cat != "all" && !themed && w.cat != cat { return false }
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
        if themed { return list } // learning order
        return list.filter { store.status($0.id) != .new } + list.filter { store.status($0.id) == .new } // words you have met first
    }
    var themed: Bool { !store.words.themes.isEmpty }

    /// Topic → group → words, keeping only the words that pass the filters
    func sections(_ list: [Word]) -> [(theme: Theme, groups: [(name: String, words: [Word])])] {
        let pass = Set(list.map(\.id))
        return store.words.themes.filter { cat == "all" || $0.id == cat }.compactMap { t in
            let gs = store.words.groups(of: t).map { ($0.name.get(store.state.lang), $0.words.filter { pass.contains($0.id) }) }.filter { !$0.1.isEmpty }
            return gs.isEmpty ? nil : (t, gs)
        }
    }
    /// The sections flattened into groups; the first group of a topic carries the topic's title
    func groupSections(_ list: [Word]) -> [(id: String, topic: String?, name: String, words: [Word])] {
        sections(list).flatMap { sec in
            sec.groups.enumerated().map { k, g in
                ("\(sec.theme.id)-\(k)", k == 0 ? "\(sec.theme.icon)  \(sec.theme.name.get(store.state.lang))" : nil, g.name, g.words)
            }
        }
    }
    func grid(_ words: [Word]) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: min(tileWidth, 320)), spacing: 10)], spacing: 10) {
            ForEach(words) { w in Button { open = w } label: { Tile(w: w) }.buttonStyle(.plain) }
        }
    }

    /// As on the style canvas: what you are looking at, then New · Learning · Due today (tap to filter)
    @ViewBuilder var header: some View {
        let ws = store.words.selected, now = nowMs()
        let counts = (new: ws.filter { store.status($0.id) == .new }.count, learning: ws.filter { store.status($0.id) == .learning }.count,
                      due: ws.filter { store.state.isDue($0.id, now: now) }.count)
        HStack(spacing: 8) {
            stat(counts.new, store.t("new"), "new", Color.tone(4))
            stat(counts.learning, store.t("learning"), "learning", Color.tone(2))
            stat(counts.due, store.t("dueNow"), "due", Color.accent)
        }
        if counts.due > 0 {
            NavigationLink(value: Route.mode(.flash)) { Text(store.t("reviewCards", min(counts.due, 150))) }
                .buttonStyle(.primary).simultaneousGesture(TapGesture().onEnded { SetupPrefs.shared.pool = "due" })
        }
    }
    func stat(_ n: Int, _ label: String, _ key: String, _ c: Color) -> some View {
        let on = statusFilter == key, r = Look.current.radius
        return Button { statusFilter = on ? "all" : key; limit = 240 } label: {
            VStack(alignment: .leading, spacing: 0) {
                Text("\(n)").font(.title3.weight(.bold)).monospacedDigit().foregroundStyle(Look.toneColors || key == "due" ? c : Color.ink)
                Text(label).font(.caption).foregroundStyle(Color.ink).lineLimit(1)
            }
            .padding(.horizontal, 10).padding(.vertical, 8).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
            .overlay(RoundedRectangle(cornerRadius: r).stroke(on ? Color.accent : Color.line, lineWidth: on ? 1.5 : 1))
        }.buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
    }

    var body: some View {
        let list = filtered
        Page {
            header
            LevelChips()
            ChipRow {
                ForEach([("all", "all"), ("due", "due"), ("new", "new"), ("learning", "learning"), ("known", "known"), ("favs", "favorites")], id: \.0) { k, l in
                    ChipButton(label: (k == "favs" ? "★ " : "") + store.t(l), active: statusFilter == k) { statusFilter = k; limit = 240 }
                }
            }
            TopicChips(selection: $cat)
            Text(store.t("wordsCount", list.count, store.words.selected.count)).font(.footnote).foregroundStyle(Color.ink3)
            if list.isEmpty { Text("🔍  " + store.t("noResults")).foregroundStyle(Color.ink2).frame(maxWidth: .infinity).padding(.top, 30) }
            if themed {
                // One lazy grid with a section per group. A lazy grid inside a lazy stack leaves tiles blank
                // until they have been scrolled past (a SwiftUI bug), so nothing here is nested.
                LazyVGrid(columns: [GridItem(.adaptive(minimum: min(tileWidth, 320)), spacing: 10)], alignment: .leading, spacing: 10) {
                    ForEach(groupSections(list), id: \.id) { g in
                        Section {
                            ForEach(g.words) { w in Button { open = w } label: { Tile(w: w) }.buttonStyle(.plain) }
                        } header: {
                            VStack(alignment: .leading, spacing: 0) {
                                if let topic = g.topic {
                                    Text(topic).font(.title3.weight(.bold)).padding(.top, 14).accessibilityAddTraits(.isHeader)
                                }
                                SectionTitle(text: g.name)
                            }
                        }
                    }
                }
            } else {
                grid(Array(list.prefix(limit)))
                if list.count > limit {
                    Button(store.t("showMore", min(240, list.count - limit), list.count - limit)) { limit += 240 }.buttonStyle(.secondary)
                }
            }
        }
        .onChange(of: store.course.id) { cat = "all" }
        .searchable(text: $q, prompt: store.t("search"))
        .textInputAutocapitalization(.never)
        .sheet(item: $open) { w in WordDetail(w: w).presentationDetents([.medium, .large]) }
    }
}

struct Tile: View {
    @Environment(Store.self) var store
    @Environment(\.dynamicTypeSize) var dynamicType
    let w: Word
    var body: some View {
        let st = store.status(w.id)
        VStack(spacing: 4) {
            HStack {
                // Status by shape as well as colour: ✓ known, half-filled learning, empty new
                Image(systemName: st == .known ? "checkmark.circle.fill" : st == .learning ? "circle.lefthalf.filled" : "circle")
                    .font(.caption2).foregroundStyle(st == .known ? Color.good : st == .learning ? Color.gold : Color.ink3)
                Spacer()
                if store.state.favs.contains(WordRef(w.id)) { Text("★").font(.caption2).foregroundStyle(Color.gold) }
            }
            if let p = store.words.picture(w.id) { Text(p).scaledFont(26).accessibilityHidden(true) }
            if store.pyFirst {
                PinyinText(py: w.py, size: w.py.count > 10 ? 15 : 19, weight: .semibold).lineLimit(1).minimumScaleFactor(0.6)
                Text(w.hz).font(.caption).foregroundStyle(Color.ink3)
            } else {
                if store.course.id == "vi" { VietText(text: w.hz, size: w.hz.count >= 9 ? 16 : 20).lineLimit(1).minimumScaleFactor(0.5) }
                else { Text(w.hz).hanziFont(w.hz.count >= 3 ? 20 : 28).lineLimit(1).minimumScaleFactor(0.5) }
                if store.showsReading(w) {
                    // Japanese: the kana reading, or the rōmaji when the word is written in kana already
                    let ja = store.course.id == "ja"
                    Pron(py: ja ? (w.kana != nil && w.kana != w.hz ? w.kana! : (w.romaji ?? w.py)) : w.py, size: 12).lineLimit(1)
                }
            }
            Text(store.tr(w)).font(.caption2).foregroundStyle(Color.ink2).lineLimit(dynamicType.isAccessibilitySize ? 5 : 2).multilineTextAlignment(.center)
            Spacer(minLength: 0)
        }
        .padding(10).frame(maxWidth: .infinity, minHeight: 112)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.ink.opacity(0.06)))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel([w.hz, w.py, store.tr(w), store.t(st.rawValue), store.state.favs.contains(WordRef(w.id)) ? store.t("favorites") : ""].filter { !$0.isEmpty }.joined(separator: ", "))
        .accessibilityAddTraits(.isButton)
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
                if let p = store.words.picture(w.id) { Text(p).scaledFont(72).accessibilityHidden(true) }
                WordHero(word: w, size: 64)
                Text(store.tr(w)).font(.title3).multilineTextAlignment(.center)
                if let t2 = store.tr2(w) { Text(t2).foregroundStyle(Color.ink3) }
                HStack(spacing: 6) {
                    pill(store.t(st.rawValue), st == .known ? .good : st == .learning ? .gold : .ink2)
                    if let th = store.words.theme(of: w.id) { pill("\(th.icon) \(th.name.get(store.state.lang))", .ink2) }
                    else { pill("\(Library.shared.categories[w.cat]?.icon ?? "") \(store.catName(w.cat))", .ink2) }
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
        .scrollIndicators(.hidden)
        .background(Color.paper)
        .onAppear { if store.state.settings.autoSpeak { store.speaker.say(w.hz) } }
    }
    func pill(_ s: String, _ c: Color) -> some View {
        Text(s).font(.caption.weight(.medium)).padding(.horizontal, 9).padding(.vertical, 4).background(c.opacity(0.12), in: Capsule()).foregroundStyle(c)
    }
}

/// Topic chips for courses with topics (Chinese), category chips for the others
struct TopicChips: View {
    @Environment(Store.self) var store
    @Binding var selection: String
    var body: some View {
        ChipRow {
            ChipButton(label: store.t("all"), active: selection == "all") { selection = "all" }
            if store.words.themes.isEmpty {
                ForEach(Library.shared.categoryOrder.filter { c in store.words.selected.contains { $0.cat == c } }, id: \.self) { c in
                    ChipButton(label: "\(Library.shared.categories[c]?.icon ?? "") \(store.catName(c))", active: selection == c) { selection = c }
                }
            } else {
                ForEach(store.words.themes) { t in
                    ChipButton(label: "\(t.icon) \(t.name.get(store.state.lang))", active: selection == t.id) { selection = t.id }
                }
            }
        }
    }
}

/// Korean: how a word is said when sound changes alter the spelling, e.g. 독일 [도길]
struct PronHint: View {
    @Environment(Store.self) var store
    let word: Word
    var body: some View {
        if let p = word.pron { Text("[\(p)]").hanziFont(17).foregroundStyle(Color.ink2).accessibilityLabel(store.t("pronHint") + " " + p) }
    }
}

/// A word's picture, when it has one
struct WordPicture: View {
    @Environment(Store.self) var store
    let word: Word
    var size: CGFloat = 64
    var body: some View {
        if let p = store.words.picture(word.id) { Text(p).scaledFont(size).accessibilityHidden(true) }
    }
}
