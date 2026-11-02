import SwiftUI
import LanguageCore

/* Empty and error states (round 2 of the style canvas): no voice for the course, the microphone turned off,
 * the sync server out of reach. Each says what still works and offers the one thing that helps. */

/// A dashed card in the language's accent: a title, what still works, and actions
struct StateCard<Actions: View>: View {
    let title: String
    let text: String
    var note: String?
    @ViewBuilder var actions: () -> Actions
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.headline).foregroundStyle(Color.ink)
            Text(text).font(.subheadline).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
            actions()
            if let note { Text(note).font(.caption).foregroundStyle(Color.ink2) }
        }
        .padding(16).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
        .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.accent, style: StrokeStyle(lineWidth: 1.5, dash: [5, 4])))
    }
}

func openAppSettings() { if let u = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(u) } }

/// No voice for the course on this iPhone: learning goes on with the reading, listening waits for a voice
struct NoVoiceCard: View {
    @Environment(Store.self) var store
    var body: some View {
        if store.noVoice {
            StateCard(title: store.t("noVoiceTitle", store.t("langName")), text: store.t("noVoiceText"), note: store.t("listenHidden")) {
                NavigationLink { VoiceScreen() } label: { Text(store.t("getVoice")) }.buttonStyle(.primary)
            }
        }
    }
}

/// The microphone is off for this app: open Settings, or say it aloud after the model and rate yourself
struct MicDeniedCard: View {
    @Environment(Store.self) var store
    let target: String
    let done: (Spoken) -> Void
    @State private var rating = false
    var body: some View {
        StateCard(title: store.t("micOffTitle"), text: rating ? store.t("rateSelfAloud") : store.t("micOffText")) {
            if rating {
                HStack(spacing: 8) {
                    ForEach([(store.t("notYet"), 0.0), (store.t("closeEnough"), 0.6), (store.t("gotIt"), 1.0)], id: \.1) { label, score in
                        Button(label) { done(Spoken(heard: .init(score: score, hit: [], text: ""), tones: nil, wav: Data(), ms: 0)); rating = false }
                            .buttonStyle(.secondary)
                    }
                }
            } else {
                HStack(spacing: 8) {
                    Button(store.t("openSettings")) { openAppSettings() }.buttonStyle(.secondary)
                    Button(store.t("rateMyself")) { store.speaker.say(target); rating = true }.buttonStyle(.primary)
                }
            }
        }
    }
}

/// Learn's last line: when synced, the state; when the server can't be reached, a card with Try again and the code
struct SyncLine: View {
    @Environment(Store.self) var store
    @State private var busy = false
    var body: some View {
        if store.device.code != nil || Launch.has("-syncoffline") {
            let offline = store.syncState == .offline || store.syncState == .error || Launch.has("-syncoffline")
            if offline {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 10) {
                        Image(systemName: "icloud.slash").font(.title3).foregroundStyle(Color.ink2)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.t("cantReach")).font(.subheadline.weight(.bold))
                            Text(lastSync).font(.caption).foregroundStyle(Color.ink2)
                        }
                    }
                    Text(store.t("savedHereSync")).font(.footnote).foregroundStyle(Color.ink2).fixedSize(horizontal: false, vertical: true)
                    HStack(spacing: 8) {
                        Button(store.t("tryAgain")) { busy = true; Task { await store.syncNow(); busy = false } }.buttonStyle(.secondary).disabled(busy)
                        NavigationLink { SyncView() } label: { Text(store.t("syncCode")) }.buttonStyle(.secondary)
                    }
                }
                .padding(14).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
                .padding(.top, 14)
            } else {
                HStack(spacing: 6) {
                    Circle().fill(store.syncState == .off ? Color.ink3 : Color.tone(3)).frame(width: 8, height: 8)
                    Text(store.syncStatusText).font(.caption).foregroundStyle(Color.ink2)
                }.padding(.top, 14)
            }
        }
    }
    var lastSync: String {
        let word = store.syncState == .error ? store.t("syncFailed") : store.t("offlineWord")
        guard store.device.last > 0 else { return word }
        let m = Int(((nowMs() - store.device.last) / 60000).rounded())
        return word + " · " + store.t("syncLast", m < 1 ? store.t("justNow") : m < 60 ? store.t("minAgo", m) : store.t("hAgo", Int((Double(m) / 60).rounded())))
    }
}
