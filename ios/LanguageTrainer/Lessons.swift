import SwiftUI
import LanguageCore

/* Lessons: the built-in dialogues and your own lessons (the words from each class with your tutor). */

struct LessonsView: View {
    @Environment(Store.self) var store
    @Binding var path: NavigationPath

    var body: some View {
        let lessons = store.state.lessons(course: store.course.id)
        Page {
            if !store.dialogues.isEmpty {
                SectionTitle(text: store.t("dialogues"))
                DialogueList()
            }
            HStack {
                SectionTitle(text: store.t("myLessons"))
                Button {
                    let id = newId("l")
                    let name = store.t("lessonDefault", lessons.count + 1) // read before changing the state
                    store.update { $0.lessons[id] = Lesson(course: $0.course, name: name, created: nowMs()) }
                    path.append(Route.lesson(id))
                } label: { Label(store.t("lessonNew"), systemImage: "plus") }.buttonStyle(.bordered).tint(.ink).font(.subheadline).padding(.top, 12)
            }
            if lessons.isEmpty {
                CardBox { Text(store.t("lessonEmpty")).foregroundStyle(Color.ink2) }
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(lessons.reversed().enumerated()), id: \.offset) { k, l in
                        let ws = l.lesson.words.filter { store.word($0.id) != nil }
                        let known = ws.filter { store.status($0.id) == .known }.count, learning = ws.filter { store.status($0.id) == .learning }.count
                        NavigationLink(value: Route.lesson(l.id)) {
                            VStack(alignment: .leading, spacing: 6) {
                                ListRow(title: l.lesson.name, sub: store.t("lessonWords", ws.count) + " · " + store.t("knownOf", known, ws.count), icon: "book.closed")
                                GeometryReader { g in
                                    HStack(spacing: 0) {
                                        Color.good.frame(width: ws.isEmpty ? 0 : g.size.width * CGFloat(known) / CGFloat(ws.count))
                                        Color.gold.frame(width: ws.isEmpty ? 0 : g.size.width * CGFloat(learning) / CGFloat(ws.count))
                                        Spacer(minLength: 0)
                                    }
                                }.frame(height: 4).background(Color.sunken).clipShape(Capsule()).padding(.horizontal, 16).padding(.bottom, 12).padding(.leading, 38)
                            }
                        }.buttonStyle(.plain)
                        if k < lessons.count - 1 { Divider().padding(.leading, 16) }
                    }
                }.background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
            }
        }
    }
}

struct DialogueList: View {
    @Environment(Store.self) var store
    var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(store.dialogues.enumerated()), id: \.element.id) { k, d in
                NavigationLink(value: Route.dialogue(d.id)) { DialogueRow(d: d) }.buttonStyle(.plain)
                if k < store.dialogues.count - 1 { Divider().padding(.leading, 16) }
            }
        }.background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
    }
}

struct DialogueRow: View {
    @Environment(Store.self) var store
    let d: Dialogue
    var body: some View {
        let st = store.state.dialogue(d.id)
        HStack(spacing: 12) {
            Text(d.icon ?? "💬").font(.title2).frame(width: 30)
            VStack(alignment: .leading, spacing: 6) {
                Text(d.topic.get(store.state.lang)).font(.body.weight(.medium)).foregroundStyle(Color.ink)
                WrapLayout(spacing: 6) {
                    step(st.listen != nil, store.t("dlg_listen"))
                    step(st.read != nil, store.t("dlg_read"))
                    step(st.turn != nil, store.t("dlg_turn"))
                    if let best = st.read?.best { Text(store.t("bestTime", fmtTime(best))).font(.caption2).foregroundStyle(Color.ink3) }
                }
            }
            Spacer()
            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.ink3)
        }.padding(.horizontal, 16).padding(.vertical, 12).contentShape(Rectangle())
    }
    func step(_ done: Bool, _ label: String) -> some View {
        Text((done ? "✓ " : "") + label).font(.caption2.weight(.medium)).lineLimit(1).fixedSize()
            .padding(.horizontal, 7).padding(.vertical, 3)
            .background(done ? Color.good.opacity(0.14) : Color.sunken, in: Capsule())
            .foregroundStyle(done ? Color.good : Color.ink2)
    }
}

struct DialoguesScreen: View {
    @Environment(Store.self) var store
    var body: some View {
        Page { DialogueList() }.navigationTitle(store.t("dialogues")).navigationBarTitleDisplayMode(.inline)
    }
}

