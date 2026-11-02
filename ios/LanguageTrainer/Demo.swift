import Foundation
import LanguageCore

/// A learner at lesson 5 of Chinese, for screenshots and testing (launch argument -demo)
enum Demo {
    static func state() -> AppState {
        var s = AppState()
        s.lang = "en"
        let now = nowMs()
        // Met words: some due, some known
        for (k, id) in ["1", "3", "5", "6", "8", "10", "14", "20", "26", "34", "41", "56", "60", "71", "80"].enumerated() {
            var c = Card()
            c.reps = k % 4; c.interval = k % 5 == 0 ? 30 : Double(k % 4 + 1); c.first = todayKey(now - DAY * Double(k + 1))
            c.due = k % 3 == 0 ? now - DAY : now + DAY * Double(k)
            s.srs[id] = c
        }
        var l = Lesson(course: "zh", name: "Lesson 5: Ordering food", created: now - DAY)
        l.words = ["21", "48", "50", "59", "65", "114", "120", "95"].map(WordRef.init)
        s.lessons["ldemo"] = l
        for d in 1...9 { s.stats.days[todayKey(now - DAY * Double(d))] = 10 + d * 3 }
        s.stats.days[todayKey(now)] = 6
        s.stats.answered = 160; s.stats.correct = 131
        s.stats.skill = ["zh": ["listen": [43, 50], "speak": [20, 27], "read": [40, 48], "write": [19, 24]]]
        s.stats.tones = ["zh": ["1": [21, 23], "2": [16, 19], "3": [8, 13], "4": [22, 25]]]
        s.dlg["zh-greet"] = { var p = DialogueProgress(); p.listen = todayKey(now); p.read = .init(best: 41000, last: 47000, acc: 86); return p }()
        return s
    }
}
