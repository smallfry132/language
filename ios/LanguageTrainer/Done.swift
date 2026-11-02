import SwiftUI
import LanguageCore

/* The end of the day (design round 3). After a session: the mark of the course, four numbers in one row and the
 * words to watch. While today's goal is not reached you may learn 5 more; once it is, the app asks nothing more
 * of you: no new words are pushed, it only says when the next reviews are ready. */

/// The end of a session: the course's mark, four numbers, the words to watch and why, Practise these again
struct FlowDone: View {
    @Environment(Store.self) var store
    let results: [(FlowStep, SessionResult)]
    let again: ([Word]) -> Void
    /// Learn 5 more (today's session only, while the goal is not reached)
    var more: (() -> Void)?
    let close: () -> Void

    var body: some View {
        let course = store.course.id
        let by = { (k: String) in results.filter { $0.0.kind == k }.map(\.1) }
        let total = { (rs: [SessionResult]) in rs.reduce(0) { $0 + $1.total } }
        let correct = { (rs: [SessionResult]) in rs.reduce(0) { $0 + $1.correct } }
        let reviewed = total(by("review")) + total(by("meet")), fresh = total(by("meet"))
        let say = by("speak"), graded = results.filter { $0.0.kind != "meet" }.map(\.1)
        let pct = total(graded) > 0 ? Int((Double(correct(graded)) / Double(total(graded)) * 100).rounded()) : 100
        let sayPct = total(say) > 0 && (course == "zh" || course == "vi") ? Int((Double(correct(say)) / Double(total(say)) * 100).rounded()) : nil
        let mistakes = Array(results.flatMap { $0.1.mistakes }.reduce(into: [Word]()) { a, w in if !a.contains(where: { $0.id == w.id }) { a.append(w) } }.prefix(12))
        let why = results.reduce(into: [String: String]()) { a, r in a.merge(r.1.why) { x, _ in x } }
        let n = store.state.dayCount(todayKey()), goal = store.state.settings.dailyGoal, reached = n >= goal
        let unseen = store.words.planToday(store.state, extraNew: store.extraNew).unseen
        Page {
            VStack(spacing: 16) {
                DoneMark(course: course).padding(.top, 24)
                VStack(spacing: 4) {
                    if reached { DoneTitle(course: course) } else { Text(store.t("sessionDoneT")).font(.system(size: 30, weight: .bold)) }
                    Text(reached ? "\(store.t("sessionIsDone")) · \(n) / \(goal)" : store.t("goalToGo", n, goal, goal - n))
                        .font(.subheadline).foregroundStyle(Color.ink2).multilineTextAlignment(.center)
                }
                HStack(spacing: 0) {
                    cell("\(reviewed)", store.t("cardsReviewed"))
                    cell("+\(fresh)", store.t("newWordsLower"))
                    if let sayPct { cell("\(sayPct)%", store.t("tonesRight")) } else { cell("\(pct)%", store.t("rightAnswers")) }
                    cell("\(store.state.streak())", store.t("dayStreak"), hot: true, last: true)
                }
                .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
                .overlay(alignment: .bottom) { Rectangle().fill(Color.line).frame(height: 1) }
                if !mistakes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        CapsLabel(text: store.t("watchThese", mistakes.count))
                        WrapLayout(spacing: 8, lineSpacing: 8) {
                            ForEach(mistakes) { w in
                                Button { store.speaker.say(w.hz) } label: {
                                    HStack(spacing: 6) {
                                        word(w)
                                        Text(why[w.id] ?? store.tr(w)).font(.caption).foregroundStyle(Color.ink2)
                                    }
                                    .padding(.horizontal, 10).padding(.vertical, 6)
                                    .background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius))
                                    .overlay(RoundedRectangle(cornerRadius: Look.current.radius).stroke(Color.line))
                                }.buttonStyle(.card)
                            }
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
                HStack(spacing: 6) {
                    Circle().fill(Color.tone(3)).frame(width: 8, height: 8)
                    Text(store.device.code != nil ? store.t("savedSynced") : store.t("savedHere")).font(.caption).foregroundStyle(Color.ink2)
                    Spacer()
                }
            }
            VStack(spacing: 10) {
                if let more, !reached, unseen > 0 {
                    // Five new words bring in about 3 answers each (meet + review + practice)
                    Button(goal - n <= 15 ? store.t("learnMoreGoal", min(5, unseen)) : store.t("moreNew", min(5, unseen))) { more() }
                        .buttonStyle(.primary).accessibilityIdentifier("FlowMore")
                }
                if !mistakes.isEmpty {
                    Button(store.t("practiseThese", mistakes.count)) { again(mistakes) }
                        .buttonStyle(SecondaryButtonStyle(tint: .accent))
                        .overlay(RoundedRectangle(cornerRadius: max(Look.current.radius, 2) + 2).stroke(Color.accent, lineWidth: 1.5))
                }
                Button(store.t("backTo", store.course.gender ? Look.current.tabs.first ?? store.t("learn") : store.t("learn"))) { close() }
                    .buttonStyle(more != nil && !reached && unseen > 0 ? AnyButtonStyle(.secondary) : AnyButtonStyle(.primary))
                    .accessibilityIdentifier("FlowDone")
            }.padding(.top, 20)
        }
    }
    func cell(_ big: String, _ small: String, hot: Bool = false, last: Bool = false) -> some View {
        VStack(spacing: 1) {
            Text(big).font(.system(size: 20, weight: .bold)).monospacedDigit().foregroundStyle(hot ? Color.accent : Color.ink)
            Text(small).font(.caption2).foregroundStyle(Color.ink2).multilineTextAlignment(.center).lineLimit(2).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 10).padding(.horizontal, 2)
        .overlay(alignment: .trailing) { if !last { Rectangle().fill(Color.line).frame(width: 1).padding(.vertical, 8) } }
        .accessibilityElement(children: .combine)
    }
    @ViewBuilder func word(_ w: Word) -> some View {
        switch store.course.id {
        case "zh": PinyinText(py: w.py, size: 14, weight: .bold)
        case "vi": VietText(text: w.hz, size: 14, weight: .bold)
        case "de", "es": GenderText(word: w, size: 14)
        default: Text(w.hz).hanziFont(14, .bold)
        }
    }
}

