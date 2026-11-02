import SwiftUI
import AVFoundation
import LanguageCore

/* Settings, sync, tone guide, pronunciation tips and about (statistics: Stats.swift). */

struct CoursePicker: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    var body: some View {
        ScrollView { VStack(spacing: 12) {
            Text(store.t("switchCourse")).font(.title3.weight(.bold))
            Text(store.t("courseHint")).font(.footnote).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
            ForEach(Course.all) { c in
                let ws = Library.shared.words[c.id] ?? [], known = ws.filter { store.status($0.id) == .known }.count
                Button { store.switchCourse(c.id); dismiss() } label: {
                    HStack(spacing: 14) {
                        Text(c.glyph).font(.title2.weight(.bold)).frame(width: 46, height: 46).background(Color.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 12)).foregroundStyle(Color.accent)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(c.name).font(.headline)
                            Text("\(ws.count) \(store.t("words").lowercased()) · \(c.allLabel) · \(store.t("knownOf", known, ws.count))").font(.caption).foregroundStyle(Color.ink2)
                        }
                        Spacer()
                        if c.id == store.course.id { Image(systemName: "checkmark").foregroundStyle(Color.accent) }
                    }
                    .padding(12).background(Color.elevated, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(c.id == store.course.id ? Color.accent : Color.clear, lineWidth: 1.5))
                    .foregroundStyle(Color.ink)
                }.buttonStyle(.plain)
            }
        }.padding(20) }.scrollIndicators(.hidden).background(Color.paper)
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

/// How to download a natural voice. Apps can't download voices or open that page of Settings,
/// so this shows the way there and checks again when you come back.
struct VoiceGuide: View {
    @Environment(Store.self) var store
    @Environment(\.dismiss) var dismiss
    var body: some View {
        let _ = store.voiceCheck
        let level = store.speaker.level(), voice = store.speaker.currentVoice
        Page {
            CardBox(padding: 18) {
                Group {
                    switch level {
                    case .natural: Text(store.t("voiceGood")).foregroundStyle(Color.good)
                    case .none: Text(store.t("voiceNone")).foregroundStyle(Color.bad)
                    default: Text(store.t("voiceGuideBanner", store.t("langName"))).foregroundStyle(Color.ink2)
                    }
                }.font(.subheadline)
                if let voice { Text(store.t("voiceNow", voice.name)).font(.footnote).foregroundStyle(Color.ink3) }
                Button { store.speaker.say(store.course.testPhrase) } label: { Label(store.t("ttsTest"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.secondary)
            }
            Text(store.t("voiceGuideWhy")).font(.subheadline).padding(.top, 6)
            ForEach(Array([
                store.t("voiceStep1"), store.t("voiceStep2"),
                store.t("voiceStep3", store.t("langName"), Speaker.suggested[store.course.id] ?? ""), store.t("voiceStep4")
            ].enumerated()), id: \.offset) { k, step in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(k + 1)").font(.subheadline.weight(.bold)).frame(width: 28, height: 28)
                        .background(Color.accent.opacity(0.12), in: Circle()).foregroundStyle(Color.accent)
                    Text(step).frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            Button {
                if let u = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(u) }
            } label: { Label(store.t("openSettings"), systemImage: "gear") }.buttonStyle(.primary).padding(.top, 6)
        }
        .navigationTitle(store.t("voiceGuideTitle")).navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .confirmationAction) { Button(store.t("done")) { dismiss() } } }
    }
}
