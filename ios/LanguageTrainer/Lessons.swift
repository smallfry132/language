import SwiftUI
import LanguageCore

/* My lessons (the words from each class with your tutor), the dialogues page and the lesson editor,
 * as on the round-2 canvas. */

/// Own words (typed into a lesson) have ids starting with "u"
func isOwnWord(_ id: String) -> Bool { id.hasPrefix("u") }

extension Store {
    /// Words of a lesson that exist, own words, and the share known
    func lessonStats(_ l: Lesson) -> (words: [Word], own: Int, pct: Int) {
        let ws = l.words.compactMap { word($0.id) }
        let known = ws.filter { status($0.id) == .known }.count
        return (ws, ws.filter { isOwnWord($0.id) }.count, ws.isEmpty ? 0 : Int((Double(known) / Double(ws.count) * 100).rounded()))
    }
    func lessonDate(_ ms: Double) -> String {
        let f = DateFormatter(); f.locale = Locale(identifier: state.lang == "de" ? "de_DE" : "en_GB"); f.setLocalizedDateFormatFromTemplate("EEE d MMM")
        return f.string(from: Date(timeIntervalSince1970: ms / 1000))
    }
    /// Starts a new lesson and returns its id
    func newLesson() -> String {
        let id = newId("l"), name = t("lessonDefault", state.lessons(course: course.id).count + 1) // read before changing the state
        update { $0.lessons[id] = Lesson(course: $0.course, name: name, created: nowMs()) }
        return id
    }
}

struct LessonsScreen: View {
    @Environment(Store.self) var store
    @Binding var path: NavigationPath
    var body: some View {
        let ls = Array(store.state.lessons(course: store.course.id).reversed())
        Page {
            Text(store.t("lessonsSub")).font(.subheadline).foregroundStyle(Color.ink2)
            if ls.isEmpty {
                CardBox(padding: 22) {
                    VStack(spacing: 8) {
                        Image(systemName: "book.closed").font(.largeTitle).foregroundStyle(Color.ink3)
                        Text(store.t("noLessonsYet")).font(.headline)
                        Text(store.t("noLessonsText")).font(.subheadline).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
                        Button("＋ " + store.t("firstLesson")) { path.append(Route.lesson(store.newLesson())) }.buttonStyle(.primary).padding(.top, 4)
                    }.frame(maxWidth: .infinity)
                }
            }
            ForEach(Array(ls.enumerated()), id: \.element.id) { k, l in
                let st = store.lessonStats(l.lesson), n = ls.count - k, r = max(2, Look.current.radius - 2)
                HStack(spacing: 10) {
                    NavigationLink(value: Route.lesson(l.id)) {
                        HStack(spacing: 10) {
                            Text("\(n)").font(.headline).foregroundStyle(Color.accent).frame(width: 32, height: 32)
                                .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 6)).stroke(Color.accent, lineWidth: 1.5))
                            VStack(alignment: .leading, spacing: 3) {
                                Text(l.lesson.name).font(.subheadline.weight(.semibold)).foregroundStyle(Color.ink).multilineTextAlignment(.leading)
                                Text([store.lessonDate(l.lesson.created), store.t("lessonWords", st.words.count)].joined(separator: " · ") + (st.own > 0 ? " · " + store.t("ownN", st.own) : ""))
                                    .font(.caption).foregroundStyle(Color.ink2)
                                ProgressLine(fraction: Double(st.pct) / 100)
                            }
                            Text("\(st.pct)%").font(.footnote.weight(.bold)).foregroundStyle(Color.ink)
                        }.contentShape(Rectangle())
                    }.buttonStyle(.plain)
                    if !st.words.isEmpty {
                        SquareButton(icon: "play.fill", label: store.t("practiseLessonN", n)) { path.append(Route.lessonPractice(l.id)) }
                    }
                }
                .padding(10)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
                .overlay(RoundedRectangle(cornerRadius: r).stroke(k == 0 ? Color.ink : Color.line, lineWidth: k == 0 ? 1.5 : 1))
            }
            TipBox(title: store.t("afterClass"), text: store.t("afterClassText")).padding(.top, 6)
        }
        .navigationTitle(store.t("myLessons")).navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("＋ " + store.t("newShort")) { path.append(Route.lesson(store.newLesson())) } } }
    }
}

/// A thin progress line in the ink colour
struct ProgressLine: View {
    let fraction: Double
    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) { Rectangle().fill(Color.sunken); Rectangle().fill(Color.ink).frame(width: g.size.width * max(0, min(1, fraction))) }
        }.frame(height: 4).clipShape(RoundedRectangle(cornerRadius: 2))
    }
}

