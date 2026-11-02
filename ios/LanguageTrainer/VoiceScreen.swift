import SwiftUI
import AVFoundation
import LanguageCore

/* Me → Voice (design round 3): what most people need on one page — which voice (with its quality), the way to
 * a more natural one, speed and a test sentence. The equaliser, natural sound and two voices wait one level
 * deeper under Advanced sound. Robotic novelty voices and other regions wait behind "Show all". Apps can't
 * download voices themselves, so the guide leads to Settings. */

struct VoiceScreen: View {
    @Environment(Store.self) var store
    @State private var showAll = false

    var body: some View {
        let _ = store.voiceCheck // re-reads the voices when you come back from Settings
        let all = store.speaker.courseVoices(), lang = store.course.tts
        let good = all.filter { $0.language == lang && Speaker.rank($0) > 0 }
        let voices = showAll || good.isEmpty ? all : good
        let chosen = store.state.settings.voices?[store.course.id] ?? "", inUse = store.speaker.currentVoice?.identifier
        Page {
            if all.isEmpty {
                StateCard(title: store.t("noVoiceTitle", store.t("langName")), text: store.t("noVoiceText")) { EmptyView() }
            } else {
                SectionTitle(text: store.t("whichVoice"))
                VStack(spacing: 0) {
                    row(store.t("voiceAuto"), sub: chosen.isEmpty ? store.speaker.currentVoice?.name : nil, id: "", on: chosen.isEmpty, quality: nil)
                    ForEach(voices, id: \.identifier) { v in
                        Divider()
                        row(v.name, sub: note(v, inUse: v.identifier == inUse), id: v.identifier, on: v.identifier == chosen, quality: Self.quality(v))
                    }
                    Divider()
                    NavigationLink { VoiceGuide() } label: {
                        HStack {
                            Text(store.t("moreNatural")).font(.subheadline.weight(.semibold)).foregroundStyle(Color.accent)
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption.weight(.bold)).foregroundStyle(Color.ink2)
                        }.padding(14).contentShape(Rectangle())
                    }.buttonStyle(.card)
                }
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
                if !showAll && voices.count < all.count {
                    Button(store.t("showAllVoices", all.count)) { showAll = true }.font(.subheadline.weight(.semibold)).foregroundStyle(Color.accent)
                }
            }

            SectionTitle(text: store.t("speed"))
            HStack(spacing: 0) {
                ForEach([(0.6, "speedSlow"), (0.8, "speedLearner"), (1.0, "speedNative")], id: \.0) { r, key in
                    let on = abs(store.state.settings.rate - r) < 0.04
                    Button {
                        store.update { $0.settings.rate = r }
                        store.speaker.say(store.course.testPhrase, rate: r)
                    } label: {
                        Text("\(store.t(key)) \(r == 1 ? "1" : String(format: "%g", r))×").font(.subheadline.weight(on ? .bold : .regular))
                            .frame(maxWidth: .infinity, minHeight: 40).background(on ? Color.ink : Color.elevated).foregroundStyle(on ? Color.paper : Color.ink)
                    }.buttonStyle(.card).accessibilityAddTraits(on ? .isSelected : [])
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.line))

            if !all.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text(store.course.id == "de" ? "„\(store.course.testPhrase)“" : store.course.script == .cjk ? store.course.testPhrase : "“\(store.course.testPhrase)”").hanziFont(20, .medium)
                    Button(store.t("testVoice")) { store.speaker.say(store.course.testPhrase) }.buttonStyle(.primary)
                }
                .padding(14).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.sunken, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .padding(.top, 10)

                NavigationLink { AdvancedSound() } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.t("advancedSound")).font(.body.weight(.semibold)).foregroundStyle(Color.ink)
                            Text(store.t("advancedSoundSub")).font(.caption).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        Image(systemName: "chevron.right").font(.caption.weight(.bold)).foregroundStyle(Color.ink2)
                    }
                    .padding(14)
                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
                }
                .buttonStyle(.card).padding(.top, 10).accessibilityIdentifier("advanced-sound")
            }
        }
        .navigationTitle(store.t("voice")).navigationBarTitleDisplayMode(.inline)
    }

    /// In use · natural, Installed, or Robotic when slowed (the default voices tremble at learner speed)
    func note(_ v: AVSpeechSynthesisVoice, inUse: Bool) -> String {
        let robotic = v.quality == .default
        if inUse { return robotic ? store.t("voiceInUse") : store.t("voiceInUseNatural") }
        return robotic ? store.t("voiceRobotic") : store.t("voiceInstalled")
    }

    static func quality(_ v: AVSpeechSynthesisVoice) -> String {
        v.quality == .premium ? "Premium" : v.quality == .enhanced ? "Enhanced" : "Default"
    }

    func row(_ name: String, sub: String?, id: String, on: Bool, quality: String?) -> some View {
        Button {
            store.update { var m = $0.settings.voices ?? [:]; m[$0.course] = id.isEmpty ? nil : id; $0.settings.voices = m }
            store.speaker.say(store.course.testPhrase)
        } label: {
            HStack(spacing: 12) {
                Circle().strokeBorder(on ? Color.ink : Color.ink2, lineWidth: 1.5)
                    .background(Circle().fill(on ? Color.ink : Color.clear).padding(3)).frame(width: 16, height: 16)
                VStack(alignment: .leading, spacing: 2) {
                    Text(name).font(.body.weight(.semibold)).foregroundStyle(Color.ink)
                    if let sub { Text(sub).font(.caption).foregroundStyle(Color.ink2) }
                }
                Spacer()
                if let quality {
                    Text(quality).font(.caption2.weight(.bold)).padding(.horizontal, 6).padding(.vertical, 2)
                        .foregroundStyle(quality == "Premium" ? Color.tone(3) : quality == "Enhanced" ? Color.tone(2) : Color.ink2)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(quality == "Premium" ? Color.tone(3) : quality == "Enhanced" ? Color.tone(2) : Color.ink2))
                }
            }.padding(14).contentShape(Rectangle())
        }
        .buttonStyle(.card).accessibilityAddTraits(on ? .isSelected : [])
    }
}

