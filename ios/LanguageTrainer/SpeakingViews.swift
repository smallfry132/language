import SwiftUI
import LanguageCore

/* The microphone button and the feedback under a spoken word or line. */

struct MicButton: View {
    @Environment(Store.self) var store
    @Environment(\.accessibilityReduceMotion) var reduceMotion
    let key: String
    let target: String
    let py: String
    var pitch = false
    /// The large round button of the chat composer
    var big = false
    let done: (Spoken) -> Void
    @State private var denied = Launch.has("-micdenied") // for screenshots

    var body: some View {
        let live = store.mic.isListening(key)
        VStack(spacing: 6) {
            Button {
                store.speaker.stop()
                store.mic.listen(key: key, target: target, py: py, course: store.course, pitch: pitch && store.course.id == "zh", f0base: store.state.settings.f0base) { r in
                    guard let r else { denied = true; return }
                    if let tones = r.tones, !tones.none { store.update { $0.settings.f0base = tones.f0base; $0.recordTones(tones) } }
                    done(r)
                }
            } label: {
                if big {
                    Image(systemName: live ? "waveform" : "mic.fill").font(.system(size: 28, weight: .semibold))
                        .symbolEffect(.variableColor.iterative, isActive: live && !reduceMotion)
                        .frame(width: 76, height: 76).background(live ? Color.action : Color.accent, in: Circle())
                        .foregroundStyle(live ? Color.onAction : Color.white)
                        .padding(6).background(Color.accent.opacity(0.15), in: Circle())
                } else {
                HStack(spacing: 8) {
                    Image(systemName: live ? "waveform" : "mic.fill")
                        .symbolEffect(.variableColor.iterative, isActive: live && !reduceMotion)
                    Text(live ? store.t("listening") : store.t("speakBtn"))
                }
                .font(.headline)
                .padding(.horizontal, 18).padding(.vertical, 12)
                .background(live ? Color.action : Color.accent.opacity(0.12), in: Capsule())
                .foregroundStyle(live ? Color.onAction : Color.accent)
                }
            }
            .buttonStyle(.card)
            .accessibilityLabel(store.t("speakBtn"))
            // The microphone is off for this app: what to do instead, in a sheet so it gets the full width
            .sheet(isPresented: $denied) {
                MicDeniedCard(target: target) { r in denied = false; done(r) }
                    .padding(16).presentationDetents([.height(320)]).presentationBackground(Color.paper)
            }

        }
    }
}

/// Korean: which final consonant was missing or extra; Japanese: hold the long vowels (from the recognised text)
struct HeardHintText: View {
    @Environment(Store.self) var store
    let hz: String
    let heard: String
    var body: some View {
        let w = store.course.id == "ja" ? store.words.all.first { $0.hz == hz } : nil
        switch Lingo.heardHint(target: hz, kana: w?.kana, heard: heard, course: store.course.id) {
        case .koFinalMissing(let h, let f): Text(store.t("koFinalMissing", h, f)).font(.footnote.weight(.medium))
        case .koFinalExtra(let h, let f): Text(store.t("koFinalExtra", h, f)).font(.footnote.weight(.medium))
        case .jaHold: Text(store.t("jaHold", w?.romaji ?? w?.py ?? hz)).font(.footnote.weight(.medium))
        case nil: EmptyView()
        }
    }
}

/// Feedback for one spoken attempt: the tone curve, which syllables came through, and playback
struct SpokenResult: View {
    @Environment(Store.self) var store
    let hz: String
    let py: String
    let spoken: Spoken
    @State private var selfRated: Double?
    /// Without a recogniser you rate yourself: 0 not yet, 0.6 close, 1 got it
    var onSelfRate: ((Double) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let tones = spoken.tones { PitchChart(result: tones) }
            if let h = spoken.heard {
                let msg = h.score >= 0.8 ? store.t("heardGreat") : h.score >= 0.4 ? store.t("heardAlmost") : store.t("heardNo")
                if spoken.tones == nil || !h.text.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        if spoken.tones == nil {
                            (Text(msg + " ") + Text("\(Int((h.score * 100).rounded()))%").bold()).foregroundStyle(h.score >= 0.8 ? Color.good : Color.bad)
                            if store.course.id == "zh" {
                                let n = Lingo.pyParts(py).filter { !$0.sep }.count
                                if n == h.hit.count && n > 0 { Text(PinyinText.attributed(py, missed: h.hit.map { !$0 })).font(.title3) }
                            }
                        }
                        if !h.text.isEmpty { Text(store.t("heardAs", h.text)).font(.footnote).foregroundStyle(Color.ink3) }
                        if h.score < 1, !h.text.isEmpty { HeardHintText(hz: hz, heard: h.text) }
                    }
                }
            } else if spoken.tones == nil {
                // No recogniser: listen to yourself next to the model and rate it
                Text(store.t("rateSelfQ")).font(.subheadline).foregroundStyle(Color.ink2)
                HStack(spacing: 8) {
                    ForEach([(0.0, "notYet"), (0.6, "closeEnough"), (1.0, "gotIt")], id: \.0) { v, k in
                        Button(store.t(k)) { selfRated = v; onSelfRate?(v) }
                            .buttonStyle(SecondaryButtonStyle(tint: selfRated == v ? .accent : .ink))
                            .overlay { if selfRated == v { RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2).stroke(Color.accent, lineWidth: 2) } }
                    }
                }
            }
            HStack(spacing: 10) {
                Button { store.speaker.play(spoken.wav) } label: { Label(store.t("playMine"), systemImage: "play.fill") }.buttonStyle(.bordered)
                Button { store.speaker.say(hz) } label: { Label(store.t("playModel"), systemImage: "speaker.wave.2.fill") }.buttonStyle(.bordered)
            }.font(.subheadline).tint(.ink)
        }
        .onAppear { if spoken.heard == nil && spoken.tones == nil { store.speaker.play(spoken.wav) } }
    }
}

