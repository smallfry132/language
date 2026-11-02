import SwiftUI
import LanguageCore

/* Learn: the home screen, built per language as on the style canvas.
 * Chinese (Ink Grid): seal-box streak, thin red goal line, white lesson card with a black "Continue · 继续",
 *   the word of the day in a large 田字格, three tiles.
 * Japanese (Quiet Ruby): streak as 12日, hairline-ruled lesson section, the word of the day written vertically.
 * Korean (Block Builder): streak pill, segmented goal, navy lesson card with a yellow button, "build the phrase".
 * Vietnamese (Tone Color): forest pill, forest lesson card with a lime button, the word's tone tile, a tone drill.
 * Below: the next dialogue and your lessons. */

struct LearnView: View {
    @Environment(Store.self) var store
    @Environment(\.dynamicTypeSize) var dynamicType
    @Binding var path: NavigationPath
    @State private var showVoiceGuide = Launch.has("-voiceguide")
    @State private var showCourses = false
    @State private var openWord: Word?

    var course: String { store.course.id }
    var radius: CGFloat { Look.current.radius }

    var body: some View {
        let p = store.words.planToday(store.state, extraNew: store.extraNew)
        let next = store.dialogues.first { !store.state.dialogueDone($0.id) }
        Page {
            VStack(alignment: .leading, spacing: course == "ja" ? 22 : 16) {
                header
                goal
                lessonCard(p)
                voiceNotice
                if let w = wordOfDay {
                    switch course {
                    case "ja": verticalWord(w)
                    case "ko": buildThePhrase(w)
                    case "vi": toneWord(w)
                    default: gridWord(w)
                    }
                }
                if course == "vi" { ToneDrillCard() } else { quickTiles(due: p.due.count) }
            }
            if let next { nextDialogue(next) }
            lessonLines
            SyncLine()
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showVoiceGuide) { NavigationStack { VoiceGuide() }.environment(store) }
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium, .large]) }
        .sheet(item: $openWord) { w in WordDetail(w: w).presentationDetents([.medium, .large]) }
    }

    // MARK: Header: course (tap to switch), greeting, streak

    var header: some View {
        let g = Greeting.now(course)
        let tr = store.state.lang == "de" ? g.de : g.en
        return HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                CapsLabel(text: "\(store.t("langName")) · \(store.levelLabel)", chevron: true) { showCourses = true }
                    .accessibilityLabel(store.t("switchCourse"))
                switch course {
                case "zh":
                    if store.pyFirst {
                        PinyinText(py: g.reading, size: 30, weight: .bold)
                        Text("\(g.text) · \(tr)").font(.subheadline).foregroundStyle(Color.ink2)
                    } else {
                        PinyinText(py: g.reading, size: 12, weight: .bold)
                        Text(g.text).hanziFont(34, .semibold)
                        Text(tr).font(.subheadline).foregroundStyle(Color.ink2)
                    }
                case "vi":
                    VietText(text: g.text, size: 30, weight: .heavy)
                    Text(tr).font(.subheadline).foregroundStyle(Color.ink2)
                default:
                    Text(g.text).hanziFont(course == "ko" ? 32 : 34, course == "ja" ? .bold : .regular)
                    Text("\(g.reading) · \(tr)").font(.subheadline).foregroundStyle(Color.ink2)
                }
            }
            Spacer()
            streak
        }
        .padding(.top, 8)
    }

    @ViewBuilder var streak: some View {
        let n = store.state.streak()
        let days = store.state.lang == "de" ? (n == 1 ? "Tag" : "Tage") : (n == 1 ? "day" : "days")
        switch course {
        case "ja":
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(n)日").hanziFont(22, .bold).foregroundStyle(Color.accent)
                Text(store.t("statsStreak")).font(.caption2).foregroundStyle(Color.ink2)
            }.padding(.top, 4).accessibilityElement(children: .combine)
        case "ko":
            HStack(spacing: 6) {
                RoundedRectangle(cornerRadius: 2).fill(Color.dynamic(0xC8323C, 0xF26B6B, text: false)).frame(width: 10, height: 10)
                Text("\(n) \(days)").font(.subheadline.weight(.bold))
            }
            .padding(.horizontal, 12).frame(height: 36)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.line))
            .accessibilityElement(children: .combine)
        case "vi":
            Text("\(n) \(days)").font(.subheadline.weight(.bold)).foregroundStyle(Color.onAction)
                .padding(.horizontal, 12).frame(height: 36).background(Color.action, in: RoundedRectangle(cornerRadius: 12))
        default:
            VStack(spacing: 0) {
                Text("\(n)").font(.system(size: 20, weight: .bold)).monospacedDigit()
                Text(days).font(.system(size: 10, weight: .medium))
            }
            .foregroundStyle(Color.accent).frame(width: 52, height: 52)
            .overlay(Rectangle().stroke(Color.accent, lineWidth: 1.5))
            .accessibilityElement(children: .combine)
        }
    }

    // MARK: Today's goal

    var goal: some View {
        let n = store.state.dayCount(todayKey()), goal = store.state.settings.dailyGoal
        let f = min(1, Double(n) / Double(max(goal, 1)))
        return VStack(spacing: 6) {
            HStack {
                Text(store.t("goalToday")).foregroundStyle(Color.ink2)
                Spacer()
                Text("\(n) / \(goal)").fontWeight(.bold).monospacedDigit()
            }.font(.footnote)
            if course == "ko" {
                // Ten blocks, like syllables filling up
                HStack(spacing: 3) {
                    ForEach(0..<10, id: \.self) { k in
                        RoundedRectangle(cornerRadius: 2).fill(Double(k) < f * 10 ? Color.accent : Color.line).frame(height: 8)
                    }
                }
            } else {
                let h: CGFloat = course == "vi" ? 8 : course == "ja" ? 3 : 4
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: course == "zh" ? 0 : h / 2).fill(Color.line)
                        RoundedRectangle(cornerRadius: course == "zh" ? 0 : h / 2).fill(course == "vi" ? Color.action : Color.accent).frame(width: g.size.width * f)
                    }
                }.frame(height: h)
            }
        }
        .accessibilityElement(children: .combine)
    }

    // MARK: The daily session

    /// "Continue" in the language: 继续, 続ける, 계속, Tiếp tục
    var continueLabel: String {
        let native = ["zh": "继续", "ja": "続ける", "ko": "계속", "vi": "Tiếp tục"][course]
        return store.t("continue") + (native.map { " · " + $0 } ?? "")
    }
    /// The session's title in the language, then in yours
    var sessionTitleNative: String { ["zh": "今天的课", "ja": "今日のレッスン", "ko": "오늘의 공부", "vi": "Bài hôm nay"][course] ?? "" }

    @ViewBuilder func lessonCard(_ p: (due: [Word], fresh: [Word], unseen: Int)) -> some View {
        let plan = TodaySession.plan(store)
        let work = !p.due.isEmpty || !p.fresh.isEmpty || !plan.todo.isEmpty
        let n = store.state.dayCount(todayKey()), introduced = store.words.introducedToday(store.state)
        let topic = p.fresh.first.flatMap { store.words.theme(of: $0.id) }
        let dark = course == "ko" || course == "vi" // a filled card with a light button
        let planText = !p.due.isEmpty && !p.fresh.isEmpty ? store.t("sessionPlan", p.due.count, p.fresh.count) : !p.due.isEmpty ? store.t("sessionPlanReviews", p.due.count) : store.t("sessionPlanNew", p.fresh.count)
        let content = VStack(alignment: .leading, spacing: 4) {
            if work {
                HStack {
                    Text(store.t("todaysSession").uppercased()).font(.caption.weight(.bold)).tracking(1.4)
                    Spacer()
                    Text(store.t("minAbout", TodaySession.minutes(plan.todo))).font(.caption)
                }.foregroundStyle(dark ? Color.white.opacity(0.75) : Color.ink2)
                Text(planText).font(.title2.weight(.bold)).padding(.top, 6)
                if let topic { Text(store.t("topicLine", topic.name.get(store.state.lang))).font(.footnote).foregroundStyle(dark ? Color.white.opacity(0.75) : Color.ink2) }
                let done = Set(plan.done + plan.steps.filter { $0.list.isEmpty }.map(\.kind))
                StepSegments(kinds: plan.steps.map(\.kind), done: done, current: plan.todo.first?.kind, onDark: dark).padding(.top, 10)
                Button { path.append(Route.today) } label: { Text(continueLabel) }.buttonStyle(cardButton).accessibilityIdentifier("Continue").padding(.top, 8)
            } else {
                if let topic { Text("\(topic.icon)  \(topic.name.get(store.state.lang))").font(.caption).foregroundStyle(dark ? Color.white.opacity(0.75) : Color.ink2) }
                Text(n > 0 || introduced > 0 ? store.t("sessionDone") : store.t("sessionTitle")).font(.title3.weight(.bold))
                Text(n > 0 || introduced > 0 ? store.t("sessionDoneSub") : store.t("sessionEmpty")).font(.footnote).foregroundStyle(dark ? Color.white.opacity(0.75) : Color.ink2)
                if p.unseen > 0 {
                    Button(store.t("moreNew", min(5, p.unseen))) { store.extraNew += 5; path.append(Route.today) }.buttonStyle(cardButton).padding(.top, 8)
                }
            }
        }
        switch course {
        case "ja": // no card: a section between two hairlines
            content.padding(.vertical, 16).frame(maxWidth: .infinity, alignment: .leading)
                .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
                .overlay(alignment: .bottom) { Rectangle().fill(Color.line).frame(height: 1) }
        case "ko":
            content.foregroundStyle(Color.white).padding(16).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.dynamic(0x16213E, 0x232D4D, text: false), in: RoundedRectangle(cornerRadius: 16))
        case "vi":
            content.foregroundStyle(Color.dynamic(0xFAFAF7, 0xFAFAF7, text: false)).padding(16).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.dynamic(0x0F2A24, 0x1D3A33, text: false), in: RoundedRectangle(cornerRadius: 18))
        default:
            content.padding(16).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.elevated, in: Rectangle()).overlay(Rectangle().stroke(Color.line))
        }
    }
    var cardButton: PrimaryButtonStyle {
        switch course {
        case "ko": return PrimaryButtonStyle(tint: Color.dynamic(0xF2B544, 0xF2B544, text: false), text: Color.dynamic(0x16213E, 0x16213E, text: false))
        case "vi": return PrimaryButtonStyle(tint: Color.dynamic(0xC5F27A, 0xC5F27A, text: false), text: Color.dynamic(0x0F2A24, 0x0F2A24, text: false))
        default: return PrimaryButtonStyle()
        }
    }

    // MARK: Word of the day, per language

    /// The same word all day: one you have met (or the next to meet) that has a picture
    var wordOfDay: Word? {
        let pics = store.words.selected.filter { store.words.picture($0.id) != nil }
        let met = pics.filter { store.status($0.id) != .new }
        let pool = met.count >= 3 ? met : Array(pics.prefix(30))
        guard !pool.isEmpty else { return nil }
        return pool[Int(Date().timeIntervalSince1970 / 86_400) % pool.count]
    }

    /// Chinese: the character large in its practice grid
    func gridWord(_ w: Word) -> some View {
        Button { openWord = w } label: {
            HStack(alignment: .top, spacing: 16) {
                GridChars(text: w.hz, cell: w.hz.count > 1 ? 64 : 112)
                VStack(alignment: .leading, spacing: 3) {
                    CapsLabel(text: store.t("wordOfDay"))
                    PinyinText(py: w.py, size: 24, weight: .bold)
                    Text(store.tr(w)).font(.subheadline.weight(.medium)).lineLimit(2)
                    if let p = store.words.picture(w.id) { Text(p).font(.title2).padding(.top, 4).accessibilityHidden(true) }
                }
                Spacer(minLength: 0)
                SpeakButton(text: w.hz, small: true)
            }
            .padding(16).background(Color.elevated).overlay(Rectangle().stroke(Color.line)).foregroundStyle(Color.ink)
        }.buttonStyle(.card)
    }

    /// Japanese: the word written top to bottom on a mist tile, the reading beside it
    func verticalWord(_ w: Word) -> some View {
        Button { openWord = w } label: {
            HStack(alignment: .top, spacing: 20) {
                VStack(spacing: 0) {
                    ForEach(Array(w.hz.prefix(4).enumerated()), id: \.offset) { _, c in Text(String(c)).hanziFont(48, .bold) }
                }
                .frame(width: 96).frame(minHeight: 196)
                .background(Color.dynamic(0xDCE2EC, 0x2A3346, text: false), in: RoundedRectangle(cornerRadius: 8))
                VStack(alignment: .leading, spacing: 4) {
                    CapsLabel(text: store.t("wordOfDay"))
                    if let k = w.kana, k != w.hz { Text(k).hanziFont(15).foregroundStyle(Color.accent) }
                    Text(w.romaji ?? w.py).font(.title3.weight(.bold))
                    Text(store.tr(w)).font(.subheadline).lineLimit(3)
                    Spacer(minLength: 8)
                    SpeakButton(text: w.hz, small: true)
                }
                Spacer(minLength: 0)
            }.foregroundStyle(Color.ink)
        }.buttonStyle(.card)
    }

    /// Korean: build the word from its letters, syllable by syllable
    func buildThePhrase(_ w: Word) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    CapsLabel(text: store.t("wordOfDay"))
                    (Text(w.hz).font(.title2) + Text("  " + store.tr(w)).font(.footnote).foregroundColor(Color.ink2))
                }
                Spacer()
                SpeakButton(text: w.hz, small: true)
            }
            ForEach(Array(w.hz.filter { Lingo.koJamo($0) != nil }.prefix(3).enumerated()), id: \.offset) { _, c in
                if let j = Lingo.koJamo(c) {
                    HStack(spacing: 8) {
                        jamo(j.i, bg: .action, fg: .onAction)
                        jamo(j.v, bg: Color.dynamic(0xF2B544, 0xF2B544, text: false), fg: Color.dynamic(0x16213E, 0x16213E, text: false))
                        if !j.f.isEmpty { jamo(j.f, bg: Color.dynamic(0xC8323C, 0xC8323C, text: false), fg: .white) }
                        Text("→").foregroundStyle(Color.ink2)
                        Text(String(c)).hanziFont(30).frame(width: 56, height: 56).overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.ink, lineWidth: 2))
                        Text(KoreanSyllable.roman(c)).font(.footnote.weight(.bold)).foregroundStyle(Color.ink2)
                    }
                }
            }
        }
        .padding(16).background(Color.elevated, in: RoundedRectangle(cornerRadius: 16))
        .contentShape(Rectangle()).onTapGesture { openWord = w }
    }
    func jamo(_ s: String, bg: Color, fg: Color) -> some View {
        Text(s).font(.title3).frame(width: 40, height: 40).background(bg, in: RoundedRectangle(cornerRadius: 10)).foregroundStyle(fg)
    }

    /// Vietnamese: the word in its tone's colour beside a tile with the tone's contour
    func toneWord(_ w: Word) -> some View {
        let n = Lingo.firstTone(w.hz, course: "vi")
        let name = ["ngang", "huyền", "sắc", "hỏi", "ngã", "nặng"][max(0, min(5, n - 1))]
        return Button { openWord = w } label: {
            HStack(spacing: 14) {
                VStack(spacing: 2) {
                    ToneIcon(n: n, course: "vi")
                    Text(name).font(.caption.weight(.bold)).foregroundStyle(Color.viTone(n))
                }
                .frame(width: 84, height: 84)
                .background(Color.viTone(n).opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
                VStack(alignment: .leading, spacing: 0) {
                    CapsLabel(text: store.t("wordOfDay"))
                    VietText(text: w.hz, size: 32, weight: .heavy)
                    Text(store.tr(w)).font(.footnote).foregroundStyle(Color.ink2).lineLimit(2)
                }
                Spacer(minLength: 0)
                Button { store.speaker.say(w.hz) } label: {
                    Image(systemName: "speaker.wave.2.fill").frame(width: 48, height: 48)
                        .background(Color.action, in: RoundedRectangle(cornerRadius: 14)).foregroundStyle(Color.onAction)
                }.buttonStyle(.card).accessibilityLabel(store.t("speak"))
            }
            .padding(16).background(Color.elevated, in: RoundedRectangle(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.line)).foregroundStyle(Color.ink)
        }.buttonStyle(.card)
    }

    // MARK: Review · Listen · Speak

    func quickTiles(due: Int) -> some View {
        let labels: [String: [String]] = ["zh": ["复习", "听", "说"], "ja": ["復習", "聞く", "話す"], "ko": ["복습", "듣기", "말하기"]]
        let l = store.pyFirst ? ["fùxí", "tīng", "shuō"] : labels[course] ?? ["↺", "♪", "◎"]
        let tiles: [(String, String, Route)] = [
            (l[0], store.t("stepReview") + (due > 0 ? " · \(due)" : ""), .mode(.flash)),
            (l[1], store.t("stepListen") + " · " + store.t("minutes", 5), .mode(.listen)),
            (l[2], store.t("stepSpeak") + " · " + store.t("words3", 5), .mode(.say))
        ]
        let r: CGFloat = course == "zh" ? 0 : course == "ja" ? 8 : 12
        return LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: dynamicType.isAccessibilitySize ? 1 : 3), spacing: 8) {
            ForEach(Array(tiles.enumerated()), id: \.offset) { k, tile in
                let hot = k == 0 && due > 0
                NavigationLink(value: tile.2) {
                    VStack(alignment: .leading, spacing: 0) {
                        if store.pyFirst { PinyinText(py: tile.0, size: 17, weight: .bold) }
                        else { Text(tile.0).hanziFont(24).foregroundStyle(hot ? Color.accent : Color.ink) }
                        Spacer(minLength: 8)
                        Text(tile.1).font(.caption).foregroundStyle(Color.ink).lineLimit(2)
                    }
                    .frame(maxWidth: .infinity, minHeight: 84, alignment: .topLeading).padding(.horizontal, 12).padding(.vertical, 10)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: r))
                    .overlay(RoundedRectangle(cornerRadius: r).stroke(hot ? Color.accent : Color.line, lineWidth: hot ? 1.5 : 1))
                }
                .buttonStyle(.card)
            }
        }
    }

    // MARK: Next dialogue and lessons, each under a heavy rule

    func ruleHead(_ left: String, _ right: String) -> some View {
        HStack {
            Text(left.uppercased()).font(.caption.weight(.bold)).tracking(1.4)
            Spacer()
            Text(right).font(.caption)
        }.foregroundStyle(Color.ink2)
    }
    /// The next dialogue: its first line, and which of Listen · Read aloud · Role play are done
    func nextDialogue(_ d: Dialogue) -> some View {
        let st = store.state.dialogue(d.id), l0 = d.lines[0], all = store.dialogues
        let k = (all.firstIndex { $0.id == d.id } ?? 0) + 1
        return NavigationLink(value: Route.dialogue(d.id)) {
            VStack(alignment: .leading, spacing: 6) {
                ruleHead(store.t("nextDialogue"), "\(d.topic.get(store.state.lang)) · \(store.t("dlgOf", k, all.count))")
                if course == "zh" && store.pyFirst {
                    PinyinText(py: l0.py, size: 19, weight: .bold)
                    (Text(l0.hz).foregroundColor(Color.ink) + Text(" · " + l0.tr(store.state.lang)).foregroundColor(Color.ink2)).font(.subheadline)
                } else {
                    if course == "vi" { VietText(text: l0.hz, size: 19, weight: .bold) } else { Text(l0.hz).hanziFont(19, .bold) }
                    Text((course != "vi" && !l0.py.isEmpty ? l0.py + " · " : "") + l0.tr(store.state.lang)).font(.subheadline).foregroundStyle(Color.ink2)
                }
                HStack(spacing: 14) {
                    tick(st.listen != nil, store.t("dlg_listen")); tick(st.read != nil, store.t("dlg_read")); tick(st.turn != nil, store.t("dlg_turn"))
                }.padding(.top, 2)
            }
            .padding(.top, 12).frame(maxWidth: .infinity, alignment: .leading)
            .overlay(alignment: .top) { Rectangle().fill(Color.ink).frame(height: 2) }
            .contentShape(Rectangle())
        }.buttonStyle(.card).padding(.top, 18)
    }
    func tick(_ on: Bool, _ label: String) -> some View {
        HStack(spacing: 4) {
            if on { Image(systemName: "checkmark").font(.caption2.weight(.bold)) }
            else { RoundedRectangle(cornerRadius: 2).stroke(Color.ink2, lineWidth: 1.5).frame(width: 10, height: 10) }
            Text(label)
        }.font(.caption).foregroundStyle(on ? Color.ink : Color.ink2)
    }
    /// Your lessons as progress lines (the newest three); all of them on the dialogues page
    var lessonLines: some View {
        let lessons = store.state.lessons(course: store.course.id)
        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(store.t("myLessons").uppercased()).font(.caption.weight(.bold)).tracking(1.4).foregroundStyle(Color.ink2)
                Spacer()
                Button {
                    let id = newId("l")
                    let name = store.t("lessonDefault", lessons.count + 1) // read before changing the state
                    store.update { $0.lessons[id] = Lesson(course: $0.course, name: name, created: nowMs()) }
                    path.append(Route.lesson(id))
                } label: { Label(store.t("lessonNew"), systemImage: "plus").font(.caption.weight(.semibold)) }.buttonStyle(.card).foregroundStyle(Color.ink).frame(minHeight: 32)
            }
            if lessons.isEmpty { Text(store.t("lessonEmpty")).font(.footnote).foregroundStyle(Color.ink2) }
            ForEach(Array(lessons.reversed().prefix(3)), id: \.id) { l in
                let ws = l.lesson.words.filter { store.word($0.id) != nil }
                let known = ws.filter { store.status($0.id) == .known }.count
                let pct = ws.isEmpty ? 0 : Int((Double(known) / Double(ws.count) * 100).rounded())
                NavigationLink(value: Route.lesson(l.id)) {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(l.lesson.name).font(.subheadline.weight(.medium)).foregroundStyle(Color.ink).lineLimit(1)
                            Spacer()
                            Text("\(store.t("lessonWords", ws.count)) · \(pct)%").font(.subheadline).foregroundStyle(Color.ink2)
                        }
                        GeometryReader { g in
                            ZStack(alignment: .leading) { Rectangle().fill(Color.sunken); Rectangle().fill(Color.ink).frame(width: g.size.width * CGFloat(pct) / 100) }
                        }.frame(height: 4)
                    }.contentShape(Rectangle())
                }.buttonStyle(.card)
            }
            NavigationLink(value: Route.myLessons) { Text(store.t("allLessons") + " →").font(.caption.weight(.semibold)).foregroundStyle(Color.ink).frame(minHeight: 32) }.buttonStyle(.card)
        }
        .padding(.top, 12)
        .overlay(alignment: .top) { Rectangle().fill(Color.ink).frame(height: 2) }
        .padding(.top, 18)
    }

    /// Once per language: how to get a natural voice
    @ViewBuilder var voiceNotice: some View {
        let _ = store.voiceCheck
        if store.speaker.level() != .natural && !store.voiceGuideDismissed.contains(store.course.id) && !store.speaker.muted || Launch.has("-voicebanner") {
            CardBox {
                Label(store.t("voiceGuideTitle"), systemImage: "waveform").font(.headline)
                Text(store.t("voiceGuideBanner", store.t("langName"))).font(.subheadline).foregroundStyle(Color.ink2)
                HStack {
                    Button(store.t("notNow")) { store.dismissVoiceGuide() }.buttonStyle(.secondary)
                    Button(store.t("voiceShowMe")) { showVoiceGuide = true }.buttonStyle(.primary)
                }
            }
        }
    }
}

