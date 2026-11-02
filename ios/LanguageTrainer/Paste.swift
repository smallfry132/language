import SwiftUI
import LanguageCore

/* Add words (design round 3): one box for whatever you have — your tutor's message, a few typed words, pinyin,
 * characters or meanings. Find words looks each piece up (PasteList in LanguageCore) and shows what was found,
 * what needs a choice and what becomes your own word; one tap adds them to the lesson — or to a new lesson
 * named with today's date. */

struct PasteScreen: View {
    @Environment(Store.self) var store
    @Binding var path: NavigationPath
    /// The lesson to add to; nil = a new one
    let lid: String?
    @State private var text = ""
    @State private var rows: [PasteRow] = []
    @State private var showResult = false

    struct PasteRow: Identifiable {
        var piece: PastePiece
        var pick: String?          // the chosen list word
        var multi = false          // its parts are added (nǐ hǎo → 你 + 好)
        var ownChosen = false      // "None — my own word"
        var skip = false
        var id: String { piece.raw }
        init(_ p: PastePiece) { piece = p; pick = p.hits.count == 1 ? p.hits[0].id : nil; multi = p.hits.isEmpty && p.parts != nil }
        /// Still waiting for a choice or a meaning
        var open: Bool { !skip && pick == nil && !multi && (!piece.hits.isEmpty && !ownChosen || piece.parts != nil && !ownChosen || piece.ownEn.trimmingCharacters(in: .whitespaces).isEmpty) }
        var isOwn: Bool { !skip && pick == nil && !multi && (piece.hits.isEmpty && piece.parts == nil || ownChosen) && !(piece.ownHz.isEmpty && piece.ownPy.isEmpty) && !piece.ownEn.trimmingCharacters(in: .whitespaces).isEmpty }
        var found: Bool { !skip && (pick != nil || multi) }
        var choosing: Bool { !skip && pick == nil && !multi && !ownChosen && piece.hits.count > 1 }
        var own: Bool { !skip && !found && !choosing }
    }

    var lesson: Lesson? { lid.flatMap { store.state.lessons[$0] } }
    /// The lesson's name for the buttons: its own, or the number the new one will get
    var lessonLabel: String { lesson?.name ?? store.t("lessonN", store.state.lessons(course: store.course.id).count + 1) }

    var body: some View {
        Group { if showResult { result } else { input } }
            .background(Color.paper)
            .navigationTitle(store.t("addWords")).navigationBarTitleDisplayMode(.inline)
            .onAppear { if text.isEmpty, let v = Launch.value("-paste") { text = v.replacingOccurrences(of: "|", with: "\n"); showResult = Launch.has("-found") } } // screenshots
            // Looked up once typing pauses, off the main thread (Japanese has 8,000 words)
            .task(id: text) {
                try? await Task.sleep(for: .milliseconds(300))
                if Task.isCancelled { return }
                let words = store.words.all, c = store.course.id, t = text
                let pieces = await Task.detached(priority: .userInitiated) {
                    PasteList.parse(t).enumerated().map { PasteList.match($1, id: $0, words: words, course: c) }
                }.value
                if Task.isCancelled { return }
                let old = Dictionary(rows.map { ($0.piece.raw, $0) }, uniquingKeysWith: { a, _ in a })
                rows = pieces.map { old[$0.raw] ?? PasteRow($0) }
            }
    }

    // MARK: One box

