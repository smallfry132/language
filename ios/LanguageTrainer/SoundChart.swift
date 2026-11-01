import SwiftUI
import LanguageCore

/* Sound chart: every sound with its tones, to listen and repeat; example words from the course. */

struct SoundChart: View {
    @Environment(Store.self) var store
    @State private var group = 0
    @State private var picked: (row: Int, cell: Int?)?
    @State private var slow = false

    var body: some View {
        if let data = Library.shared.sounds[store.course.id] {
            let g = data.groups[min(group, data.groups.count - 1)]
            let sep = store.course.id == "ja" ? "、" : store.course.id == "zh" ? "，" : ", "
            Page {
                if let intro = data.intro { Text(intro.get(store.state.lang)).font(.footnote).foregroundStyle(Color.ink2) }
                ChipRow { ForEach(Array(data.groups.enumerated()), id: \.offset) { k, x in ChipButton(label: x.name.get(store.state.lang), active: k == group) { group = k; picked = nil } } }
                Toggle(isOn: $slow) { Label(store.t("slow"), systemImage: "tortoise") }.font(.subheadline).tint(.accentRed)
                if let head = g.head, !head.isEmpty {
                    HStack(spacing: 6) {
                        Color.clear.frame(width: 50, height: 1)
                        ForEach(head, id: \.self) { Text($0).font(.caption2).foregroundStyle(Color.ink3).frame(maxWidth: .infinity) }
                    }
                }
                ForEach(Array(g.rows.enumerated()), id: \.offset) { ri, r in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Button {
                                picked = (ri, nil)
                                store.speaker.say(r.cells.compactMap { $0.t == nil ? nil : $0.say }.joined(separator: sep), rate: slow ? 0.5 : 0.7)
                            } label: { Text(r.base).font(.headline).frame(width: 50, height: 52).background(Color.sunken, in: RoundedRectangle(cornerRadius: 10)) }
                                .buttonStyle(.plain).accessibilityLabel(store.t("playRow"))
                            ForEach(Array(r.cells.enumerated()), id: \.offset) { ci, c in
                                if let t = c.t {
                                    Button { picked = (ri, ci); speakSound(store, c.say, slow: slow) } label: {
                                        VStack(spacing: 1) {
                                            Text(t).font(.system(size: 17, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.6)
                                            if let s = c.s, s != t { Text(s).font(.caption2).foregroundStyle(Color.ink3) }
                                        }
                                        .frame(maxWidth: .infinity, minHeight: 52)
                                        .background(picked?.row == ri && picked?.cell == ci ? Color.accentRed.opacity(0.14) : Color.elevated, in: RoundedRectangle(cornerRadius: 10))
                                        .foregroundStyle(Color.ink)
                                    }.buttonStyle(.plain)
                                } else { Color.clear.frame(maxWidth: .infinity, minHeight: 52) }
                            }
                        }
                        if let note = r.note { Text(note.get(store.state.lang)).font(.caption).foregroundStyle(Color.ink2) }
                        if picked?.row == ri { examples(r, cell: picked?.cell.map { r.cells[$0] }, kana: g.kana == true) }
                    }
                }
                NavigationLink(value: Route.soundDrill) { Label(store.t("listenPick"), systemImage: "headphones") }.buttonStyle(.primary).padding(.top, 10)
            }
            .navigationTitle(store.t("sounds")).navigationBarTitleDisplayMode(.inline)
        }
    }

    @ViewBuilder func examples(_ r: SoundRow, cell: SoundCell?, kana: Bool) -> some View {
        if r.match != nil || (store.course.id == "ja" && kana) {
            let ex = Self.examples(store.words.all, course: store.course.id, row: r, cell: cell)
            VStack(alignment: .leading, spacing: 6) {
                Text(store.t("examplesFor", cell?.t ?? r.base)).font(.caption.weight(.semibold)).foregroundStyle(Color.ink3)
                if ex.isEmpty { Text(store.t("noExamples")).font(.footnote).foregroundStyle(Color.ink2) }
                ForEach(ex) { w in
                    HStack {
                        Text(w.hz).font(.hanzi(18))
                        Text(w.py).font(.footnote).foregroundStyle(Color.ink2)
                        Text(store.tr(w)).font(.footnote).foregroundStyle(Color.ink3).lineLimit(1)
                        Spacer()
                        SpeakButton(text: w.hz, rate: slow ? 0.5 : 0.7, small: true)
                    }
                }
            }.padding(10).background(Color.sunken, in: RoundedRectangle(cornerRadius: 12))
        }
    }

    static func examples(_ words: [Word], course: String, row: SoundRow, cell: SoundCell?) -> [Word] {
        let m = row.match
        let want: (Word) -> Bool = { w in
            switch course {
            case "zh":
                guard let m else { return false }
                let tone = cell.flatMap { Lingo.toneSeq($0.t ?? "").first } ?? 0
                return Lingo.pySyllables(w.py).contains { x in
                    (m.final.map { x.f == $0 } ?? true) && (m.initial.map { ini in ini.split(separator: "|").contains { $0 == x.i } } ?? true) && (tone == 0 || x.tone == tone)
                }
            case "vi":
                guard let m else { return false }
                let syl = Lingo.viNoTone(w.hz).split(separator: " ").map(String.init)
                if let v = m.vowel { return syl.contains { $0.contains(v) } }
                if let ini = m.initial {
                    let set = ini.split(separator: "|").map(String.init)
                    let re = /^(ngh|ng|nh|kh|ph|th|tr|ch|gh|gi|qu|[bcdđghklmnpqrstvx])/
                    return syl.contains { s in (try? re.firstMatch(in: s)).flatMap { $0 }.map { set.contains(String($0.1)) } ?? false }
                }
                if let fin = m.final {
                    let set = fin.split(separator: "|").map(String.init)
                    let re = /(ch|ng|nh|[cmnpt])$/
                    return syl.contains { s in (try? re.firstMatch(in: s)).flatMap { $0 }.map { set.contains(String($0.1)) } ?? false }
                }
                return false
            default:
                let reading = Lingo.kataToHira(w.kana ?? "")
                let keys = cell.map { [Lingo.kataToHira($0.t ?? "")] } ?? row.cells.compactMap { $0.t.map(Lingo.kataToHira) }
                return keys.contains { !$0.isEmpty && reading.contains($0) }
            }
        }
        var hits: [Word] = []
        for w in words where want(w) { hits.append(w); if hits.count >= 60 { break } }
        return Array(hits.sorted { $0.lvl != $1.lvl ? $0.lvl < $1.lvl : $0.hz.count < $1.hz.count }.prefix(6))
    }
}
