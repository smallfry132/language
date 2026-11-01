import SwiftUI
import AVFoundation
import LanguageCore

/* Statistics, settings, sync, tone guide, pronunciation tips and about. */

struct StatsView: View {
    @Environment(Store.self) var store
    @State private var confirmReset = false

    var body: some View {
        let ws = store.words.selected, total = max(ws.count, 1)
        let known = ws.filter { store.status($0.id) == .known }.count, learning = ws.filter { store.status($0.id) == .learning }.count
        let due = ws.filter { store.state.isDue($0.id) }.count
        let answered = store.state.answeredTotal, acc = answered > 0 ? Int((Double(store.state.correctTotal) / Double(answered) * 100).rounded()) : 0
        let today = store.state.dayCount(todayKey()), goal = store.state.settings.dailyGoal
        Page {
            LevelChips()
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                tile("\(known)", store.t("statsWords") + " / \(ws.count)", .good)
                tile("\(learning)", store.t("statsLearning"), .gold)
                tile("\(due)", store.t("statsDue"), .accentRed)
                tile("\(store.state.streak())", store.t("statsStreak"), .info)
            }
            SectionTitle(text: store.t("overview"))
            CardBox {
                HStack(spacing: 20) {
                    ZStack {
                        Circle().stroke(Color.sunken, lineWidth: 14)
                        Circle().trim(from: 0, to: CGFloat(known + learning) / CGFloat(total)).stroke(Color.gold, style: StrokeStyle(lineWidth: 14)).rotationEffect(.degrees(-90))
                        Circle().trim(from: 0, to: CGFloat(known) / CGFloat(total)).stroke(Color.good, style: StrokeStyle(lineWidth: 14, lineCap: known > 0 ? .round : .butt)).rotationEffect(.degrees(-90))
                        VStack(spacing: 0) { Text("\(Int((Double(known) / Double(total) * 100).rounded()))%").font(.title3.weight(.heavy)); Text(store.t("known")).font(.caption2).foregroundStyle(Color.ink2) }
                    }.frame(width: 110, height: 110)
                    VStack(alignment: .leading, spacing: 6) {
                        legend(.good, store.t("known"), known)
                        legend(.gold, store.t("learning"), learning)
                        legend(.sunken, store.t("new"), ws.count - known - learning)
                        Text("\(store.t("statsAccuracy")): \(acc)% · \(store.t("statsAnswered")): \(answered)").font(.caption).foregroundStyle(Color.ink2)
                    }
                }
            }
            SectionTitle(text: store.t("dailyGoal"))
            CardBox {
                HStack {
                    Text("\(store.t("statsToday")): ") + Text("\(today)").bold() + Text(" / \(goal)")
                    Spacer()
                    Picker("", selection: Binding(get: { goal }, set: { g in store.update { $0.settings.dailyGoal = g } })) {
                        ForEach([10, 20, 50], id: \.self) { Text("\($0)").tag($0) }
                    }.pickerStyle(.segmented).frame(width: 150)
                }
                ProgressView(value: Double(min(today, goal)), total: Double(goal)).tint(today >= goal ? .good : .accentRed)
            }
            SectionTitle(text: store.t("activity"))
            CardBox { Heatmap() }
            SectionTitle(text: store.t("perLevel"))
            CardBox {
                ForEach(store.course.levels, id: \.self) { l in
                    let lw = store.words.all.filter { $0.lvl == l }
                    bar(store.course.levelName(l), lw)
                }
            }
            SectionTitle(text: store.t("byCategory"))
            CardBox {
                ForEach(Library.shared.categoryOrder.filter { c in ws.contains { $0.cat == c } }, id: \.self) { c in
                    bar("\(Library.shared.categories[c]?.icon ?? "") \(store.catName(c))", ws.filter { $0.cat == c })
                }
            }
            Button(store.t("resetAll"), role: .destructive) { confirmReset = true }.buttonStyle(SecondaryButtonStyle(tint: .bad)).padding(.top, 16)
        }
        .navigationTitle(store.t("progress") + " · " + store.levelLabel).navigationBarTitleDisplayMode(.inline)
        .confirmationDialog(store.t("resetConfirm"), isPresented: $confirmReset, titleVisibility: .visible) {
            Button(store.t("resetAll"), role: .destructive) {
                store.update { s in
                    for w in store.words.all { s.srs[w.id] = nil }
                    s.favs.removeAll { Library.shared.word($0.id)?.course == s.course }
                    let now = nowMs()
                    s.stats = Stats(since: now); s.peers = [:]; s.mt["statsReset"] = now
                }
                store.toast(store.t("resetDone"))
            }
        }
    }
    func tile(_ v: String, _ l: String, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) { Text(v).font(.title.weight(.bold)).foregroundStyle(c); Text(l).font(.caption).foregroundStyle(Color.ink2) }
            .frame(maxWidth: .infinity, alignment: .leading).padding(14).background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
    }
    func legend(_ c: Color, _ l: String, _ n: Int) -> some View {
        HStack(spacing: 6) { Circle().fill(c).frame(width: 9, height: 9); Text("\(l): ") + Text("\(n)").bold() }.font(.subheadline)
    }
    func bar(_ label: String, _ ws: [Word]) -> some View {
        let k = ws.filter { store.status($0.id) == .known }.count, l = ws.filter { store.status($0.id) == .learning }.count
        return VStack(alignment: .leading, spacing: 4) {
            HStack { Text(label).font(.subheadline); Spacer(); Text("\(k)/\(ws.count)" + (l > 0 ? " · \(l)" : "")).font(.caption.monospacedDigit()).foregroundStyle(Color.ink2) }
            ProgressView(value: Double(k), total: Double(max(ws.count, 1))).tint(.good)
        }
    }
}