/// The model's tone shape (solid, in the tone colour) and your pitch (dashed), one column per syllable
struct PitchChart: View {
    @Environment(Store.self) var store
    let result: Pitch.Result

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if result.none {
                Text(store.t("noVoice")).foregroundStyle(Color.bad)
            } else {
                Canvas { ctx, size in draw(ctx, size) }
                    .frame(height: 140)
                    .frame(maxWidth: CGFloat(result.syllables.count) * 150)
                    .accessibilityLabel(store.t("pitchHint"))
                if result.score == 1 {
                    Text(store.t("toneAllGood")).foregroundStyle(Color.good)
                } else {
                    ForEach(Array(result.syllables.enumerated()), id: \.offset) { _, s in
                        if s.ok == false, let got = s.got, let tip = s.tip {
                            (Text(s.text).bold().foregroundColor(Color.tone(s.want)) + Text(": \(store.t("toneLike", got)). \(store.t(tip))."))
                                .font(.subheadline)
                        }
                    }
                }
                if result.sandhi { Text(store.t("sandhiNote")).font(.footnote).foregroundStyle(Color.ink2) }
                Text(store.t("pitchHint")).font(.footnote).foregroundStyle(Color.ink3)
            }
        }
    }

    private func draw(_ ctx: GraphicsContext, _ size: CGSize) {
        let n = result.syllables.count, cw = size.width / CGFloat(max(n, 1))
        let top: CGFloat = 8, bottom: CGFloat = 30
        func y(_ lv: Double) -> CGFloat { top + CGFloat((5.5 - lv) / 5) * (size.height - top - bottom) }
        for lv in 1...5 {
            var p = Path(); p.move(to: CGPoint(x: 0, y: y(Double(lv)))); p.addLine(to: CGPoint(x: size.width, y: y(Double(lv))))
            ctx.stroke(p, with: .color(.ink.opacity(0.07)), lineWidth: 1)
        }
        for (i, s) in result.syllables.enumerated() {
            let x0 = CGFloat(i) * cw + 14, x1 = CGFloat(i + 1) * cw - 14
            func x(_ j: Int, _ len: Int) -> CGFloat { x0 + (len > 1 ? CGFloat(j) / CGFloat(len - 1) * (x1 - x0) : (x1 - x0) / 2) }
            if i > 0 {
                var sep = Path(); sep.move(to: CGPoint(x: CGFloat(i) * cw, y: top)); sep.addLine(to: CGPoint(x: CGFloat(i) * cw, y: size.height - bottom + 4))
                ctx.stroke(sep, with: .color(.ink.opacity(0.1)), lineWidth: 1)
            }
            if let shape = s.shape {
                var p = Path()
                for (j, v) in shape.enumerated() { let pt = CGPoint(x: x(j, 5), y: y(v)); j == 0 ? p.move(to: pt) : p.addLine(to: pt) }
                ctx.stroke(p, with: .color(Color.tone(s.want)), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
            }
            if s.levels.count > 1 {
                var p = Path()
                for (j, v) in s.levels.enumerated() { let pt = CGPoint(x: x(j, s.levels.count), y: y(v)); j == 0 ? p.move(to: pt) : p.addLine(to: pt) }
                ctx.stroke(p, with: .color(.ink), style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round, dash: [6, 5]))
            } else if let v = s.levels.first {
                ctx.fill(Path(ellipseIn: CGRect(x: x(0, 1) - 3, y: y(v) - 3, width: 6, height: 6)), with: .color(.ink))
            }
            let mark = s.ok == nil ? "" : s.ok! ? " ✓" : " ✗"
            ctx.draw(Text(s.text + mark).font(.subheadline.weight(.semibold)).foregroundColor(Color.tone(s.want)),
                     at: CGPoint(x: (x0 + x1) / 2, y: size.height - 10))
        }
    }
}