/// Vietnamese: which tone did you hear? ma · mà · má · mả · mã · mạ, a quick round on the home screen
struct ToneDrillCard: View {
    @Environment(Store.self) var store
    @State private var target = Int.random(in: 1...6)
    @State private var picked: Int?
    @State private var round = 1
    let syllables = ["ma", "mà", "má", "mả", "mã", "mạ"]
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(store.t("toneQ")).font(.footnote.weight(.bold))
                Spacer()
                Button { store.speaker.say(syllables[target - 1] + ".", rate: 0.7) } label: { Label(store.t("play"), systemImage: "play.fill").font(.footnote.weight(.semibold)) }
                    .buttonStyle(.card).foregroundStyle(Color.ink)
            }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                ForEach(1...6, id: \.self) { n in
                    let state = picked == nil ? 0 : n == target ? 1 : n == picked ? 2 : 0
                    Button { answer(n) } label: {
                        Text(syllables[n - 1]).font(.custom("BeVietnamPro-ExtraBold", size: 18, relativeTo: .body))
                            .frame(maxWidth: .infinity, minHeight: 48).foregroundStyle(Color.viTone(n))
                            .background(state == 1 ? Color.good.opacity(0.12) : state == 2 ? Color.bad.opacity(0.12) : Color.paper, in: RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(state == 1 ? Color.good : state == 2 ? Color.bad : Color.line, lineWidth: 1.5))
                    }.buttonStyle(.card)
                }
            }
        }
        .padding(14).background(Color.elevated, in: RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.line))
    }
    func answer(_ n: Int) {
        if picked != nil { // next round
            picked = nil; target = Int.random(in: 1...6); round += 1
            store.speaker.say(syllables[target - 1] + ".", rate: 0.7); return
        }
        picked = n
        Haptic.answer(n == target)
        store.recordAnswer(n == target)
    }
}