/// A dashed hint box: bold title in the accent, then the text
struct TipBox: View {
    let title: String
    let text: String
    var body: some View {
        (Text(title).bold().foregroundColor(Look.current.id == "vi" ? Color.ink : Color.accent) + Text(" · " + text))
            .font(.footnote).foregroundStyle(Color.ink2).lineSpacing(2)
            .padding(12).frame(maxWidth: .infinity, alignment: .leading)
            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 4)).strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 3])).foregroundStyle(Color.dynamic(0xE8B4AC, 0x5A3A36, text: false)))
    }
}

/// Dialogues (round 2): numbered, the first line, how many lines, L · R · P done; Free role play at the end
struct DialoguesScreen: View {
    @Environment(Store.self) var store
    var body: some View {
        let dl = store.dialogues
        Page {
            Text(store.t("dlgTopicsDone", dl.count, dl.filter { store.state.dialogue($0.id).done }.count)).font(.subheadline).foregroundStyle(Color.ink2)
            if dl.isEmpty { CardBox { Text(store.t("noDialogues")).foregroundStyle(Color.ink2) } }
            else {
                HStack(spacing: 12) {
                    legend("L", store.t("dlg_listen")); legend("R", store.t("dlg_read") + " · " + store.t("timed")); legend("P", store.t("dlg_turn"))
                }
                VStack(spacing: 0) {
                    Divider()
                    ForEach(Array(dl.enumerated()), id: \.element.id) { k, d in
                        NavigationLink(value: Route.dialogue(d.id)) { DialogueRow(d: d, n: k + 1) }.buttonStyle(.plain)
                        Divider()
                    }
                }
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) { Text(store.t("modeFree")).font(.headline); NewBadge() }
                        Text(store.t("freeSub")).font(.footnote).foregroundStyle(Color.ink2)
                    }
                    Spacer()
                    NavigationLink(value: Route.dialogueTurn(dl.randomElement()!.id)) { Text(store.t("start")).font(.headline).padding(.horizontal, 18).padding(.vertical, 12).background(Color.action, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius))).foregroundStyle(Color.onAction) }.buttonStyle(.plain)
                }
                .padding(14)
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [5, 4])).foregroundStyle(Color.ink2))
                .padding(.top, 6)
            }
        }
        .navigationTitle(store.t("dialogues")).navigationBarTitleDisplayMode(.inline)
    }
    func legend(_ k: String, _ label: String) -> some View {
        HStack(spacing: 4) { Tick(letter: k, on: false); Text(label).font(.caption).foregroundStyle(Color.ink2) }
    }
}

struct Tick: View {
    let letter: String
    let on: Bool
    var body: some View {
        Text(letter).font(.system(size: 11, weight: .bold)).frame(width: 22, height: 22)
            .background(on ? Color.ink : Color.clear, in: RoundedRectangle(cornerRadius: 4))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(on ? Color.clear : Color.line))
            .foregroundStyle(on ? Color.paper : Color.ink2)
    }
}

struct DialogueRow: View {
    @Environment(Store.self) var store
    let d: Dialogue
    let n: Int
    var body: some View {
        let st = store.state.dialogue(d.id), l0 = d.lines[0]
        HStack(spacing: 12) {
            Text(String(format: "%02d", n)).font(.title3.weight(.heavy)).foregroundStyle(Color.ink3).frame(width: 34, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                Text(d.topic.get(store.state.lang)).font(.subheadline.weight(.bold)).foregroundStyle(Color.ink)
                Group {
                    if store.course.id == "zh" && store.pyFirst { PinyinText(py: l0.py, size: 14) }
                    else if store.course.id == "vi" { VietText(text: l0.hz, size: 14) }
                    else { Text(l0.hz).hanziFont(15) }
                }.lineLimit(1)
                Text(store.t("linesN", d.lines.count)).font(.caption).foregroundStyle(Color.ink2)
            }
            Spacer(minLength: 6)
            HStack(spacing: 3) { Tick(letter: "L", on: st.listen != nil); Tick(letter: "R", on: st.read != nil); Tick(letter: "P", on: st.turn != nil) }
        }
        .padding(.vertical, 12).contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}

/// Lesson editor (round 2): name, Pick from list · Type my own, the words with their status, practise
struct LessonEditor: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    @Binding var path: NavigationPath
    let lid: String
    @State private var name = ""
    @State private var add = "list"
    @State private var query = ""
    @State private var ownPy = ""
    @State private var ownHz = ""
    @State private var ownEn = ""
    @State private var confirmDelete = false