/// "Done" in the course's own words: Wánchéng! · Fertig für heute · Listo por hoy …
struct DoneTitle: View {
    let course: String
    var body: some View {
        switch course {
        case "de", "es": Text(course == "de" ? "Fertig für heute" : "Listo por hoy").hanziFont(32, .bold)
        default:
            let t = ["zh": "Wánchéng!", "ja": "Kanryō!", "ko": "Wallyo!", "vi": "Xong rồi!"][course] ?? "Wánchéng!"
            Text(t).font(.system(size: 34, weight: .bold)).foregroundStyle(course == "zh" ? Color.tone(2) : Color.ink)
        }
    }
}

/// The mark of a finished day: the seal (Chinese, Japanese, Korean), the lime word (Vietnamese),
/// a rubber stamp with the date (German) or a sun (Spanish)
struct DoneMark: View {
    let course: String
    var small = false
    var body: some View {
        Group {
            switch course {
            case "de": ErledigtStamp()
            case "es": SunSeal()
            default:
                let text = ["zh": "完成", "ja": "完了", "ko": "완료", "vi": "Xong"][course] ?? "完成"
                SealStamp(text: text, latin: course == "vi")
            }
        }
        .scaleEffect(small ? 0.5 : 1).frame(width: small ? 60 : nil, height: small ? 60 : nil)
    }
}

/// German: a rubber stamp, ERLEDIGT and today's date, in amber
struct ErledigtStamp: View {
    var body: some View {
        let amber = Color.dynamic(0x8F5C12, 0xE0A341, text: false)
        let date = Date().formatted(.dateTime.day().month(.abbreviated).locale(Locale(identifier: "de_DE"))).uppercased()
        VStack(spacing: 2) {
            Text("ERLEDIGT").hanziFont(30, .bold).tracking(2.4)
            Text(date).font(.system(size: 13, weight: .semibold)).tracking(2.6)
        }
        .foregroundStyle(amber)
        .padding(.horizontal, 18).padding(.vertical, 8)
        .overlay(RoundedRectangle(cornerRadius: 3).stroke(amber, lineWidth: 1.5))
        .padding(5)
        .overlay(RoundedRectangle(cornerRadius: 6).stroke(amber, lineWidth: 3))
        .rotationEffect(.degrees(-3))
        .accessibilityElement().accessibilityLabel("Erledigt, \(date)")
    }
}

/// Spanish: a terracotta sun with ¡Hecho! in the middle
struct SunSeal: View {
    var body: some View {
        let ray = Color.dynamic(0xC4572B, 0xE8805A, text: false), disc = Color.dynamic(0xA8461F, 0xC4572B, text: false)
        ZStack {
            ForEach(0..<16, id: \.self) { k in
                let big = k % 2 == 0, a = Double(k) * .pi / 8, r: CGFloat = big ? 54 : 51
                Circle().fill(ray).frame(width: big ? 6 : 4, height: big ? 6 : 4)
                    .offset(x: r * CGFloat(sin(a)), y: -r * CGFloat(cos(a)))
            }
            Circle().fill(disc).frame(width: 84, height: 84)
            Circle().stroke(Color.dynamic(0xFBF6EF, 0xF3EBE0, text: false), lineWidth: 1.5).frame(width: 72, height: 72)
            Text("¡Hecho!").hanziFont(17, .bold).foregroundStyle(.white)
        }
        .frame(width: 120, height: 120)
        .accessibilityElement().accessibilityLabel("¡Hecho!")
    }
}