/// A small spaced-out heading, as on the canvas (CHINESE · HSK 1)
struct CapsLabel: View {
    let text: String
    var chevron = false
    var action: (() -> Void)?
    var body: some View {
        let label = HStack(spacing: 4) {
            Text(text.uppercased()).font(.caption.weight(.bold)).tracking(1.4)
            if chevron { Image(systemName: "chevron.down").font(.caption2.weight(.bold)) }
        }.foregroundStyle(Color.ink2)
        if let action { Button(action: action) { label.frame(minHeight: 32) }.buttonStyle(.card) } else { label }
    }
}

/// One Hangul syllable in romanization (for the letter tiles)
enum KoreanSyllable {
    static func roman(_ c: Character) -> String {
        guard let j = Lingo.koJamo(c) else { return "" }
        let ini: [String: String] = ["ㄱ": "g", "ㄲ": "kk", "ㄴ": "n", "ㄷ": "d", "ㄸ": "tt", "ㄹ": "r", "ㅁ": "m", "ㅂ": "b", "ㅃ": "pp", "ㅅ": "s", "ㅆ": "ss", "ㅇ": "", "ㅈ": "j", "ㅉ": "jj", "ㅊ": "ch", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "h"]
        let vow: [String: String] = ["ㅏ": "a", "ㅐ": "ae", "ㅑ": "ya", "ㅒ": "yae", "ㅓ": "eo", "ㅔ": "e", "ㅕ": "yeo", "ㅖ": "ye", "ㅗ": "o", "ㅘ": "wa", "ㅙ": "wae", "ㅚ": "oe", "ㅛ": "yo", "ㅜ": "u", "ㅝ": "wo", "ㅞ": "we", "ㅟ": "wi", "ㅠ": "yu", "ㅡ": "eu", "ㅢ": "ui", "ㅣ": "i"]
        let fin: [String: String] = ["ㄱ": "k", "ㄲ": "k", "ㅋ": "k", "ㄴ": "n", "ㄷ": "t", "ㅅ": "t", "ㅆ": "t", "ㅈ": "t", "ㅊ": "t", "ㅌ": "t", "ㅎ": "t", "ㄹ": "l", "ㅁ": "m", "ㅂ": "p", "ㅍ": "p", "ㅇ": "ng"]
        return (ini[j.i] ?? "") + (vow[j.v] ?? "") + (fin[j.f] ?? "")
    }
}

