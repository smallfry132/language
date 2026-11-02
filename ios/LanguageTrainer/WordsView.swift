import SwiftUI
import LanguageCore

/* Words: every word of the course as tiles, with search and filters. Courses with topics (Chinese) show the words
 * by topic and group, in learning order; the others list words you have met first, by category. */

struct WordsView: View {
    @Environment(Store.self) var store
    @Environment(\.dynamicTypeSize) private var typeSize
    @ScaledMetric private var tileWidth: CGFloat = 160 // two columns on a phone; wider (fewer columns) with larger text
    @State private var q = ""
    @State private var statusFilter = "all"
    @State private var cat = "all"
    @State private var limit = 240
    @State private var open: Word?
    @Environment(\.horizontalSizeClass) private var hSize
    @State private var width: CGFloat = 0
    /// iPad in landscape: the word opens in a pane next to the tiles (as on the web on a Mac); otherwise in a sheet
    var paned: Bool { hSize == .regular && width >= 860 }

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

    /// Topics in learning order with the words that pass the filters (numbered as in the topic chips)
    func topicSections(_ list: [Word]) -> [(n: Int, theme: Theme, words: [Word])] {
        let pass = Set(list.map(\.id))
        return store.words.themes.enumerated().filter { cat == "all" || $0.element.id == cat }.compactMap { k, t in
            let ws = store.words.groups(of: t).flatMap { $0.words }.filter { pass.contains($0.id) }
            return ws.isEmpty ? nil : (k + 1, t, ws)
        }
    }
    var columns: [GridItem] { [GridItem(.adaptive(minimum: min(tileWidth, 320)), spacing: 8)] }