/// Lesson editor: rename, add words from the list or your own, practise
struct LessonEditor: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    @Binding var path: NavigationPath
    let lid: String
    @State private var name = ""
    @State private var query = ""
    @State private var ownPy = ""
    @State private var ownHz = ""
    @State private var ownEn = ""
    @State private var confirmDelete = false

    var body: some View {
        if let l = store.state.lessons[lid], l.gone == nil {
            let ws = l.words.compactMap { store.word($0.id) }
            Page {
                TextField(store.t("lessonName"), text: $name)
                    .font(.title3.weight(.semibold)).padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: 12))
                    .onSubmit { rename() }
                VStack(spacing: 0) {
                    if ws.isEmpty { Text(store.t("lessonNoWords")).foregroundStyle(Color.ink2).padding(14) }
                    ForEach(ws) { w in
                        row(w) { Button { store.update { $0.toggleLessonWord(lid, w.id) } } label: { Image(systemName: "xmark").foregroundStyle(Color.ink3) }.accessibilityLabel(store.t("remove")) }
                        Divider().padding(.leading, 16)
                    }
                }.background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
                if !ws.isEmpty {
                    Button { path.append(Route.lessonPractice(lid)) } label: { Label(store.t("practiceLesson"), systemImage: "play.fill") }.buttonStyle(.primary)
                }
                SectionTitle(text: store.t("lessonAddSearch"))
                TextField(store.t("lessonSearch"), text: $query)
                    .textInputAutocapitalization(.never).autocorrectionDisabled()
                    .padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: 12))
                let hits = search(l)
                if !query.isEmpty {
                    VStack(spacing: 0) {
                        if hits.isEmpty { Text(store.t("noResults")).foregroundStyle(Color.ink2).padding(14) }
                        ForEach(hits) { w in
                            row(w) { Button { store.update { $0.toggleLessonWord(lid, w.id) }; store.toast(store.t("added")) } label: { Image(systemName: "plus.circle.fill").font(.title3).foregroundStyle(Color.accent) } }
                            Divider().padding(.leading, 16)
                        }
                    }.background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
                }
                SectionTitle(text: store.t("lessonOwn"))
                CardBox {
                    let zh = store.course.id == "zh", ja = store.course.id == "ja"
                    if zh {
                        PinyinField(placeholder: store.t("ownPy"), text: $ownPy, submit: addOwn, autofocus: false)
                        field(store.t("ownHz"), $ownHz)
                    } else {
                        field(store.t("ownWord"), $ownHz)
                        if ja { field(store.t("ownReading"), $ownPy) }
                    }
                    field(store.t("ownEn"), $ownEn)
                    if zh { Text(store.t("ownHint")).font(.footnote).foregroundStyle(Color.ink2) }
                    Button { addOwn() } label: { Label(store.t("add"), systemImage: "plus") }.buttonStyle(.secondary).accessibilityIdentifier("own-add")
                }
                Button(store.t("deleteLesson"), role: .destructive) { confirmDelete = true }.buttonStyle(SecondaryButtonStyle(tint: .bad)).padding(.top, 20)
            }
            .navigationTitle(l.name).navigationBarTitleDisplayMode(.inline)
            .onAppear { name = l.name }
            .onDisappear { rename() }
            .confirmationDialog(store.t("deleteLessonConfirm"), isPresented: $confirmDelete, titleVisibility: .visible) {
                Button(store.t("deleteConfirm"), role: .destructive) { store.update { $0.lessons[lid] = nil }; dismiss() }
            }
        } else {
            Color.paper
        }
    }

    func field(_ label: String, _ b: Binding<String>) -> some View {
        TextField(label, text: b).textInputAutocapitalization(.never).autocorrectionDisabled()
            .padding(14).background(Color.sunken, in: RoundedRectangle(cornerRadius: 12))
    }
    func row<B: View>(_ w: Word, @ViewBuilder button: () -> B) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                if store.pyFirst {
                    PinyinText(py: w.py, size: 19, weight: .semibold)
                    Text("\(w.hz) · \(store.tr(w))").font(.footnote).foregroundStyle(Color.ink2)
                } else {
                    HStack(spacing: 8) { Text(w.hz).hanziFont(20); Text(w.py).foregroundStyle(Color.ink3) }
                    Text(store.tr(w)).font(.footnote).foregroundStyle(Color.ink2)
                }
            }
            Spacer()
            SpeakButton(text: w.hz, small: true)
            button()
        }.padding(.horizontal, 16).padding(.vertical, 10)
    }
    func search(_ l: Lesson) -> [Word] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return [] }
        let c = store.course.id, qs = Lingo.norm(q, course: c)
        let inLesson = Set(l.words.map(\.id))
        return store.words.all.filter { w in
            !inLesson.contains(w.id) && (w.hz.lowercased().contains(q) || (!qs.isEmpty && Lingo.norm(w.py, course: c).contains(qs)) || (!qs.isEmpty && Lingo.norm(w.hz, course: c).contains(qs))
                || w.py.lowercased().contains(q) || w.en.lowercased().contains(q) || (w.de ?? "").lowercased().contains(q))
        }
        // exact pinyin matches first, then shorter words
        .sorted { a, b in
            let ea = Lingo.norm(a.py, course: c) == qs, eb = Lingo.norm(b.py, course: c) == qs
            return ea != eb ? ea : a.py.count < b.py.count
        }
        .prefix(30).map { $0 }
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
        ownPy = ""; ownHz = ""; ownEn = ""
        store.toast(store.t("added"))
    }
}