/// A greeting for the time of day, in the language being learnt
enum Greeting {
    static func now(_ course: String, hour: Int = Calendar.current.component(.hour, from: Date())) -> (text: String, reading: String, en: String, de: String) {
        let part = hour < 11 ? 0 : hour < 18 ? 1 : 2
        let en = ["Good morning", "Good afternoon", "Good evening"][part], de = ["Guten Morgen", "Guten Tag", "Guten Abend"][part]
        switch course {
        case "zh": return [("早上好", "zǎoshang hǎo"), ("下午好", "xiàwǔ hǎo"), ("晚上好", "wǎnshang hǎo")].map { ($0.0, $0.1, en, de) }[part]
        case "ja": return [("おはよう", "ohayō"), ("こんにちは", "konnichiwa"), ("こんばんは", "konbanwa")].map { ($0.0, $0.1, en, de) }[part]
        case "ko": return [("좋은 아침이에요", "joeun achimieyo"), ("안녕하세요", "annyeonghaseyo"), ("좋은 저녁이에요", "joeun jeonyeogieyo")].map { ($0.0, $0.1, en, de) }[part]
        default: return [("Chào buổi sáng", ""), ("Chào buổi chiều", ""), ("Chào buổi tối", "")].map { ($0.0, $0.1, en, de) }[part]
        }
    }
}
