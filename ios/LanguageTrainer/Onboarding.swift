import SwiftUI
import AVFoundation
import LanguageCore

/* The welcome on first launch (round 2 of the style canvas). Step 1: interface language, the course and how far
 * you are, pinyin first. Step 2: the voice, the microphone and the daily plan. Learners who already have progress
 * never see it (Store sets settings.onboarded for them). */

struct Onboarding: View {
    @Environment(Store.self) var store
    @State private var step = Launch.has("-obstep2") ? 2 : 1
    @State private var micOn = false

    static let glyph = ["zh": "中", "ja": "日", "ko": "ㅎㅏ", "vi": "Việt"]
    static let go = ["zh": "开始", "ja": "始めよう", "ko": "시작", "vi": "Bắt đầu"]

    var body: some View {
        NavigationStack {
            Group { if step == 1 { course } else { ready } }
                .id(store.course.id) // each language has its own look
                .background(Color.paper)
                .toolbar(.hidden, for: .navigationBar)
        }
    }

    func finish() { store.update { $0.settings.onboarded = 1 } }

    // MARK: Step 1 · what to learn

    var course: some View {
        VStack(spacing: 0) {
            Page {
                HStack {
                    Text(store.t("obStep", 1, 2)).font(.caption).foregroundStyle(Color.ink2)
                    Spacer()
                    Picker(store.t("language"), selection: Binding(get: { store.state.lang }, set: { v in store.update { $0.lang = v } })) {
                        Text("English").tag("en"); Text("Deutsch").tag("de")
                    }.pickerStyle(.segmented).frame(width: 190)
                }
                Text(store.t("obWhat")).font(.largeTitle.weight(.heavy)).fixedSize(horizontal: false, vertical: true).padding(.top, 6)
                    .accessibilityAddTraits(.isHeader)
                Text(store.t("obWhatSub")).font(.subheadline).foregroundStyle(Color.ink2)
                ForEach(Course.all) { c in courseCard(c) }
            }
            Button(store.t("obContinue", store.t("langName"))) { step = 2 }.buttonStyle(.primary).padding(16)
                .accessibilityIdentifier("ob-next")
        }
    }

    @ViewBuilder func courseCard(_ c: Course) -> some View {
        let on = c.id == store.course.id
        let count = Library.shared.words[c.id]?.count ?? 0
        let head = HStack(spacing: 12) {
            Text(Self.glyph[c.id] ?? c.glyph).font(c.script == .latin || c.id == "ko" ? .system(size: 14, weight: .heavy) : .system(size: 20))
                .frame(width: 44, height: 44).foregroundStyle(Color.accent)
                .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.accent, lineWidth: 1.5))
            VStack(alignment: .leading, spacing: 2) {
                Text(c.name.components(separatedBy: " · ").last ?? c.name).font(.headline).foregroundStyle(Color.ink)
                Text("\(c.allLabel) · \(store.t("wordsN", count.formatted()))").font(.caption).foregroundStyle(Color.ink2)
            }
            Spacer()
            if on { Image(systemName: "checkmark").foregroundStyle(Color.ink) }
        }
        if on {
            VStack(alignment: .leading, spacing: 12) {
                head
                let lv = Array(c.levels.prefix(3)), cur = store.levels.last ?? 1
                Picker("", selection: Binding(get: { lv.contains(cur) ? cur : lv[0] }, set: { l in store.update { $0.courses[c.id, default: CourseState()].levels = [l] } })) {
                    ForEach(Array(lv.enumerated()), id: \.offset) { k, l in Text(k == 0 ? store.t("obStarting") : store.t("obDone", c.levelName(l - 1))).tag(l) }
                }.pickerStyle(.segmented)
                if c.id == "zh" {
                    Divider()
                    Toggle(isOn: Binding(get: { store.pyFirst }, set: { v in store.update { $0.courses["zh", default: CourseState()].pinyinFirst = v } })) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.t("pinyinFirst")).font(.subheadline.weight(.bold))
                            Text(store.t("obPfSub")).font(.caption).foregroundStyle(Color.ink2)
                        }
                    }.tint(.accent)
                }
            }
            .padding(14).background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.ink, lineWidth: 2))
        } else {
            Button { store.switchCourse(c.id) } label: {
                head.padding(14).background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
            }.buttonStyle(.plain)
        }
    }

    // MARK: Step 2 · ears and voice

    var ready: some View {
        let voices = store.speaker.courseVoices(), v = store.speaker.currentVoice
        let quality = v.map(VoiceScreen.quality)
        let n = store.state.settings.newPerDay
        return VStack(spacing: 0) {
            Page {
                HStack {
                    Button { step = 1 } label: { Image(systemName: "chevron.left").font(.headline).frame(width: 44, height: 44) }
                        .buttonStyle(.plain).foregroundStyle(Color.ink).accessibilityLabel(store.t("back"))
                    Spacer()
                    Text(store.t("obStep", 2, 2)).font(.caption).foregroundStyle(Color.ink2)
                }
                Text(store.t("obReady")).font(.largeTitle.weight(.heavy)).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                card {
                    label("speaker.wave.2", store.t("obVoice", store.t("langName")),
                          voices.isEmpty ? store.t("noVoiceTitle", store.t("langName")) : quality == "Default" ? store.t("obVoiceDefault") : store.t("obVoiceGood", quality ?? ""))
                    HStack(spacing: 8) {
                        Button(store.t("testVoice")) { store.speaker.say(store.course.testPhrase) }.buttonStyle(.secondary).disabled(voices.isEmpty)
                        NavigationLink { VoiceScreen() } label: { Text(store.t("obHow")) }.buttonStyle(.secondary)
                    }
                }
                card {
                    label("mic", store.t("obMic"), store.t("obMicSub"))
                    Text(store.t("obMicText")).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                    Button(micOn ? "✓ " + store.t("obMicOn") : store.t("obAllowMic")) {
                        Task { micOn = await store.mic.authorize(); if !micOn { store.toast(store.t("micBlocked")) } }
                    }.buttonStyle(.primary).disabled(micOn)
                }
                card {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.t("dailyPlan")).font(.headline)
                            Text(store.t("obPlan", n, n * 2)).font(.caption).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        Button(store.t("change")) {
                            let opts = [3, 5, 8, 10]
                            store.update { $0.settings.newPerDay = opts[((opts.firstIndex(of: n) ?? 0) + 1) % opts.count] }
                        }.font(.subheadline.weight(.semibold)).padding(.horizontal, 12).padding(.vertical, 8)
                            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.line))
                    }
                }
            }
            VStack(spacing: 8) {
                Button(store.t("obStart") + (Self.go[store.course.id].map { " · " + $0 } ?? "")) { finish() }.buttonStyle(.primary)
                    .accessibilityIdentifier("ob-start")
                Button(store.t("obLater")) { finish() }.buttonStyle(.secondary)
            }.padding(16)
        }
        .onAppear { micOn = AVAudioApplication.shared.recordPermission == .granted }
    }

    func card<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 10) { content() }
            .padding(14).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
    }
    func label(_ icon: String, _ title: String, _ sub: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.title3).foregroundStyle(Color.ink).frame(width: 26)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline)
                Text(sub).font(.caption).foregroundStyle(Color.ink2)
            }
        }
    }
}