/// The last 8 weeks, one square per day
struct Heatmap: View {
    @Environment(Store.self) var store
    var body: some View {
        let days: [(String, Int)] = (0..<56).map { k in
            let d = Calendar.current.date(byAdding: .day, value: k - 55, to: Date())!
            let key = todayKey(d.timeIntervalSince1970 * 1000)
            return (key, store.state.dayCount(key))
        }
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 14), spacing: 4) {
            ForEach(days, id: \.0) { _, n in
                RoundedRectangle(cornerRadius: 3).fill(n == 0 ? Color.sunken : Color.good.opacity(n < 10 ? 0.35 : n < 30 ? 0.65 : 1)).aspectRatio(1, contentMode: .fit)
            }
        }
    }
}

struct SettingsView: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    @State private var showCourses = false

    var body: some View {
        let s = store.state.settings
        let voices = store.speaker.courseVoices()
        Form {
            Section {
                Button { showCourses = true } label: {
                    HStack { Text(store.t("course")); Spacer(); Text(store.course.name).foregroundStyle(Color.ink2) }
                }.tint(.ink)
                if store.course.toneOptions != nil { NavigationLink(store.t("toneGuide")) { ToneGuide() } }
                NavigationLink(store.t("pinyinTips")) { TipsView() }
                NavigationLink { SyncView() } label: { HStack { Text(store.t("sync")); Spacer(); Text(store.device.code != nil ? store.syncStatusText : store.t("syncDesc")).font(.footnote).foregroundStyle(Color.ink3) } }
                NavigationLink(store.t("about")) { AboutView() }
            }
            Section(store.t("settings")) {
                Picker(store.t("language"), selection: Binding(get: { store.state.lang }, set: { v in store.update { $0.lang = v } })) {
                    Text("English").tag("en"); Text("Deutsch").tag("de")
                }
                Toggle(store.t("autoSpeak"), isOn: Binding(get: { s.autoSpeak }, set: { v in store.update { $0.settings.autoSpeak = v } }))
                if store.course.id == "zh" {
                    Toggle(isOn: Binding(get: { store.pyFirst }, set: { v in store.update { $0.courses["zh", default: CourseState()].pinyinFirst = v } })) {
                        VStack(alignment: .leading) { Text(store.t("pinyinFirst")); Text(store.t("pinyinFirstDesc")).font(.footnote).foregroundStyle(Color.ink2) }
                    }
                }
                Toggle(store.t("tilePinyin"), isOn: Binding(get: { s.tilePinyin }, set: { v in store.update { $0.settings.tilePinyin = v } }))
                Stepper(value: Binding(get: { s.newPerDay }, set: { v in store.update { $0.settings.newPerDay = v } }), in: 1...20) {
                    HStack { Text(store.t("newPerDay")); Spacer(); Text("\(s.newPerDay)").monospacedDigit().foregroundStyle(Color.ink2) }
                }
            }
            Section(store.t("voice")) {
                VStack(alignment: .leading) {
                    HStack { Text(store.t("ttsRate")); Spacer(); Text(String(format: "%.2f×", s.rate)).monospacedDigit().foregroundStyle(Color.ink2) }
                    Slider(value: Binding(get: { s.rate }, set: { v in store.update { $0.settings.rate = (v * 20).rounded() / 20 } }), in: 0.5...1.2).tint(.accentRed)
                }
                Picker(store.t("voice"), selection: Binding(get: { s.voices?[store.course.id] ?? "" }, set: { v in
                    store.update { var m = $0.settings.voices ?? [:]; m[$0.course] = v.isEmpty ? nil : v; $0.settings.voices = m }
                    store.speaker.say(store.course.testPhrase)
                })) {
                    Text(store.t("voiceAuto")).tag("")
                    ForEach(voices, id: \.identifier) { v in Text(v.name + (v.quality == .premium ? " (Premium)" : v.quality == .enhanced ? " (Enhanced)" : "")).tag(v.identifier) }
                }
                Button { store.speaker.say(store.course.testPhrase) } label: { Label(store.t("ttsTest"), systemImage: "speaker.wave.2") }.tint(.accentRed)
                Text(voices.isEmpty ? store.t("noZhVoice") + ". " + store.t("voiceHint") : store.t("voiceHint")).font(.footnote).foregroundStyle(Color.ink2)
            }
        }
        .scrollContentBackground(.hidden).background(Color.paper)
        .navigationTitle(store.t("settings")).navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .confirmationAction) { Button(store.t("done")) { dismiss() } } }
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium]) }
    }
}