/// Voice → Advanced sound (iPhone only): natural sound, the equaliser of the voice in use, two voices in dialogues.
/// The equaliser is saved on this device for each voice.
struct AdvancedSound: View {
    @Environment(Store.self) var store
    @State private var natural = true
    @State private var tune = VoiceTune.standard
    @State private var tuneVoice: String?

    var body: some View {
        let voice = store.speaker.currentVoice
        Page {
            card {
                Toggle(isOn: Binding(get: { natural }, set: { natural = $0; store.speaker.natural = $0; test() })) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(store.t("eqNatural")).font(.body.weight(.semibold))
                        Text(store.t("naturalSoundSub")).font(.caption).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                    }
                }.tint(.accent)
            }
            if natural {
                card {
                    HStack {
                        Text(store.t("eqFor", voice?.name ?? "–")).font(.body.weight(.semibold))
                        Spacer()
                        Button(store.t("eqReset")) { tune = .standard; saveTune(); test() }.font(.subheadline.weight(.semibold)).foregroundStyle(Color.accent)
                    }
                    slider("eqWarmth", \.bass, -6...6, unit: "dB")
                    slider("eqClarityMid", \.clarity, -6...6, unit: "dB")
                    slider("eqSharp", \.bright, -6...6, unit: "dB")
                    slider("eqVoicePitch", \.pitch, -300...300, unit: "ct")
                    HStack {
                        Text(store.t("eqThisVoice")).font(.caption).foregroundStyle(Color.ink2)
                        Spacer()
                        Button(store.t("testVoice")) { test() }.buttonStyle(.bordered).tint(.ink)
                    }
                }
            }
            twoVoices
        }
        .navigationTitle(store.t("advancedSound")).navigationBarTitleDisplayMode(.inline)
        .onAppear { natural = store.speaker.natural; loadTune() }
        .onChange(of: store.speaker.currentVoice?.identifier) { _, _ in loadTune() }
    }

    func card<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 10) { content() }
            .padding(14)
            .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
    }
    func slider(_ key: String, _ path: WritableKeyPath<VoiceTune, Double>, _ range: ClosedRange<Double>, unit: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(store.t(key)).font(.subheadline)
                Spacer()
                Text(String(format: unit == "ct" ? "%+.0f ct" : "%+.1f dB", tune[keyPath: path])).font(.caption.monospacedDigit()).foregroundStyle(Color.ink2)
            }
            Slider(value: Binding(get: { tune[keyPath: path] }, set: { tune[keyPath: path] = $0 }), in: range, step: unit == "ct" ? 25 : 0.5) { editing in
                if !editing { saveTune(); test() }
            }.tint(.accent).accessibilityLabel(store.t(key))
        }
    }
    func loadTune() { tuneVoice = store.speaker.currentVoice?.identifier; tune = store.speaker.tune(tuneVoice) }
    func saveTune() { if let id = tuneVoice { store.speaker.setTune(tune == .standard ? nil : VoiceTune(bass: tune.bass, clarity: tune.clarity, bright: tune.bright, pitch: tune.pitch), for: id) } }
    func test() { store.speaker.say(store.course.testPhrase) }

    /// Dialogues: the second person's voice (another voice of the language, or the same one lower)
    var twoVoices: some View {
        let on = store.state.settings.twoVoices != false, second = store.speaker.secondVoice
        return card {
            Toggle(isOn: Binding(get: { on }, set: { v in store.update { $0.settings.twoVoices = v ? nil : false }; if v { store.speaker.say(store.course.testPhrase, who: 1) } })) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(store.t("twoVoices")).font(.body.weight(.semibold))
                    Text(store.t("twoVoicesSub")).font(.caption).foregroundStyle(Color.ink2)
                }
            }.tint(.accent)
            if on {
                Button { store.speaker.say(store.course.testPhrase, who: 1) } label: {
                    HStack {
                        Text(store.t("secondVoice", second?.name ?? store.t("secondVoiceLower"))).font(.subheadline).foregroundStyle(Color.ink)
                        Spacer()
                        Image(systemName: "speaker.wave.2.fill").foregroundStyle(Color.ink2)
                    }.frame(minHeight: 36)
                }.buttonStyle(.card).accessibilityLabel(store.t("hearVoice", second?.name ?? store.t("secondVoiceLower")))
                if second == nil { Text(store.t("twoVoicesPitch")).font(.caption).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true) }
            }
        }
    }
}