    var body: some View {
        if let l = store.state.lessons[lid], l.gone == nil {
            let st = store.lessonStats(l), n = (store.state.lessons(course: store.course.id).firstIndex { $0.id == lid } ?? 0) + 1
            Page {
                Text(store.t("pctLearned", st.pct)).font(.subheadline).foregroundStyle(Color.ink2)
                CapsLabel(text: store.t("lessonName"))
                TextField(store.t("lessonName"), text: $name)
                    .font(.title3.weight(.semibold)).padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
                    .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.line))
                    .onSubmit { rename() }
                SegBar(options: [("list", store.t("pickFromList")), ("own", store.t("typeMyOwn"))], selected: add) { add = $0; query = "" }.padding(.top, 6)
                if add == "list" { listAdd(l) } else { ownAdd(l) }
                RuleHead(left: store.t("lessonWords", st.words.count), right: st.own > 0 ? store.t("ownTyped", st.own) : "", caps: false)
                if st.words.isEmpty { Text(store.t("lessonNoWords")).font(.footnote).foregroundStyle(Color.ink2) }
                ForEach(st.words) { w in
                    HStack(spacing: 8) {
                        line(w)
                        Spacer(minLength: 4)
                        HStack(spacing: 4) { StatusShape(status: store.status(w.id), size: 10); Text(store.t(store.status(w.id).rawValue)).font(.caption).foregroundStyle(Color.ink2) }
                        SquareButton(icon: "speaker.wave.2", label: store.t("speak"), size: 36) { store.speaker.say(w.hz) }
                        SquareButton(icon: "xmark", label: store.t("removeX", w.hz), size: 36) { store.update { $0.toggleLessonWord(lid, w.id) } }
                    }
                    Divider()
                }
                HStack(spacing: 6) {
                    ForEach(["review", "listen", "speak", "write"], id: \.self) { k in
                        VStack(spacing: 6) { Rectangle().fill(Color.ink).frame(height: 3); Text(store.t("seg_" + k)).font(.caption).foregroundStyle(Color.ink2) }
                    }
                }.padding(.top, 10)
                if !st.words.isEmpty { Button(store.t("practiceLesson")) { path.append(Route.lessonPractice(lid)) }.buttonStyle(.primary) }
                Button(store.t("deleteLesson"), role: .destructive) { confirmDelete = true }.buttonStyle(SecondaryButtonStyle(tint: .bad)).padding(.top, 14)
            }
            .navigationTitle(store.t("lessonN", n)).navigationBarTitleDisplayMode(.inline)
            .onAppear { name = l.name }
            .onDisappear { rename() }
            .confirmationDialog(store.t("deleteLessonConfirm"), isPresented: $confirmDelete, titleVisibility: .visible) {
                Button(store.t("deleteConfirm"), role: .destructive) { store.update { $0.lessons[lid] = nil }; dismiss() }
            }
        } else {
            Color.paper
        }
    }

    @ViewBuilder func line(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            HStack(spacing: 6) {
                WordLine(word: w, size: 15)
                if isOwnWord(w.id) {
                    Text(store.t("ownTag").uppercased()).font(.system(size: 10, weight: .bold)).padding(.horizontal, 5).padding(.vertical, 1)
                        .overlay(RoundedRectangle(cornerRadius: 3).stroke(Color.accent)).foregroundStyle(Color.accent)
                }
            }
            Text((store.course.id == "zh" && store.pyFirst ? w.hz + " · " : store.course.id == "ja" || store.course.id == "ko" ? w.py + " · " : "") + store.tr(w))
                .font(.caption).foregroundStyle(Color.ink2).lineLimit(2)
        }
    }

    @ViewBuilder func listAdd(_ l: Lesson) -> some View {
        searchField(store.t("lessonSearch"), $query).accessibilityIdentifier("lesson-search")
        let hits = search(l)
        if !query.isEmpty && hits.isEmpty { Text(store.t("noResults")).font(.footnote).foregroundStyle(Color.ink2) }
        ForEach(hits) { w in
            HStack {
                line(w)
                Spacer()
                Button("＋ " + store.t("add")) { store.update { $0.toggleLessonWord(lid, w.id) }; store.toast(store.t("added")) }
                    .font(.subheadline.weight(.semibold)).buttonStyle(.bordered).tint(.ink)
            }
            Divider()
        }
    }

    /// Type my own: what you type is looked up first; a list word comes with its reading and audio,
    /// otherwise you add it as your own word (tagged OWN)
    @ViewBuilder func ownAdd(_ l: Lesson) -> some View {
        let zh = store.course.id == "zh"
        CapsLabel(text: store.t(zh ? "ownPrompt" : "ownPromptOther")).padding(.top, 4)
        Group {
            if zh { PinyinField(placeholder: store.t("ownPrompt"), text: $query, submit: {}, autofocus: false) }
            else { searchField(store.t("ownPromptOther"), $query) }
        }.accessibilityIdentifier("own-q")
        let q = query.trimmingCharacters(in: .whitespaces)
        if !q.isEmpty {
            if let hit = exact(q) {
                if l.words.contains(WordRef(hit.id)) { Text("✓ " + store.t("alreadyIn")).font(.footnote).foregroundStyle(Color.ink2) }
                else {
                    HStack {
                        VStack(alignment: .leading, spacing: 1) { line(hit); Text(store.course.levelName(hit.lvl)).font(.caption2).foregroundStyle(Color.ink3) }
                        Spacer()
                        Button(store.t("add")) { store.update { $0.toggleLessonWord(lid, hit.id) }; query = ""; store.toast(store.t("added")) }.buttonStyle(.primary).frame(width: 90)
                    }
                    .padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
                    .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.ink, lineWidth: 1.5))
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text(store.t("notInList")).font(.footnote).foregroundStyle(Color.ink2)
                    if zh {
                        PinyinField(placeholder: store.t("ownPy"), text: $ownPy, submit: addOwn, autofocus: false)
                        field(store.t("ownHz"), $ownHz)
                    } else {
                        field(store.t("ownWord"), $ownHz)
                        if store.course.id == "ja" { field(store.t("ownReading"), $ownPy) }
                    }
                    field(store.t("ownEn"), $ownEn)
                    if zh { Text(store.t("ownHint")).font(.footnote).foregroundStyle(Color.ink2) }
                    Button { addOwn() } label: { Label(store.t("addOwn"), systemImage: "plus") }.buttonStyle(.secondary).accessibilityIdentifier("own-add")
                }
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 3])).foregroundStyle(Color.line))
                .onAppear { prefill(q) }
                .onChange(of: q) { _, v in prefill(v) }
            }
        }
    }
    func prefill(_ q: String) { if store.course.id == "zh" { ownPy = q } else { ownHz = q } }

    func searchField(_ label: String, _ b: Binding<String>) -> some View {
        TextField(label, text: b).textInputAutocapitalization(.never).autocorrectionDisabled()
            .padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
            .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.line))
    }
    func field(_ label: String, _ b: Binding<String>) -> some View {
        TextField(label, text: b).textInputAutocapitalization(.never).autocorrectionDisabled()
            .padding(14).background(Color.sunken, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
    }
    /// A list word that is exactly what was typed (its reading, characters or meaning)
    func exact(_ q: String) -> Word? {
        let c = store.course.id, qs = Lingo.norm(q, course: c), ql = q.lowercased()
        return store.words.all.first { w in
            !isOwnWord(w.id) && (w.hz == q || (!qs.isEmpty && Lingo.norm(w.py, course: c) == qs) || w.en.lowercased() == ql || (w.de ?? "").lowercased() == ql)
        }
    }
    func search(_ l: Lesson) -> [Word] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return [] }
        let c = store.course.id, qs = Lingo.norm(q, course: c)
        let inLesson = Set(l.words.map(\.id))
        return store.words.all.filter { w in
            !inLesson.contains(w.id) && !isOwnWord(w.id) && (w.hz.lowercased().contains(q) || (!qs.isEmpty && Lingo.norm(w.py, course: c).contains(qs)) || (!qs.isEmpty && Lingo.norm(w.hz, course: c).contains(qs))
                || w.py.lowercased().contains(q) || w.en.lowercased().contains(q) || (w.de ?? "").lowercased().contains(q))
        }
        // exact pinyin matches first, then shorter words
        .sorted { a, b in
            let ea = Lingo.norm(a.py, course: c) == qs, eb = Lingo.norm(b.py, course: c) == qs
            return ea != eb ? ea : a.py.count < b.py.count
        }
        .prefix(20).map { $0 }
    }
    func rename() {
        let n = name.trimmingCharacters(in: .whitespaces)
        if !n.isEmpty, store.state.lessons[lid]?.name != n, store.state.lessons[lid]?.gone == nil, store.state.lessons[lid] != nil { store.update { $0.lessons[lid]?.name = n } }
    }
    func addOwn() {
        let zh = store.course.id == "zh"
        let hz = ownHz.trimmingCharacters(in: .whitespaces), py = ownPy.trimmingCharacters(in: .whitespaces), en = ownEn.trimmingCharacters(in: .whitespaces)
        guard !(zh ? py : hz).isEmpty, !en.isEmpty else { return }
        let id = newId("u")
        store.update {
            $0.custom[id] = CustomWord(course: $0.course, hz: hz.isEmpty ? py : hz, py: py.isEmpty ? hz : py, en: en)
            $0.lessons[lid]?.words.append(WordRef(id))
        }
        ownPy = ""; ownHz = ""; ownEn = ""; query = ""
        store.toast(store.t("added"))
    }
}