    /// As on the round-2 canvas: New · Learning · Due (tap to filter) and Review
    @ViewBuilder var header: some View {
        let ws = store.words.selected, now = nowMs()
        let counts = (new: ws.filter { store.status($0.id) == .new }.count, learning: ws.filter { store.status($0.id) == .learning }.count,
                      due: ws.filter { store.state.isDue($0.id, now: now) }.count)
        // Side by side; stacked at the accessibility text sizes, where four boxes would break their words
        let row = typeSize.isAccessibilitySize ? AnyLayout(VStackLayout(spacing: 6)) : AnyLayout(HStackLayout(spacing: 6))
        row {
            stat(counts.new, store.t("new"), "new", Color.tone(4))
            stat(counts.learning, store.t("learning"), "learning", Color.tone(2))
            stat(counts.due, store.t("due"), "due", Color.accent, hot: counts.due > 0)
            if counts.due > 0 {
                NavigationLink(value: Route.mode(.flash)) {
                    Text(store.t("review")).font(.subheadline.weight(.bold)).padding(.horizontal, 14).padding(.vertical, typeSize.isAccessibilitySize ? 10 : 0)
                        .frame(maxWidth: typeSize.isAccessibilitySize ? .infinity : nil, maxHeight: .infinity)
                        .background(Color.action, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2))).foregroundStyle(Color.onAction)
                }
                .buttonStyle(.card).simultaneousGesture(TapGesture().onEnded { SetupPrefs.shared.pools = ["due"]; SetupPrefs.shared.mins = 0 })
            }
        }.fixedSize(horizontal: false, vertical: true)
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(Color.ink2)
            TextField(store.t("search"), text: $q).textInputAutocapitalization(.never).autocorrectionDisabled()
                .accessibilityLabel(store.t("searchWords"))
            if !q.isEmpty { Button { q = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Color.ink3) }.accessibilityLabel(store.t("close")) }
        }
        .padding(.horizontal, 12).frame(height: 44)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
        .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.line))
    }
    func stat(_ n: Int, _ label: String, _ key: String, _ c: Color, hot: Bool = false) -> some View {
        let on = statusFilter == key, r = max(2, Look.current.radius - 2)
        return Button { statusFilter = on ? "all" : key; limit = 240 } label: {
            VStack(alignment: .leading, spacing: 0) {
                Text("\(n)").font(.headline).monospacedDigit().foregroundStyle(Look.toneColors || key == "due" ? c : Color.ink)
                Text(label).font(.caption2).foregroundStyle(Color.ink).lineLimit(1)
            }
            .padding(.horizontal, 8).padding(.vertical, 6).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
            .overlay(RoundedRectangle(cornerRadius: r).stroke(on || hot ? Color.accent : Color.line, lineWidth: on || hot ? 1.5 : 1))
        }.buttonStyle(.card).accessibilityAddTraits(on ? .isSelected : [])
    }

    var body: some View {
        HStack(spacing: 0) {
            tiles
            if paned {
                Rectangle().fill(Color.line).frame(width: 1).ignoresSafeArea(edges: .bottom)
                Group {
                    if let w = open { WordDetail(w: w).id(w.id) }
                    else { Text(store.t("wordPaneHint")).font(.subheadline).foregroundStyle(Color.ink2).frame(maxWidth: .infinity, maxHeight: .infinity) }
                }
                .frame(width: 360).background(Color.elevated)
            }
        }
        .onGeometryChange(for: CGFloat.self) { $0.size.width } action: { width = $0 }
        .sheet(item: Binding(get: { paned ? nil : open }, set: { open = $0 })) { w in WordDetail(w: w).presentationDetents([.medium, .large]) }
    }

    var tiles: some View {
        let list = filtered
        return Page {
            header
            ChipRow {
                ForEach(store.course.levels, id: \.self) { l in
                    ChipButton(label: store.course.levelName(l), active: store.levels.contains(l)) {
                        var lv = store.levels
                        if lv.contains(l) { if lv.count == 1 { return }; lv.removeAll { $0 == l } } else { lv.append(l) }
                        store.update { $0.courses[$0.course, default: CourseState()].levels = lv.sorted() }
                    }
                }
                Rectangle().fill(Color.line).frame(width: 1, height: 24)
                ForEach([("all", store.t("all")), ("new", "□ " + store.t("new")), ("learning", "◧ " + store.t("learning")), ("known", "■ " + store.t("known")), ("favs", "★")], id: \.0) { k, l in
                    ChipButton(label: l, active: statusFilter == k) { statusFilter = k; limit = 240 }.accessibilityLabel(k == "favs" ? store.t("favorites") : l)
                }
            }
            ChipRow {
                ChipButton(label: store.t("allTopics"), active: cat == "all") { cat = "all" }
                if themed {
                    ForEach(Array(store.words.themes.enumerated()), id: \.offset) { k, t in ChipButton(label: "\(k + 1) \(t.name.get(store.state.lang))", active: cat == t.id) { cat = t.id } }
                } else {
                    ForEach(Library.shared.categoryOrder.filter { c in store.words.selected.contains { $0.cat == c } }, id: \.self) { c in ChipButton(label: store.catName(c), active: cat == c) { cat = c } }
                }
            }
            Text(store.t("wordsCount", list.count, store.words.selected.count)).font(.footnote).foregroundStyle(Color.ink3)
            if list.isEmpty { Text("🔍  " + store.t("noResults")).foregroundStyle(Color.ink2).frame(maxWidth: .infinity).padding(.top, 30) }
            if themed {
                // One lazy grid with a section per topic. A lazy grid inside a lazy stack leaves tiles blank
                // until they have been scrolled past (a SwiftUI bug), so nothing here is nested.
                LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
                    ForEach(topicSections(list), id: \.theme.id) { sec in
                        Section {
                            ForEach(sec.words) { w in Button { open = w } label: { Tile(w: w) }.buttonStyle(.card).draggable(w.hz) { Tile(w: w).frame(width: 170).environment(store) /* the preview is drawn outside this view */ } }
                        } header: {
                            VStack(spacing: 6) {
                                HStack(alignment: .firstTextBaseline) {
                                    Text("\(sec.n) · \(sec.theme.name.get(store.state.lang))").font(.subheadline.weight(.bold)).accessibilityAddTraits(.isHeader)
                                    Spacer()
                                    Text(store.t("wordsInOrder", sec.words.count)).font(.caption).foregroundStyle(Color.ink2)
                                }
                                Rectangle().fill(Color.ink).frame(height: 2)
                            }.padding(.top, 12)
                        }
                    }
                }
            } else {
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(Array(list.prefix(limit))) { w in Button { open = w } label: { Tile(w: w) }.buttonStyle(.card).draggable(w.hz) { Tile(w: w).frame(width: 170).environment(store) /* the preview is drawn outside this view */ } }
                }
                if list.count > limit {
                    Button(store.t("showMore", min(240, list.count - limit), list.count - limit)) { limit += 240 }.buttonStyle(.secondary)
                }
            }
        }
        .onChange(of: store.course.id) { cat = "all" }
        .onAppear { if open == nil, let id = Launch.value("-word") { open = store.word(id) ?? store.words.selected.first { $0.hz == id } } } // screenshots
        .toolbar(.hidden, for: .navigationBar)
    }
}

