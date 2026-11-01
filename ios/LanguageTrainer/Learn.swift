import SwiftUI
import LanguageCore

/* Learn: the home screen (from the style canvas). A greeting in the language, streak and today's goal,
 * one big Continue for the daily session, a word of the day, quick Review · Listen · Speak, and below
 * the lessons from class and the dialogues. */

struct LearnView: View {
    @Environment(Store.self) var store
    @Environment(\.dynamicTypeSize) var dynamicType
    @Binding var path: NavigationPath
    @State private var showVoiceGuide = Launch.has("-voiceguide")
    @State private var showCourses = false
    @State private var openWord: Word?

    var body: some View {
        let p = store.words.planToday(store.state, extraNew: store.extraNew)
        let n = store.state.dayCount(todayKey()), goal = store.state.settings.dailyGoal
        let introduced = store.words.introducedToday(store.state)
        let next = store.dialogues.first { !store.state.dialogueDone($0.id) }
        Page {
            header
            // Today's goal
            VStack(spacing: 6) {
                HStack {
                    Text(store.t("goalToday")).foregroundStyle(Color.ink2)
                    Spacer()
                    Text("\(n) / \(goal)").fontWeight(.bold).monospacedDigit()
                }.font(.subheadline)
                ProgressView(value: Double(min(n, goal)), total: Double(goal)).tint(.accent)
            }
            // The daily session
            VStack(alignment: .leading, spacing: 6) {
                if !p.due.isEmpty || !p.fresh.isEmpty {
                    if let first = p.fresh.first, let topic = store.words.theme(of: first.id) {
                        Text("\(topic.icon)  \(topic.name.get(store.state.lang))").font(.caption.weight(.semibold)).foregroundStyle(Color.onAction.opacity(0.8))
                    }
                    Text(store.t("sessionTitle")).font(.title2.weight(.bold))
                    Text(store.t("sessionDesc", p.due.count, p.fresh.count)).font(.subheadline).foregroundStyle(Color.onAction.opacity(0.8))
                    Button { path.append(Route.today) } label: { Text(store.t("continue")) }
                        .buttonStyle(PrimaryButtonStyle(tint: .onAction, text: .action)).padding(.top, 8)
                } else {
                    Text(n > 0 || introduced > 0 ? store.t("sessionDone") : store.t("sessionTitle")).font(.title2.weight(.bold))
                    Text(n > 0 || introduced > 0 ? store.t("sessionDoneSub") : store.t("sessionEmpty")).font(.subheadline).foregroundStyle(Color.onAction.opacity(0.8))
                    if p.unseen > 0 {
                        Button(store.t("moreNew", min(5, p.unseen))) { store.extraNew += 5; path.append(Route.today) }
                            .buttonStyle(PrimaryButtonStyle(tint: .onAction, text: .action)).padding(.top, 8)
                    }
                }
            }
            .foregroundStyle(Color.onAction)
            .padding(18).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.action, in: RoundedRectangle(cornerRadius: Look.current.radius + 4, style: .continuous))

            voiceNotice
            if let w = wordOfDay { wordOfDayCard(w) }
            quickTiles(due: p.due.count)

            if let next {
                SectionTitle(text: store.t("dialogues"))
                VStack(spacing: 0) {
                    NavigationLink(value: Route.dialogue(next.id)) { DialogueRow(d: next) }.buttonStyle(.plain)
                    Divider().padding(.leading, 16)
                    NavigationLink(value: Route.dialogues) { ListRow(title: store.t("allDialogues"), icon: "bubble.left.and.bubble.right") }.buttonStyle(.plain)
                }.background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2)).overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
            }
            MyLessons(path: $path)
            if store.device.code != nil {
                Text("☁️ " + store.syncStatusText).font(.footnote).foregroundStyle(Color.ink3).frame(maxWidth: .infinity).padding(.top, 8)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showVoiceGuide) { NavigationStack { VoiceGuide() }.environment(store) }
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium, .large]) }
        .sheet(item: $openWord) { w in WordDetail(w: w).presentationDetents([.medium, .large]) }
    }

    /// Course and level (tap to switch language), the greeting, the streak
    var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                Button { showCourses = true } label: {
                    HStack(spacing: 4) {
                        Text("\(store.t("langName")) · \(store.levelLabel)".uppercased()).font(.caption.weight(.bold)).tracking(1)
                        Image(systemName: "chevron.down").font(.caption2.weight(.bold))
                    }.foregroundStyle(Color.ink2)
                }
                .buttonStyle(.plain).accessibilityLabel(store.t("switchCourse"))
                let g = Greeting.now(store.course.id)
                if store.course.id == "zh" && !store.pyFirst { PinyinText(py: g.reading, size: 13, weight: .semibold) }
                if store.course.id == "zh" && store.pyFirst { PinyinText(py: g.reading, size: 30, weight: .bold) }
                else if store.course.id == "vi" { VietText(text: g.text, size: 30, weight: .heavy) }
                else { Text(g.text).hanziFont(32, .semibold) }
                Text(store.course.id == "zh" && store.pyFirst ? "\(g.text) · \(store.state.lang == "de" ? g.de : g.en)" : (store.course.id == "zh" ? "" : g.reading.isEmpty ? "" : g.reading + " · ") + (store.state.lang == "de" ? g.de : g.en))
                    .font(.subheadline).foregroundStyle(Color.ink2)
            }
            Spacer()
            VStack(spacing: 0) {
                Text("\(store.state.streak())").font(.title3.weight(.bold)).monospacedDigit()
                Text(store.t("statsStreak")).font(.system(size: 10, weight: .medium)).multilineTextAlignment(.center).lineLimit(2)
            }
            .foregroundStyle(Color.accent)
            .frame(width: 58, height: 58)
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.accent, lineWidth: 1.5))
            .accessibilityElement(children: .combine)
        }
        .padding(.top, 8)
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

    /// The same word all day: one you have met (or the next to meet) that has a picture
    var wordOfDay: Word? {
        let pics = store.words.selected.filter { store.words.picture($0.id) != nil }
        let met = pics.filter { store.status($0.id) != .new }
        let pool = met.count >= 3 ? met : Array(pics.prefix(30))
        guard !pool.isEmpty else { return nil }
        let day = Int(Date().timeIntervalSince1970 / 86_400)
        return pool[day % pool.count]
    }

    func wordOfDayCard(_ w: Word) -> some View {
        Button { openWord = w } label: {
            HStack(spacing: 16) {
                switch store.course.id {
                case "zh": GridChars(text: w.hz, cell: w.hz.count > 2 ? 52 : 72)
                default: Text(store.words.picture(w.id) ?? "").scaledFont(52).frame(width: 72, height: 72).background(Color.sunken, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text(store.t("wordOfDay").uppercased()).font(.caption2.weight(.bold)).tracking(1).foregroundStyle(Color.ink3)
                    switch store.course.id {
                    case "zh": PinyinText(py: w.py, size: 24, weight: .bold)
                    case "vi": VietText(text: w.hz, size: 26, weight: .heavy)
                    case "ja":
                        if let k = w.kana, k != w.hz { Text(k).font(.caption).foregroundStyle(Color.ink2) }
                        Text(w.hz).hanziFont(26)
                    default: Text(w.hz).hanziFont(26); Text(w.py).font(.caption).foregroundStyle(Color.ink2)
                    }
                    Text(store.tr(w)).font(.subheadline).foregroundStyle(Color.ink2).lineLimit(2)
                }
                Spacer(minLength: 0)
                SpeakButton(text: w.hz, small: true)
            }
            .padding(16)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
            .foregroundStyle(Color.ink)
        }
        .buttonStyle(.plain)
    }

    /// Review · Listen · Speak, labelled in the language as on the canvas (复习 · 听 · 说)
    func quickTiles(due: Int) -> some View {
        let labels: [String: [String]] = ["zh": ["复习", "听", "说"], "ja": ["復習", "聞く", "話す"], "ko": ["복습", "듣기", "말하기"], "vi": ["Ôn", "Nghe", "Nói"]]
        let l = labels[store.course.id] ?? ["↺", "♪", "◎"]
        let tiles: [(String, String, Route)] = [
            (l[0], store.t("stepReview") + (due > 0 ? " · \(due)" : ""), .mode(.flash)),
            (l[1], store.t("stepListen") + " · " + store.t("minutes", 5), .mode(.listen)),
            (l[2], store.t("stepSpeak") + " · " + store.t("words3", 5), .mode(.say))
        ]
        return LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: dynamicType.isAccessibilitySize ? 1 : 3), spacing: 8) {
            ForEach(Array(tiles.enumerated()), id: \.offset) { k, tile in
                NavigationLink(value: tile.2) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(tile.0).hanziFont(22).foregroundStyle(k == 0 && due > 0 ? Color.accent : Color.ink)
                        Text(tile.1).font(.caption).foregroundStyle(Color.ink2).lineLimit(2)
                    }
                    .frame(maxWidth: .infinity, minHeight: 72, alignment: .topLeading).padding(12)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(k == 0 && due > 0 ? Color.accent : Color.line, lineWidth: k == 0 && due > 0 ? 1.5 : 1))
                }
                .buttonStyle(.plain)
            }
        }
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
