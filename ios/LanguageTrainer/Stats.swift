import SwiftUI
import LanguageCore

/* All statistics (round 2 of the style canvas): streak · known · accuracy, the last 12 weeks in the
 * language's colour, progress by level, tones when speaking (from the pitch check), accuracy by skill
 * and the daily goal. The counts of the other synced devices are included. */

struct StatsView: View {
    @Environment(Store.self) var store
    @State private var confirmReset = false

    var body: some View {
        let all = store.words.all.filter { !$0.id.hasPrefix("u") }
        let known = all.filter { store.status($0.id) == .known }.count
        let answered = store.state.answeredTotal, acc = answered > 0 ? Int((Double(store.state.correctTotal) / Double(answered) * 100).rounded()) : 0
        Page {
            HStack(spacing: 0) {
                cell("\(store.state.streak())", store.t("dayStreak"), hot: true)
                cell("\(known)", store.t("ofKnown", all.count))
                cell("\(acc)%", store.t("accuracyLower"))
            }
            .overlay(Rectangle().stroke(Color.line))
            section(store.t("last12"), trailing: store.t("daysStudied", studied)) {
                Heatmap12()
                legend
            }
            section(store.t("byLevel")) {
                ForEach(store.course.levels, id: \.self) { l in levelRow(l, all.filter { $0.lvl == l }) }
                HStack(spacing: 6) {
                    swatch(Color.accent); Text(store.t("known"))
                    swatch(Color.accent.opacity(0.4)); Text(store.t("learning"))
                    swatch(Color.sunken); Text(store.t("new"))
                }.font(.caption2).foregroundStyle(Color.ink2)
            }
            if store.course.id == "zh" { tones }
            section(store.t("bySkill")) {
                HStack(spacing: 0) {
                    ForEach(["listen", "speak", "read", "write"], id: \.self) { k in
                        let p = store.state.pairSum(\.skill, k)
                        cell(p.total > 0 ? "\(Int((Double(p.right) / Double(p.total) * 100).rounded()))%" : "–", store.t("skill_" + k))
                    }
                }.overlay(Rectangle().stroke(Color.line))
            }
            section(store.t("dailyGoal")) {
                Picker(store.t("dailyGoal"), selection: Binding(get: { store.state.settings.dailyGoal }, set: { g in store.update { $0.settings.dailyGoal = g } })) {
                    ForEach([10, 20, 30, 50], id: \.self) { Text("\($0)").tag($0) }
                }.pickerStyle(.segmented)
            }
            Button(store.t("resetAll"), role: .destructive) { confirmReset = true }.buttonStyle(SecondaryButtonStyle(tint: .bad)).padding(.top, 16)
        }
        .navigationTitle(store.t("statsTitle", store.t("langName"))).navigationBarTitleDisplayMode(.inline)
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

    /// Days with any practice in the last 12 weeks
    var studied: Int {
        (0..<84).filter { k in store.state.dayCount(todayKey(Calendar.current.date(byAdding: .day, value: -k, to: Date())!.timeIntervalSince1970 * 1000)) > 0 }.count
    }

    @ViewBuilder var tones: some View {
        let ex = ["mā", "má", "mǎ", "mà"]
        let rows = (1...4).map { n -> (Int, Int?) in let p = store.state.pairSum(\.tones, String(n)); return (n, p.total > 0 ? Int((Double(p.right) / Double(p.total) * 100).rounded()) : nil) }
        section(store.t("tonesSpeaking")) {
            if rows.allSatisfy({ $0.1 == nil }) {
                Text(store.t("tonesEmpty")).font(.footnote).foregroundStyle(Color.ink2)
            } else {
                ForEach(rows, id: \.0) { n, pct in
                    HStack(spacing: 10) {
                        Text(ex[n - 1]).font(.title3.weight(.bold)).foregroundStyle(Color.tone(n)).frame(width: 40, alignment: .leading)
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                Capsule().fill(Color.sunken)
                                Capsule().fill(Color.tone(n)).frame(width: g.size.width * CGFloat(pct ?? 0) / 100)
                            }
                        }.frame(height: 10)
                        Text(pct.map { "\($0)%" } ?? "–").font(.footnote.weight(.semibold).monospacedDigit()).frame(width: 44, alignment: .trailing)
                    }
                    .accessibilityElement(children: .combine)
                }
                let counted = (1...4).map { n in (n, store.state.pairSum(\.tones, String(n))) }.filter { $0.1.total >= 3 }
                if let weak = counted.min(by: { Double($0.1.right) / Double($0.1.total) < Double($1.1.right) / Double($1.1.total) }),
                   Double(weak.1.right) / Double(weak.1.total) < 0.8 {
                    Text(store.t("weakestTone", store.t("toneShort\(weak.0)").components(separatedBy: " · ")[0]))
                        .font(.footnote).foregroundStyle(Color.ink2).padding(10).frame(maxWidth: .infinity, alignment: .leading)
                        .overlay(RoundedRectangle(cornerRadius: Look.current.radius).stroke(Color.accent.opacity(0.5), style: StrokeStyle(lineWidth: 1, dash: [5, 4])))
                }
            }
        }
    }

    var legend: some View {
        HStack(spacing: 4) {
            Text(store.t("less"))
            ForEach([0.0, 0.3, 0.62, 1.0], id: \.self) { o in swatch(o == 0 ? Color.sunken : Color.accent.opacity(o)) }
            Text(store.t("more"))
        }.font(.caption2).foregroundStyle(Color.ink2)
    }
    func swatch(_ c: Color) -> some View { RoundedRectangle(cornerRadius: 2).fill(c).frame(width: 11, height: 11) }

    func levelRow(_ l: Int, _ ws: [Word]) -> some View {
        let k = ws.filter { store.status($0.id) == .known }.count, lr = ws.filter { store.status($0.id) == .learning }.count, n = max(ws.count, 1)
        return VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(store.course.levelName(l)).font(.subheadline.weight(.bold))
                Spacer()
                Text(k + lr > 0 ? store.t("lvMeta", k, lr, ws.count) : store.t("lvNotStarted", ws.count)).font(.caption).foregroundStyle(Color.ink2)
            }
            GeometryReader { g in
                HStack(spacing: 0) {
                    Rectangle().fill(Color.accent).frame(width: g.size.width * CGFloat(k) / CGFloat(n))
                    Rectangle().fill(Color.accent.opacity(0.4)).frame(width: g.size.width * CGFloat(lr) / CGFloat(n))
                    Spacer(minLength: 0)
                }.background(Color.sunken).clipShape(Capsule())
            }.frame(height: 8)
        }
        .accessibilityElement(children: .combine)
    }

    func cell(_ big: String, _ small: String, hot: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(big).font(.title2.weight(.bold)).foregroundStyle(hot ? Color.accent : Color.ink)
            Text(small).font(.caption).foregroundStyle(Color.ink2).lineLimit(2).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(12)
        .overlay(alignment: .trailing) { Rectangle().fill(Color.line).frame(width: 1) }
    }

    func section<C: View>(_ title: String, trailing: String? = nil, @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title.uppercased()).font(.caption.weight(.bold)).tracking(1.2).foregroundStyle(Color.ink2)
                Spacer()
                if let trailing { Text(trailing).font(.caption).foregroundStyle(Color.ink2) }
            }
            .padding(.top, 10).overlay(alignment: .top) { Rectangle().fill(Color.ink).frame(height: 2) }
            content()
        }.padding(.top, 14)
    }
}