/// One word as a compact tile (round 2): picture (or its first character), the word as you read it, the rest small,
/// the status as a shape
struct Tile: View {
    @Environment(Store.self) var store
    let w: Word
    var body: some View {
        let st = store.status(w.id), r = max(2, Look.current.radius - 2)
        HStack(spacing: 10) {
            // German and Spanish: no letter in the empty picture slot (it says nothing in Latin script), more room for the word
            if store.words.hasPicture(w.id) || !store.course.gender {
                Group {
                    if store.words.hasPicture(w.id) { WordPic(id: w.id, size: 24, box: 44) }
                    else { Text(String(w.hz.prefix(1))).hanziFont(20).foregroundStyle(Color.ink3) }
                }
                .frame(width: 44, height: 44)
                .background(Color.paper, in: RoundedRectangle(cornerRadius: max(2, r - 2)))
                .overlay(RoundedRectangle(cornerRadius: max(2, r - 2)).stroke(Color.line))
            }
            VStack(alignment: .leading, spacing: 1) {
                main
                Text(sub).font(.caption).foregroundStyle(Color.ink2).lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            StatusShape(status: st)
        }
        .padding(8).frame(minHeight: 72)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
        .overlay(RoundedRectangle(cornerRadius: r).stroke(Color.line))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel([w.hz, w.py, store.tr(w), store.t(st.rawValue), store.state.favs.contains(WordRef(w.id)) ? store.t("favorites") : ""].filter { !$0.isEmpty }.joined(separator: ", "))
        .accessibilityAddTraits(.isButton)
    }
    @ViewBuilder var main: some View {
        switch store.course.id {
        case "zh": if store.pyFirst { PinyinText(py: w.py, size: 16, weight: .bold).lineLimit(1).minimumScaleFactor(0.6) } else { Text(w.hz).hanziFont(18).lineLimit(1) }
        case "vi": VietText(text: w.hz, size: 16, weight: .semibold).lineLimit(1).minimumScaleFactor(0.6)
        case "de", "es": GenderText(word: w, size: 16).lineLimit(2).minimumScaleFactor(0.8)
        default: Text(w.hz).hanziFont(18).lineLimit(1).minimumScaleFactor(0.6)
        }
    }
    var sub: String {
        let reading: String? = !store.showsReading(w) ? nil : store.course.id == "zh" ? (store.pyFirst ? w.hz : w.py)
            : store.course.id == "ja" ? (w.kana != nil && w.kana != w.hz ? w.kana! : (w.romaji ?? w.py)) : store.course.id == "ko" ? w.py : store.course.gender ? w.plural : nil
        return [reading ?? (store.course.id == "zh" && store.pyFirst ? w.hz : nil), store.tr(w)].compactMap { $0 }.joined(separator: " · ")
    }
}

/// The word sheet (round 2): picture, word, favourite; Say it like; example; status; add to a lesson
struct WordDetail: View {
    @Environment(Store.self) var store
    let w: Word
    @State private var pickLesson = false
    var body: some View {
        let fav = store.state.favs.contains(WordRef(w.id))
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top, spacing: 12) {
                    if store.words.hasPicture(w.id) {
                        WordPic(id: w.id, size: 40, box: 72).frame(width: 72, height: 72)
                            .background(Color.paper, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
                            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.line))
                            .accessibilityLabel(store.tr(w))
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        switch store.course.id {
                        case "zh": if store.pyFirst { PinyinText(py: w.py, size: 34, weight: .bold) } else { Text(w.hz).hanziFont(36) }
                        case "vi": VietText(text: w.hz, size: 34, weight: .heavy)
                        case "de", "es": LatinWord(word: w, size: 34, leading: true)
                        default: Text(w.hz).hanziFont(36)
                        }
                        Text(readingLine).font(.subheadline).foregroundStyle(Color.ink2)
                    }
                    Spacer(minLength: 4)
                    SquareButton(icon: "speaker.wave.2.fill", label: store.t("playWord", w.hz)) { store.speaker.say(w.hz) }
                    SquareButton(icon: fav ? "star.fill" : "star", label: store.t("favorite"), on: fav) {
                        store.update { if fav { $0.favs.removeAll { $0.id == w.id } } else { $0.favs.append(WordRef(w.id)) } }
                    }
                }
                Text(metaLine).font(.footnote).foregroundStyle(Color.ink2)
                if Lingo.elButFeminine(w) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(store.t("elAguaWhy").uppercased()).font(.caption.weight(.bold)).tracking(1.2).foregroundStyle(Color.gender("f"))
                        Text(store.t("elAguaText")).font(.subheadline).fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12).frame(maxWidth: .infinity, alignment: .leading)
                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius).stroke(Color.gender("f"), lineWidth: 1.5))
                }
                SayLike(word: w)
                if let ex = w.ex { ExampleLine(word: w, ex: ex) }
                FamilySection(word: w)
                CapsLabel(text: store.t("status"))
                StatusPicker(word: w)
                Button { pickLesson = true } label: { Label(store.t("addToALesson"), systemImage: "plus").lineLimit(1) }
                    .buttonStyle(.secondary).accessibilityIdentifier("word-add-lesson")
            }.padding(20)
        }
        .scrollIndicators(.hidden)
        .background(Color.paper)
        .confirmationDialog(store.t("addToALesson"), isPresented: $pickLesson, titleVisibility: .visible) {
            ForEach(store.state.lessons(course: store.course.id).reversed(), id: \.id) { l in
                let on = l.lesson.words.contains(WordRef(w.id))
                Button((on ? "✓ " : "") + l.lesson.name) { store.update { $0.toggleLessonWord(l.id, w.id) } }
            }
            Button(store.t("newLesson")) { let id = store.newLesson(); store.update { $0.toggleLessonWord(id, w.id) }; store.toast(store.t("added")) }
        }
        .onAppear { if store.state.settings.autoSpeak { store.speaker.say(w.hz) } }
    }
    var readingLine: String {
        switch store.course.id {
        case "zh": return (store.pyFirst ? w.hz : w.py) + " · " + store.tr(w)
        case "ja": return (w.romaji ?? w.py) + " · " + store.tr(w)
        case "de", "es": return (w.plural.map { store.t("plural") + ": " + $0 + " · " } ?? "") + store.tr(w)
        default: return w.py + " · " + store.tr(w)
        }
    }
    var metaLine: String {
        var parts = [store.course.levelName(w.lvl)]
        if let th = store.words.theme(of: w.id) { parts.append(th.name.get(store.state.lang)) }
        if let t2 = store.tr2(w) { parts.append(t2) }
        return parts.joined(separator: " · ")
    }
}

/// New · Learning · Known, as three radio buttons with the status shapes
struct StatusPicker: View {
    @Environment(Store.self) var store
    let word: Word
    var body: some View {
        let st = store.status(word.id), r = max(2, Look.current.radius - 2)
        HStack(spacing: 8) {
            ForEach([("new", "□"), ("learning", "◧"), ("known", "■")], id: \.0) { k, glyph in
                let on = st.rawValue == k
                Button {
                    store.update { if k == "new" { $0.resetWord(word.id) } else if k == "learning" { $0.markLearning(word.id) } else { $0.markKnown(word.id) } }
                } label: {
                    Text("\(glyph) \(store.t(k))").font(.subheadline.weight(on ? .bold : .regular)).foregroundStyle(Color.ink)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
                        .overlay(RoundedRectangle(cornerRadius: r).stroke(on ? Color.ink : Color.line, lineWidth: on ? 2 : 1))
                }
                .buttonStyle(.card)
                .accessibilityAddTraits(on ? [.isSelected, .isButton] : .isButton)
            }
        }
        .accessibilityElement(children: .contain).accessibilityLabel(store.t("status"))
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
        if store.words.hasPicture(word.id) { WordPic(id: word.id, size: size).accessibilityHidden(true) }
    }
}