    var input: some View {
        let zh = store.course.id == "zh"
        return VStack(spacing: 0) {
            Page {
                Text(store.t("toLesson", lesson == nil ? store.t("aNewLesson") : lessonLabel) + " · " + store.lessonDate(nowMs())).font(.subheadline).foregroundStyle(Color.ink2)
                Text(store.t("whatLearned")).font(.headline).padding(.top, 6)
                ZStack(alignment: .topLeading) {
                    if text.isEmpty {
                        Text(store.t(zh ? "pastePhZh" : "pastePh")).foregroundStyle(Color.ink3).padding(.horizontal, 17).padding(.vertical, 20)
                    }
                    TextEditor(text: $text)
                        .textInputAutocapitalization(.never).autocorrectionDisabled()
                        .scrollContentBackground(.hidden).padding(10).frame(minHeight: 180)
                        .accessibilityIdentifier("paste-text").accessibilityLabel(store.t("whatLearned"))
                }
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
                .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.line))
                Text(store.t(zh ? "addHintZh" : "addHint")).font(.footnote).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                HStack(spacing: 8) {
                    PasteButton(payloadType: String.self) { s in text = s.joined(separator: "\n") }
                        .buttonBorderShape(.capsule).tint(.ink)
                    Button(store.t("browseList")) { browse() }.buttonStyle(.bordered).tint(.ink)
                }
            }
            Button(rows.isEmpty ? store.t("findWordsNone") : store.t("findWords", rows.count)) {
                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                withAnimation(.easeOut(duration: 0.2)) { showResult = true }
            }
            .buttonStyle(.primary).disabled(rows.isEmpty).opacity(rows.isEmpty ? 0.5 : 1)
            .accessibilityIdentifier("paste-find")
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Color.paper)
        }
    }

    /// Browse the word list: the lesson's own "pick from the list" (a new lesson is made first)
    func browse() {
        if let lid { if !path.isEmpty { path.removeLast() }; if lesson == nil { path.append(Route.lesson(lid)) }; return }
        let id = store.newLesson()
        if !path.isEmpty { path.removeLast() }
        path.append(Route.lesson(id))
    }

    // MARK: Result

    var result: some View {
        let found = rows.indices.filter { rows[$0].found }, choose = rows.indices.filter { rows[$0].choosing }, own = rows.indices.filter { rows[$0].own }
        let ownCount = own.count
        return VStack(spacing: 0) {
            Page {
                Button { withAnimation(.easeOut(duration: 0.2)) { showResult = false } } label: {
                    Label(store.t("backToText"), systemImage: "chevron.left").font(.subheadline.weight(.semibold))
                }.buttonStyle(.card).foregroundStyle(Color.accent).frame(minHeight: 36)
                VStack(alignment: .leading, spacing: 2) {
                    Text(found.count == 1 ? store.t("wordsFound.one") : store.t("wordsFound", found.count)).font(.title2.weight(.bold))
                    let more = [choose.isEmpty ? "" : store.t("toChoose", choose.count), ownCount == 0 ? "" : store.t(ownCount == 1 ? "ownWordN" : "ownWordsN", ownCount)].filter { !$0.isEmpty }
                    if !more.isEmpty { Text(more.joined(separator: " · ")).font(.subheadline).foregroundStyle(Color.ink2) }
                }
                if !found.isEmpty {
                    SectionTitle(text: store.t("foundN", found.count))
                    ForEach(found, id: \.self) { k in foundRow($rows[k]); Divider() }
                }
                ForEach(choose, id: \.self) { k in
                    SectionTitle(text: store.t("chooseX", rows[k].piece.raw))
                    chooseGrid($rows[k])
                }
                if !own.isEmpty {
                    SectionTitle(text: store.t("ownWordSec"))
                    ForEach(own, id: \.self) { k in ownRow($rows[k]) }
                }
                let skipped = rows.indices.filter { rows[$0].skip }
                if !skipped.isEmpty {
                    SectionTitle(text: store.t("skipped"))
                    WrapLayout(spacing: 6) {
                        ForEach(skipped, id: \.self) { k in chip("↺ " + rows[k].piece.raw, on: false) { rows[k].skip = false } }
                    }
                }
            }
            bar
        }
    }

    func foundRow(_ r: Binding<PasteRow>) -> some View {
        let x = r.wrappedValue
        let words: [Word] = x.multi ? (x.piece.parts ?? []) : x.pick.flatMap { store.word($0) }.map { [$0] } ?? []
        let extra = x.multi ? [] : words.first.map(parts(of:)) ?? []
        return HStack(alignment: .top, spacing: 10) {
            Text("✓").font(.headline).foregroundStyle(Color.good)
            VStack(alignment: .leading, spacing: 3) {
                WrapLayout(spacing: 6) {
                    ForEach(Array(words.enumerated()), id: \.offset) { k, w in
                        HStack(spacing: 4) {
                            if k > 0 { Text("+").foregroundStyle(Color.ink3) }
                            WordLine(word: w, size: 15)
                            if store.course.id == "zh" && !store.pyFirst { Text(w.py).font(.caption).foregroundStyle(Color.ink2) }
                        }
                    }
                }
                Text(words.map { meaning($0) }.joined(separator: " + ") + (words.count == 1 && lesson?.words.contains(WordRef(words[0].id)) == true ? " · " + store.t("alreadyIn") : ""))
                    .font(.caption).foregroundStyle(Color.ink2)
                if !extra.isEmpty {
                    Text(store.t("alsoParts", extra.map { store.course.id == "zh" ? "\($0.hz) \($0.py)" : $0.hz }.joined(separator: " + "))).font(.caption).foregroundStyle(Color.ink3)
                }
                if x.piece.hits.count > 1 { Button(store.t("change")) { r.wrappedValue.pick = nil }.font(.caption.weight(.semibold)) }
                if x.multi { Button(store.t("noneOwn")) { r.wrappedValue.multi = false; r.wrappedValue.ownChosen = true }.font(.caption.weight(.semibold)) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            SquareButton(icon: "xmark", label: store.t("removeRow"), size: 32) { r.wrappedValue.skip = true }
        }
    }

    func chooseGrid(_ r: Binding<PasteRow>) -> some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)], spacing: 8) {
            ForEach(r.wrappedValue.piece.hits) { w in
                Button { r.wrappedValue.pick = w.id } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            WordLine(word: w, size: 15)
                            if store.course.id == "zh" { Text(store.pyFirst ? w.hz : w.py).font(.caption).foregroundStyle(Color.ink2) }
                        }
                        Text(meaning(w)).font(.caption).foregroundStyle(Color.ink2).lineLimit(1)
                    }
                    .padding(10).frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
                    .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.line))
                }
                .buttonStyle(.card).accessibilityAddTraits(.isButton)
            }
            Button { r.wrappedValue.ownChosen = true } label: {
                Text(store.t("noneOwn")).font(.caption.weight(.semibold)).foregroundStyle(Color.ink2)
                    .padding(10).frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
                    .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).strokeBorder(Color.line, style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
            }.buttonStyle(.card)
        }
    }

    func ownRow(_ r: Binding<PasteRow>) -> some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 6) {
                Text(r.wrappedValue.piece.raw).font(.subheadline.weight(.semibold))
                if store.course.id == "zh" {
                    PinyinField(placeholder: store.t("ownPy"), text: r.piece.ownPy, submit: {}, autofocus: false)
                    field(store.t("ownHz"), r.piece.ownHz)
                } else {
                    field(store.t("ownWord"), r.piece.ownHz)
                }
                field(store.t("meaning"), r.piece.ownEn)
            }
            SquareButton(icon: "xmark", label: store.t("removeRow"), size: 32) { r.wrappedValue.skip = true }
        }
        .padding(12)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
        .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).strokeBorder(Color.line, style: StrokeStyle(lineWidth: 1, dash: [5, 4])))
    }

    /// Chinese: the list words a found word is made of (你好 → 你 + 好), added with it
    func parts(of w: Word) -> [Word] {
        guard store.course.id == "zh", w.hz.count >= 2 else { return [] }
        return PasteList.segment(w.hz, words: store.words.all) ?? []
    }
    func meaning(_ w: Word) -> String {
        (store.tr(w).components(separatedBy: CharacterSet(charactersIn: ";,(")).first ?? "").trimmingCharacters(in: .whitespaces)
    }
    func chip(_ label: String, on: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label).font(.subheadline).lineLimit(1).padding(.horizontal, 12).frame(height: 34)
                .background(Color.elevated, in: Capsule()).overlay(Capsule().stroke(Color.line))
        }.buttonStyle(.card).foregroundStyle(Color.ink)
    }
    func field(_ label: String, _ b: Binding<String>) -> some View {
        TextField(label, text: b).textInputAutocapitalization(.never).autocorrectionDisabled().font(.subheadline)
            .padding(.horizontal, 10).frame(height: 38)
            .background(Color.paper, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius - 4)))
            .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius - 4)).stroke(Color.line))
    }

    /// The words that will be added: found ones with their parts, and own words with a meaning
    var toAdd: (ids: [String], own: Int) {
        let inLesson = Set(lesson?.words.map(\.id) ?? [])
        var ids: [String] = []
        for r in rows where r.found {
            let ws: [Word] = r.multi ? (r.piece.parts ?? []) : r.pick.flatMap { store.word($0) }.map { [$0] + parts(of: $0) } ?? []
            for w in ws where !inLesson.contains(w.id) && !ids.contains(w.id) { ids.append(w.id) }
        }
        return (ids, rows.filter(\.isOwn).count)
    }

    var bar: some View {
        let add = toAdd, n = add.ids.count + add.own
        return Button(n == 1 ? store.t("addNTo.one", n, lessonLabel) : store.t("addNTo", n, lessonLabel)) { addAll() }
            .buttonStyle(.primary).disabled(n == 0).opacity(n == 0 ? 0.5 : 1)
            .accessibilityIdentifier("paste-add")
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Color.paper).overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
    }

    func addAll() {
        var id = lid ?? ""
        if lid == nil {
            id = store.newLesson()
            let name = store.t("lessonDated", store.state.lessons(course: store.course.id).count, store.lessonDate(nowMs()))
            store.update { $0.lessons[id]?.name = name }
        }
        let ids = toAdd.ids, own = rows.filter(\.isOwn)
        store.update { s in
            func add(_ w: String) { if s.lessons[id]?.words.contains(WordRef(w)) == false { s.lessons[id]?.words.append(WordRef(w)) } }
            ids.forEach(add)
            for r in own {
                let p = r.piece, hz = p.ownHz.trimmingCharacters(in: .whitespaces), py = p.ownPy.trimmingCharacters(in: .whitespaces)
                let wid = newId("u")
                s.custom[wid] = CustomWord(course: s.course, hz: hz.isEmpty ? py : hz, py: py.isEmpty ? hz : py, en: p.ownEn.trimmingCharacters(in: .whitespaces))
                add(wid)
            }
        }
        store.toast(store.t("added"))
        if !path.isEmpty { path.removeLast() }
        if lid == nil { path.append(Route.lesson(id)) }
    }
}

extension String { func ifEmpty(_ s: String) -> String { isEmpty ? s : self } }

/// Chips that wrap onto new lines
struct FlowChips<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View { WrapLayout(spacing: 6) { content } }
}