struct CoursePicker: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    var body: some View {
        VStack(spacing: 12) {
            Text(store.t("switchCourse")).font(.title3.weight(.bold))
            Text(store.t("courseHint")).font(.footnote).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
            ForEach(Course.all) { c in
                let ws = Library.shared.words[c.id] ?? [], known = ws.filter { store.status($0.id) == .known }.count
                Button { store.switchCourse(c.id); dismiss() } label: {
                    HStack(spacing: 14) {
                        Text(c.glyph).font(.title2.weight(.bold)).frame(width: 46, height: 46).background(Color.accentRed.opacity(0.12), in: RoundedRectangle(cornerRadius: 12)).foregroundStyle(Color.accentRed)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(c.name).font(.headline)
                            Text("\(ws.count) \(store.t("words").lowercased()) · \(c.allLabel) · \(store.t("knownOf", known, ws.count))").font(.caption).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        if c.id == store.course.id { Image(systemName: "checkmark").foregroundStyle(Color.accentRed) }
                    }
                    .padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(c.id == store.course.id ? Color.accentRed : Color.clear, lineWidth: 1.5))
                    .foregroundStyle(Color.ink)
                }.buttonStyle(.plain)
            }
        }.padding(20).frame(maxHeight: .infinity, alignment: .top).background(Color.paper)
    }
}

struct SyncView: View {
    @Environment(Store.self) var store
    @State private var code = ""
    @State private var confirmOff = false
    @State private var busy = false

    var body: some View {
        Page {
            if let c = store.device.code {
                CardBox(padding: 20) {
                    Text(store.t("syncCodeLbl").uppercased()).font(.caption.weight(.semibold)).foregroundStyle(Color.ink3).frame(maxWidth: .infinity)
                    Text(c).font(.system(.title3, design: .monospaced).weight(.semibold)).textSelection(.enabled).frame(maxWidth: .infinity).minimumScaleFactor(0.6).lineLimit(1)
                    Button { UIPasteboard.general.string = c; store.toast(store.t("copied")) } label: { Label(store.t("syncCopy"), systemImage: "doc.on.doc") }.buttonStyle(.secondary)
                    Text(store.t("syncCodeHintApp")).font(.footnote).foregroundStyle(Color.ink2)
                }
                Text("☁️ " + store.syncStatusText).font(.footnote).foregroundStyle(Color.ink2).frame(maxWidth: .infinity)
                Button {
                    busy = true
                    Task { await store.syncNow(); busy = false; if store.syncState == .ok { store.toast(store.t("syncDone")) } }
                } label: { Label(store.t("syncNow"), systemImage: "arrow.triangle.2.circlepath") }.buttonStyle(.primary).disabled(busy)
                Button(store.t("syncDisconnect")) { confirmOff = true }.buttonStyle(.secondary)
            } else {
                CardBox(padding: 20) {
                    Text(store.t("syncIntro"))
                    Button { busy = true; Task { await store.connectSync(SyncCode.make()); busy = false } } label: { Label(store.t("syncOn"), systemImage: "icloud") }.buttonStyle(.primary).disabled(busy)
                }
                SectionTitle(text: store.t("syncHave"))
                CardBox {
                    TextField("XXXXX-XXXXX-XXXXX-XXXXX", text: $code)
                        .font(.system(.body, design: .monospaced)).textInputAutocapitalization(.characters).autocorrectionDisabled()
                        .padding(12).background(Color.sunken, in: RoundedRectangle(cornerRadius: 12))
                    HStack {
                        Button(store.t("paste")) { code = UIPasteboard.general.string ?? code }.buttonStyle(.secondary)
                        Button(store.t("syncConnect")) {
                            guard let c = SyncCode.parse(code) else { store.toast(store.t("syncBadCode")); return }
                            busy = true; Task { await store.connectSync(c); busy = false }
                        }.buttonStyle(.primary).disabled(busy)
                    }
                }
            }
        }
        .navigationTitle(store.t("sync")).navigationBarTitleDisplayMode(.inline)
        .confirmationDialog(store.t("syncDisconnectConfirm"), isPresented: $confirmOff, titleVisibility: .visible) {
            Button(store.t("syncDisconnect"), role: .destructive) { store.disconnectSync() }
        }
    }
}

