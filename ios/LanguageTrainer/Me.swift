import SwiftUI
import UserNotifications
import LanguageCore

/* Me: who is learning what, the numbers, and every preference (from the style canvas):
 * voice & microphone, daily plan, while studying, reminder, sync and the rest. */

struct MeView: View {
    @Environment(Store.self) var store
    @State private var showCourses = false
    @State private var micResult: Spoken?
    @State private var reminderOn = Reminder.isOn
    @State private var reminderTime = Reminder.time

    var body: some View {
        let s = store.state.settings, ws = store.words.selected
        let known = ws.filter { store.status($0.id) == .known }.count
        let answered = store.state.answeredTotal
        let acc = answered > 0 ? Int((Double(store.state.correctTotal) / Double(answered) * 100).rounded()) : 0
        Page {
            // Who and what
            Button { showCourses = true } label: {
                HStack(spacing: 14) {
                    Text(Look.current.tabs[3]).hanziFont(28).foregroundStyle(Color.accent)
                        .frame(width: 56, height: 56).overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.accent, lineWidth: 1.5))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(store.course.name).font(.title3.weight(.bold))
                        Text(store.t("learningCourse", store.t("langName"), store.levelLabel)).font(.subheadline).foregroundStyle(Color.ink2)
                    }
                    Spacer()
                    Image(systemName: "chevron.right").foregroundStyle(Color.ink3)
                }.foregroundStyle(Color.ink)
            }.buttonStyle(.plain).accessibilityHint(store.t("switchCourse"))
            HStack(spacing: 0) {
                number("\(store.state.streak())", store.t("statsStreak"), accent: true)
                Divider()
                number("\(known)", store.t("statsWords"))
                Divider()
                number("\(acc)%", store.t("statsAccuracy"))
            }
            .padding(.vertical, 10).overlay(alignment: .top) { Divider() }.overlay(alignment: .bottom) { Divider() }
            NavigationLink(value: Route.progress) { ListRow(title: store.t("fullStats"), icon: "chart.bar") }.buttonStyle(.plain)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2)).overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))

            section(store.t("voiceMic")) {
                NavigationLink { VoicePicker() } label: { row(store.t("voice"), value: store.speaker.currentVoice?.name ?? "–") }
                Divider()
                VStack(alignment: .leading, spacing: 6) {
                    HStack { Text(store.t("ttsRate")); Spacer(); Text(String(format: "%.2f×", s.rate)).fontWeight(.bold).monospacedDigit() }
                    Slider(value: Binding(get: { s.rate }, set: { v in store.update { $0.settings.rate = (v * 20).rounded() / 20 } }), in: 0.5...1.25).tint(.accent)
                }.padding(14)
                HStack(spacing: 8) {
                    Button { store.speaker.say(store.course.testPhrase) } label: { Label(store.t("ttsTest"), systemImage: "play.fill") }.buttonStyle(.primary)
                    MicButton(key: "me-test", target: store.course.testPhrase, py: "") { micResult = $0 }
                }.padding([.horizontal, .bottom], 14)
                if let r = micResult, let h = r.heard {
                    Text(store.t("heardAs", h.text.isEmpty ? "–" : h.text)).font(.footnote).foregroundStyle(Color.ink2).padding([.horizontal, .bottom], 14)
                }
                Divider()
                NavigationLink { VoiceGuide() } label: { row(store.t("voiceGuideTitle"), value: store.speaker.level() == .natural ? "✓" : "") }
            }

            section(store.t("dailyPlan")) {
                stepper(store.t("newPerDay"), value: s.newPerDay, range: 1...30, step: 1) { v in store.update { $0.settings.newPerDay = v } }
                Divider()
                stepper(store.t("maxReviews"), value: s.maxReviews ?? CourseWords.reviewCap, range: 10...200, step: 10) { v in store.update { $0.settings.maxReviews = v } }
                Divider()
                VStack(alignment: .leading, spacing: 8) {
                    Text(store.t("dailyGoal"))
                    Picker("", selection: Binding(get: { s.dailyGoal }, set: { g in store.update { $0.settings.dailyGoal = g } })) {
                        ForEach([10, 20, 50], id: \.self) { Text("\($0)").tag($0) }
                    }.pickerStyle(.segmented)
                }.padding(14)
            }

            section(store.t("whileStudying")) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(store.t("readingLayer"))
                    Picker(store.t("readingLayer"), selection: Binding(get: { store.readingLayer }, set: { v in store.update { $0.settings.readingLayer = v; $0.settings.tilePinyin = v != "off" } })) {
                        Text(store.t("readingAlways")).tag("always"); Text(store.t("readingNew")).tag("new"); Text(store.t("readingOff")).tag("off")
                    }.pickerStyle(.segmented)
                }.padding(14)
                if store.course.id == "zh" {
                    Divider()
                    toggle(store.t("pinyinFirst"), sub: store.t("pinyinFirstDesc"), isOn: store.pyFirst) { v in store.update { $0.courses["zh", default: CourseState()].pinyinFirst = v } }
                }
                if store.course.id == "zh" || store.course.id == "vi" {
                    Divider()
                    toggle(store.t("colorTones"), isOn: s.toneColors != false) { v in store.update { $0.settings.toneColors = v } }
                }
                Divider()
                toggle(store.t("autoPlay"), isOn: s.autoSpeak) { v in store.update { $0.settings.autoSpeak = v } }
                Divider()
                VStack(alignment: .leading, spacing: 8) {
                    Text(store.t("language"))
                    Picker("", selection: Binding(get: { store.state.lang }, set: { v in store.update { $0.lang = v } })) {
                        Text("English").tag("en"); Text("Deutsch").tag("de")
                    }.pickerStyle(.segmented)
                }.padding(14)
            }

            section("iPhone") {
                toggle(store.t("reminder"), sub: reminderOn ? reminderTime.formatted(date: .omitted, time: .shortened) : nil, isOn: reminderOn) { v in
                    reminderOn = v
                    Task { reminderOn = await Reminder.set(on: v, at: reminderTime, text: store.t("reminderBody", store.t("langName"))) }
                }
                if reminderOn {
                    DatePicker(store.t("reminder"), selection: $reminderTime, displayedComponents: .hourAndMinute)
                        .padding(.horizontal, 14).padding(.bottom, 10)
                        .onChange(of: reminderTime) { _, t in Task { _ = await Reminder.set(on: true, at: t, text: store.t("reminderBody", store.t("langName"))) } }
                }
                Divider()
                NavigationLink { SyncView() } label: { row(store.t("sync"), value: store.device.code != nil ? store.syncStatusText : store.t("syncDesc")) }
            }

            // A tip for beginners, a different one each day
            let tips = store.t.list("pinyinTipsText")
            if !tips.isEmpty {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "lightbulb").font(.headline).foregroundStyle(Color.onAction).frame(width: 36, height: 36).background(Color.accent, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(store.t("tipTitle")).font(.subheadline.weight(.bold))
                        Text(tips[Int(Date().timeIntervalSince1970 / 86_400) % tips.count]).font(.subheadline).foregroundStyle(Color.ink2)
                        NavigationLink { TipsView() } label: { Text(store.t("allTips") + " →").font(.subheadline.weight(.bold)).foregroundStyle(Color.accent) }
                    }
                }
                .padding(14).frame(maxWidth: .infinity, alignment: .leading)
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.accent.opacity(0.4), style: StrokeStyle(lineWidth: 1, dash: [5, 4])))
            }
            section("") {
                if store.course.toneOptions != nil { NavigationLink { ToneGuide() } label: { row(store.t("toneGuide")) }; Divider() }
                NavigationLink { AboutView() } label: { row(store.t("about")) }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium, .large]) }
        .onAppear { Task { reminderOn = await Reminder.check() } }
    }

    func number(_ v: String, _ label: String, accent: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(v).font(.title2.weight(.bold)).foregroundStyle(accent ? Color.accent : Color.ink)
            Text(label).font(.caption).foregroundStyle(Color.ink2)
        }.frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10)
    }
    func section<C: View>(_ title: String, @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            if !title.isEmpty { SectionTitle(text: title).padding(.bottom, 6) }
            VStack(spacing: 0) { content() }
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
        }
    }
    func row(_ title: String, value: String = "") -> some View {
        HStack {
            Text(title).foregroundStyle(Color.ink)
            Spacer()
            Text(value).font(.subheadline).foregroundStyle(Color.ink2).lineLimit(1)
            Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(Color.ink3)
        }.padding(14).contentShape(Rectangle())
    }
    func toggle(_ title: String, sub: String? = nil, isOn: Bool, set: @escaping (Bool) -> Void) -> some View {
        Toggle(isOn: Binding(get: { isOn }, set: set)) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                if let sub { Text(sub).font(.footnote).foregroundStyle(Color.ink2) }
            }
        }.tint(.accent).padding(14)
    }
    func stepper(_ title: String, value: Int, range: ClosedRange<Int>, step: Int, set: @escaping (Int) -> Void) -> some View {
        Stepper(value: Binding(get: { value }, set: set), in: range, step: step) {
            HStack { Text(title); Spacer(); Text("\(value)").fontWeight(.bold).monospacedDigit() }
        }.padding(14)
    }
}

