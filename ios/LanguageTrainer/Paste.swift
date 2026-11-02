import SwiftUI
import LanguageCore

/* Paste a list (as on the web): paste what the tutor sent, each piece is looked up (PasteList in LanguageCore),
 * one tap adds the words to the lesson — or to a new lesson named with today's date. */

struct PasteScreen: View {
    @Environment(Store.self) var store
    @Binding var path: NavigationPath
    /// The lesson to add to; nil = a new one
    let lid: String?
    @State private var text = ""
    @State private var rows: [PasteRow] = []

    struct PasteRow: Identifiable {
        var piece: PastePiece
        var pick: String?          // the chosen list word
        var multi = false          // its parts are added (nǐ hǎo → 你 + 好)
        var ownChosen = false      // "None — my own word"
        var skip = false
        var id: String { piece.raw }
        init(_ p: PastePiece) { piece = p; pick = p.hits.count == 1 ? p.hits[0].id : nil }
        /// Still waiting for a choice or a meaning
        var open: Bool { !skip && pick == nil && !multi && (!piece.hits.isEmpty && !ownChosen || piece.parts != nil && !ownChosen || piece.ownEn.trimmingCharacters(in: .whitespaces).isEmpty) }
        var isOwn: Bool { !skip && pick == nil && !multi && (piece.hits.isEmpty && piece.parts == nil || ownChosen) && !(piece.ownHz.isEmpty && piece.ownPy.isEmpty) && !piece.ownEn.trimmingCharacters(in: .whitespaces).isEmpty }
    }

    var lesson: Lesson? { lid.flatMap { store.state.lessons[$0] } }