/// The last 12 weeks, one column per week (Monday on top), in the language's colour
struct Heatmap12: View {
    @Environment(Store.self) var store
    var body: some View {
        let cal = Calendar(identifier: .iso8601), today = cal.startOfDay(for: Date())
        let weekday = (cal.component(.weekday, from: today) + 5) % 7 // Monday = 0
        let start = cal.date(byAdding: .day, value: -(11 * 7 + weekday), to: today)!
        // Cells sized from the width, so the twelve weeks always fit
        GeometryReader { g in
            let side = (g.size.width - 3 * 11) / 12
            HStack(spacing: 3) {
                ForEach(0..<12, id: \.self) { w in
                    VStack(spacing: 3) {
                        ForEach(0..<7, id: \.self) { d in
                            let day = cal.date(byAdding: .day, value: w * 7 + d, to: start)!
                            let n = day > today ? -1 : store.state.dayCount(todayKey(day.timeIntervalSince1970 * 1000))
                            RoundedRectangle(cornerRadius: 2)
                                .fill(n < 0 ? Color.clear : n == 0 ? Color.sunken : Color.accent.opacity(n < 10 ? 0.3 : n < 25 ? 0.62 : 1))
                                .frame(width: side, height: side)
                        }
                    }
                }
            }
        }
        .aspectRatio(12.0 / 7.0, contentMode: .fit)
        .accessibilityElement().accessibilityLabel(store.t("heatAria"))
    }
}