/// Voice choice, moved here from Settings
struct VoicePicker: View {
    @Environment(Store.self) var store
    var body: some View {
        let voices = store.speaker.courseVoices(), chosen = store.state.settings.voices?[store.course.id] ?? ""
        Page {
            VStack(spacing: 0) {
                pick(store.t("voiceAuto"), id: "", chosen: chosen)
                ForEach(voices, id: \.identifier) { v in
                    Divider()
                    let robotic = Speaker.rank(v) == 0
                    pick(v.name + (v.quality == .premium ? " (Premium)" : v.quality == .enhanced ? " (Enhanced)" : robotic ? " (robotic)" : ""), id: v.identifier, chosen: chosen)
                }
            }
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
            Text(store.t("voiceHint")).font(.footnote).foregroundStyle(Color.ink2)
        }
        .navigationTitle(store.t("voice")).navigationBarTitleDisplayMode(.inline)
    }
    func pick(_ name: String, id: String, chosen: String) -> some View {
        Button {
            store.update { var m = $0.settings.voices ?? [:]; m[$0.course] = id.isEmpty ? nil : id; $0.settings.voices = m }
            store.speaker.say(store.course.testPhrase)
        } label: {
            HStack { Text(name).foregroundStyle(Color.ink); Spacer(); if id == chosen { Image(systemName: "checkmark").foregroundStyle(Color.accent) } }
                .padding(14).contentShape(Rectangle())
        }.buttonStyle(.plain).accessibilityAddTraits(id == chosen ? .isSelected : [])
    }
}