struct ToneGuide: View {
    @Environment(Store.self) var store
    var body: some View {
        let zh = store.course.id == "zh"
        let ex: [(String, String)] = zh ? [("mā", "妈"), ("má", "麻"), ("mǎ", "马"), ("mà", "骂"), ("ma", "吗")] : [("ma", "ma"), ("mà", "mà"), ("má", "má"), ("mả", "mả"), ("mã", "mã"), ("mạ", "mạ")]
        let words: [(String, String)] = zh ? [("高", "gāo"), ("人", "rén"), ("好", "hǎo"), ("大", "dà"), ("的", "de")] : [("ba", "three"), ("nhà", "house"), ("cá", "fish"), ("hỏi", "to ask"), ("mũ", "hat"), ("mẹ", "mother")]
        Page {
            CardBox {
                ForEach(Array(ex.enumerated()), id: \.offset) { k, e in
                    HStack(spacing: 12) {
                        Text(e.0).scaledFont(30, .semibold).foregroundStyle(zh ? Color.tone(k + 1) : Color.ink).frame(width: 64)
                        VStack(alignment: .leading, spacing: 2) {
                            HStack { ToneIcon(n: k + 1, course: store.course.id).scaleEffect(0.6).frame(width: 30, height: 22); Text(store.t("tone\(k + 1)")).font(.subheadline.weight(.semibold)) }
                            Text("\(store.t("tone\(k + 1)d"))  ·  \(words[k].0) \(words[k].1)").font(.footnote).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        SpeakButton(text: e.1, rate: 0.7, small: true)
                    }
                    if k < ex.count - 1 { Divider() }
                }
            }
            Button("🔊 " + ex.map(\.0).joined(separator: " · ")) { store.speaker.say(ex.map(\.1).joined(separator: zh ? "，" : ", "), rate: 0.6) }.buttonStyle(.primary)
            NavigationLink(value: Route.mode(.tones)) { Text("🎵 " + store.t("toneDrill")) }.buttonStyle(.secondary)
        }
        .navigationTitle(store.t("toneGuide")).navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: Route.self) { r in if case .mode(let m) = r { PracticeScreen(mode: m) } }
    }
}

struct TipsView: View {
    @Environment(Store.self) var store
    var body: some View {
        Page { CardBox { ForEach(store.t.list("pinyinTipsText"), id: \.self) { Text("• " + $0) } } }
            .navigationTitle(store.t("pinyinTips")).navigationBarTitleDisplayMode(.inline)
    }
}

struct AboutView: View {
    @Environment(Store.self) var store
    var body: some View {
        Page {
            CardBox {
                Text(store.course.title).font(.title3.weight(.bold))
                Text(store.t("aboutText"))
                Text(store.t("dataSource") + (store.course.sourceText.map { " " + $0 + " (MIT)" } ?? "")).font(.footnote).foregroundStyle(Color.ink2)
                if let u = store.course.sourceURL, let url = URL(string: u) { Link(u, destination: url).font(.footnote) }
            }
            CardBox { Text(store.t("installApp")).font(.subheadline) }
        }
        .navigationTitle(store.t("about")).navigationBarTitleDisplayMode(.inline)
    }
}
