import SwiftUI
import AVFoundation
import LanguageCore

/* Me → Voice (round 2 of the style canvas): the course's voices on this iPhone with their quality, speed
 * presets, and the way to download a natural voice. Robotic novelty voices and other regions wait behind
 * "Show all". Apps can't download voices themselves, so the steps lead to Settings. */

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
                VStack(spacing: 0) {
                    row(store.t("voiceAuto"), sub: chosen.isEmpty ? store.speaker.currentVoice?.name : nil, id: "", on: chosen.isEmpty, quality: nil)
                    ForEach(voices, id: \.identifier) { v in
                        Divider()
                        row(v.name, sub: v.language + (v.identifier == inUse ? " · " + store.t("inUse") : ""), id: v.identifier, on: v.identifier == chosen, quality: Self.quality(v))
                    }
                }
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
                if !showAll && voices.count < all.count {
                    Button(store.t("showAllVoices", all.count)) { showAll = true }.font(.subheadline.weight(.semibold)).foregroundStyle(Color.accent)
                }
            }

            Text(store.t("speed").uppercased()).font(.caption.weight(.bold)).tracking(1.2).foregroundStyle(Color.ink2).padding(.top, 14)
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

            VStack(alignment: .leading, spacing: 12) {
                Text(store.t("naturalVoice")).font(.headline)
                Text(store.t("naturalVoiceText", store.t("langName"))).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                ForEach(Array(store.t.list("voiceStepsIos").enumerated()), id: \.offset) { k, step in
                    HStack(alignment: .top, spacing: 10) {
                        Text("\(k + 1)").font(.caption.weight(.bold)).frame(width: 24, height: 24)
                            .background(k == 0 ? Color.ink : Color.clear, in: RoundedRectangle(cornerRadius: 4))
                            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.ink, lineWidth: 1.5))
                            .foregroundStyle(k == 0 ? Color.paper : Color.ink)
                        Text(step.replacingOccurrences(of: "{0}", with: store.t("langName"))).font(.subheadline).frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                HStack(spacing: 8) {
                    Button(store.t("openSettings")) { openAppSettings() }.buttonStyle(.primary)
                    Button(store.t("testVoice")) { store.speaker.say(store.course.testPhrase) }.buttonStyle(.secondary)
                }
            }
            .padding(16).frame(maxWidth: .infinity, alignment: .leading)
            .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.ink, lineWidth: 1.5))
            .padding(.top, 14)
        }
        .navigationTitle(store.t("voice")).navigationBarTitleDisplayMode(.inline)
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