/// A daily local notification (this iPhone only, not synced)
enum Reminder {
    static let id = "daily-reminder"
    static var isOn: Bool { UserDefaults.standard.bool(forKey: "reminder.on") }
    static var time: Date {
        let m = UserDefaults.standard.object(forKey: "reminder.minutes") as? Int ?? 19 * 60
        return Calendar.current.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: Date()) ?? Date()
    }
    /// Turns the reminder on or off; returns whether it is on (off when notifications aren't allowed)
    static func set(on: Bool, at t: Date, text: String) async -> Bool {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [id])
        let c = Calendar.current.dateComponents([.hour, .minute], from: t)
        UserDefaults.standard.set((c.hour ?? 19) * 60 + (c.minute ?? 0), forKey: "reminder.minutes")
        guard on, (try? await center.requestAuthorization(options: [.alert, .sound])) == true else {
            UserDefaults.standard.set(false, forKey: "reminder.on"); return false
        }
        let content = UNMutableNotificationContent()
        content.title = "Trainer"; content.body = text; content.sound = .default
        try? await center.add(UNNotificationRequest(identifier: id, content: content, trigger: UNCalendarNotificationTrigger(dateMatching: c, repeats: true)))
        UserDefaults.standard.set(true, forKey: "reminder.on")
        return true
    }
    static func check() async -> Bool {
        guard isOn else { return false }
        let pending = await UNUserNotificationCenter.current().pendingNotificationRequests()
        return pending.contains { $0.identifier == id }
    }
}