    var body: some View {
        let zh = store.course.id == "zh"
        Page {
            Text(lesson?.name ?? store.t("pasteNewLesson")).font(.subheadline).foregroundStyle(Color.ink2)
            HStack {
                CapsLabel(text: store.t("pasteLabel"))
                Spacer()
                PasteButton(payloadType: String.self) { s in text = s.joined(separator: "\n") }
                    .buttonBorderShape(.capsule).labelStyle(.iconOnly).tint(.ink)
            }
            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(store.t(zh ? "pastePhZh" : "pastePh")).foregroundStyle(Color.ink3).padding(.horizontal, 17).padding(.vertical, 20)
                }
                TextEditor(text: $text)
                    .textInputAutocapitalization(.never).autocorrectionDisabled()
                    .scrollContentBackground(.hidden).padding(10).frame(minHeight: 140)
                    .accessibilityIdentifier("paste-text")
            }
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius)))
            .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius)).stroke(Color.line))
            Text(store.t("pasteHint")).font(.footnote).foregroundStyle(Color.ink2)
            ForEach($rows) { $r in row($r); Divider() }
        }
        .safeAreaInset(edge: .bottom) { if !rows.isEmpty { bar } }
        .background(Color.paper)
        .navigationTitle(store.t("pasteList")).navigationBarTitleDisplayMode(.inline)
        .onAppear { if text.isEmpty, let v = Launch.value("-paste") { text = v.replacingOccurrences(of: "|", with: "\n") } } // screenshots
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

    @ViewBuilder func row(_ r: Binding<PasteRow>) -> some View {
        let x = r.wrappedValue, p = x.piece
        HStack(alignment: .top, spacing: 10) {
            Text((x.skip ? "" : x.pick != nil || x.multi ? "✓ " : p.hits.isEmpty && p.parts == nil || x.ownChosen ? "+ " : "? ") + p.raw)
                .font(.footnote).foregroundStyle(Color.ink2).lineLimit(1).frame(width: 92, alignment: .leading)
            VStack(alignment: .leading, spacing: 6) {
                if x.skip {
                    HStack { Text(store.t("skipped")).font(.footnote).foregroundStyle(Color.ink2); Button(store.t("undo")) { r.wrappedValue.skip = false }.font(.footnote.weight(.semibold)) }
                } else if x.multi, let parts = p.parts {
                    ForEach(parts) { w in WordLine(word: w, size: 15) }
                } else if let id = x.pick, let w = store.word(id) {
                    WordLine(word: w, size: 15)
                    Text(store.tr(w) + (lesson?.words.contains(WordRef(id)) == true ? " · " + store.t("alreadyIn") : "")).font(.caption).foregroundStyle(Color.ink2)
                    if p.hits.count > 1 { Button(store.t("change")) { r.wrappedValue.pick = nil }.font(.caption.weight(.semibold)) }
                } else if let parts = p.parts, !x.ownChosen {
                    Text(store.t("pasteParts")).font(.caption).foregroundStyle(Color.ink2)
                    FlowChips {
                        choice(parts.map { w in store.course.id == "zh" ? w.py + " " + w.hz : w.hz }.joined(separator: " + ")) { r.wrappedValue.multi = true }
                        choice(store.t("noneOwn")) { r.wrappedValue.ownChosen = true }
                    }
                } else if !p.hits.isEmpty && !x.ownChosen {
                    Text(store.t("pasteWhich")).font(.caption).foregroundStyle(Color.ink2)
                    FlowChips {
                        ForEach(p.hits) { w in
                            choice((store.course.id == "zh" ? w.py + " " : "") + w.hz + " · " + (store.tr(w).components(separatedBy: CharacterSet(charactersIn: ";,(")).first ?? "").trimmingCharacters(in: .whitespaces)) { r.wrappedValue.pick = w.id }
                        }
                        choice(store.t("noneOwn")) { r.wrappedValue.ownChosen = true }
                    }
                } else {
                    Text(store.t("notInListShort")).font(.caption).foregroundStyle(Color.ink2)
                    if store.course.id == "zh" {
                        PinyinField(placeholder: store.t("ownPy"), text: r.piece.ownPy, submit: {}, autofocus: false)
                        own(store.t("ownHz"), r.piece.ownHz)
                    } else {
                        own(store.t("ownWord"), r.piece.ownHz)
                    }
                    own(store.t("ownEn"), r.piece.ownEn)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if !x.skip { SquareButton(icon: "xmark", label: store.t("skip"), size: 32) { r.wrappedValue.skip = true } }
        }
        .opacity(x.skip ? 0.55 : 1)
    }
    func choice(_ label: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label).font(.subheadline).lineLimit(1).padding(.horizontal, 12).frame(height: 34)
                .background(Color.elevated, in: Capsule()).overlay(Capsule().stroke(Color.line))
        }.buttonStyle(.card).foregroundStyle(Color.ink)
    }
    func own(_ label: String, _ b: Binding<String>) -> some View {
        TextField(label, text: b).textInputAutocapitalization(.never).autocorrectionDisabled().font(.subheadline)
            .padding(.horizontal, 10).frame(height: 36)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: max(4, Look.current.radius - 4)))
            .overlay(RoundedRectangle(cornerRadius: max(4, Look.current.radius - 4)).stroke(Color.line))
    }

    var bar: some View {
        let inLesson = Set(lesson?.words.map(\.id) ?? [])
        let add = rows.filter { !$0.skip && $0.pick.map { !inLesson.contains($0) } == true }.count + rows.filter { !$0.skip && $0.multi }.reduce(0) { $0 + ($1.piece.parts?.count ?? 0) }
        let own = rows.filter(\.isOwn).count, open = rows.filter(\.open).count
        return HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 1) {
                Text(store.t("pasteCount", add + own)).font(.subheadline.weight(.bold))
                Text([own > 0 ? store.t("ownN", own) : "", open > 0 ? store.t("pasteOpen", open) : ""].filter { !$0.isEmpty }.joined(separator: " · ").ifEmpty(lesson?.name ?? store.t("pasteNewLesson")))
                    .font(.caption).foregroundStyle(Color.ink2).lineLimit(1)
            }
            Spacer()
            Button(store.t("add")) { addAll() }.buttonStyle(.primary).frame(width: 110).disabled(add + own == 0).opacity(add + own == 0 ? 0.5 : 1)
                .accessibilityIdentifier("paste-add")
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
        .background(Color.elevated).overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
    }

    func addAll() {
        var id = lid ?? ""
        if lid == nil {
            id = store.newLesson()
            let name = store.t("lessonDated", store.state.lessons(course: store.course.id).count, store.lessonDate(nowMs()))
            store.update { $0.lessons[id]?.name = name }
        }
        let take = rows.filter { !$0.skip }
        store.update { s in
            func add(_ w: String) { if s.lessons[id]?.words.contains(WordRef(w)) == false { s.lessons[id]?.words.append(WordRef(w)) } }
            for r in take {
                if let p = r.pick { add(p); continue }
                if r.multi, let parts = r.piece.parts { parts.forEach { add($0.id) }; continue }
                guard r.isOwn else { continue }
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
