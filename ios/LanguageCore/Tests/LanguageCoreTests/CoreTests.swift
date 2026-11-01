import XCTest
@testable import LanguageCore

final class PinyinTests: XCTestCase {
    func testParts() {
        let p = Lingo.pyParts("Tā jīnnián èrshíwǔ suì.")
        XCTAssertEqual(p.filter { !$0.sep }.map(\.text), ["Tā", "jīn", "nián", "èr", "shí", "wǔ", "suì"])
        XCTAssertEqual(p.filter { !$0.sep }.map(\.tone), [1, 1, 2, 4, 2, 3, 4])
        XCTAssertEqual(p.map(\.text).joined(), "Tā jīnnián èrshíwǔ suì.")
        XCTAssertEqual(Lingo.pyParts("xièxie").map(\.tone), [4, 5])
    }
    func testMarks() {
        XCTAssertEqual(Lingo.numToMarks("ni3hao3"), "nǐhǎo")
        XCTAssertEqual(Lingo.numToMarks("lv4 gou3 ma5"), "lǜ gǒu ma")
        XCTAssertEqual(Lingo.numToMarks("Zhong1guo2"), "Zhōngguó")
        XCTAssertEqual(Lingo.stripTones("Nǐ hǎo!"), "nihao")
    }
    func testTypedWord() {
        let w = Word(id: "1", hz: "你好", py: "nǐ hǎo", en: "hello", cat: "phrases", lvl: 1, course: "zh")
        XCTAssertTrue(Check.typedWord("nihao", w))
        XCTAssertTrue(Check.typedWord("ni3hao3", w))
        XCTAssertFalse(Check.typedWord("ni2hao3", w))
        XCTAssertTrue(Check.typedWord("nǐhǎo", w))
        XCTAssertFalse(Check.typedWord("níhǎo", w))
        let v = Word(id: "v2", hz: "cảm ơn", py: "", en: "thanks", cat: "phrases", lvl: 1, course: "vi")
        XCTAssertTrue(Check.typedWord("cam on", v))
        XCTAssertTrue(Check.typedWord("cảm ơn", v))
        XCTAssertFalse(Check.typedWord("cám ơn", v))
    }
    func testTypedLine() {
        let py = "Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ."
        XCTAssertEqual(Check.typedLine("wo3 jia1 you3 si4 kou3 ren2: baba, mama, gege he2 wo3", hz: "", py: py, course: "zh"), Check.Typed(ok: true, tonesMissing: true))
        XCTAssertEqual(Check.typedLine("wo jia you si kou ren baba mama gege he wo", hz: "", py: py, course: "zh"), Check.Typed(ok: true, tonesMissing: true))
        XCTAssertEqual(Check.typedLine("wǒ jiā yǒu sì kǒu rén bàba māma gēge hé wǒ", hz: "", py: py, course: "zh"), Check.Typed(ok: true))
        XCTAssertEqual(Check.typedLine("wǒ jiā yǒu sí kǒu rén bàba māma gēge hé wǒ", hz: "", py: py, course: "zh").tonesWrong, true)
        XCTAssertFalse(Check.typedLine("wo jia you wu kou ren", hz: "", py: py, course: "zh").ok)
        XCTAssertEqual(Check.hintMask("Nǐ hǎo ma?"), "N· h·· m·?")
    }
    func testHeard() {
        let h = Check.matchHeard("他今年二十五岁。", ["他今年25岁"], course: "zh")
        XCTAssertEqual(h.score, 1)
        let half = Check.matchHeard("我家有四口人", ["我家有"], course: "zh")
        XCTAssertEqual(half.hit, [true, true, true, false, false, false])
    }
}

final class LearningTests: XCTestCase {
    func testGradeOncePerDay() {
        var s = AppState()
        let now = nowMs()
        s.grade("5", 2, now: now)
        XCTAssertEqual(s.card("5")?.interval, 1)
        s.grade("5", 2, now: now + 1000) // same day: no second step
        XCTAssertEqual(s.card("5")?.reps, 1)
        s.grade("5", 0, now: now + 2000) // a miss clears the day
        XCTAssertNil(s.card("5")?.ok)
        s.grade("5", 2, now: now + 3000)
        XCTAssertEqual(s.card("5")?.interval, 1)
        XCTAssertTrue(s.status("5") == .learning)
    }
    func testDataLoads() {
        let lib = Library.shared
        XCTAssertEqual(lib.words["zh"]?.count, 601)
        XCTAssertEqual(lib.dialogues["zh"]?.count, 8)
        XCTAssertNotNil(lib.sounds["vi"])
        let t = Texts(lang: "en", course: "zh", pinyinFirst: true)
        XCTAssertEqual(t("wordsCount", 3, 10), "3 of 10 words")
        XCTAssertEqual(t("moreNew", 1), "Learn 1 more new word")
        XCTAssertEqual(t("moreNew", 4), "Learn 4 more new words")
        XCTAssertEqual(t("toneLike", 4), "sounded like a 4th tone")
        XCTAssertEqual(Texts(lang: "de", course: "zh", pinyinFirst: false)("toneLike", 2), "klang wie ein 2. Ton")
        XCTAssertEqual(t("modeListenDesc"), "Hear the word, choose the pinyin.")
        XCTAssertFalse(t.list("pinyinTipsText").isEmpty)
    }
}

final class SyncTests: XCTestCase {
    /// A document as the web app writes it: numeric ids, tombstones, extra fields
    let web = """
    {"mt":{"favs":100,"settings":100,"lang":100},"settings":{"rate":0.9,"autoSpeak":true,"tilePinyin":true,"quizSize":10,"dailyGoal":20,"theme":"auto","newPerDay":5,"dlgTr":false},
     "stats":{"dweb":{"answered":5,"correct":4,"days":{"2026-10-31":5},"sessions":1,"since":0}},
     "favs":[3,"v2"],"courses":{"zh":{"levels":[1]},"vi":{"levels":[1]},"ja":{"levels":[1]}},"typer":null,"lang":"de",
     "srs":{"3":{"ef":2.5,"interval":1,"reps":1,"due":1761900000000,"lapses":0,"first":"2026-10-31","ok":"2026-10-31","t":200},"7":{"gone":1,"t":300}},
     "lessons":{"l1":{"course":"zh","name":"Lesson 1","words":[3,"u1"],"created":50,"t":60}},
     "custom":{"u1":{"course":"zh","hz":"好吃","py":"hǎochī","en":"tasty","t":60}},"dlg":{}}
    """
    func testMergeWebDocument() throws {
        let doc = try JSONDecoder().decode(SyncDoc.self, from: Data(web.utf8))
        var s = AppState()
        s.lang = "en"
        var snap = Snapshot(s)
        _ = s.stamp(&snap, now: 50) // local fields older than the server's
        s.srs["7"] = Card()
        s.srs["7"]!.t = 10
        let ahead = s.merge(doc, device: "dios")
        XCTAssertEqual(s.lang, "de")
        XCTAssertEqual(s.favs, [WordRef("3"), WordRef("v2")])
        XCTAssertEqual(s.settings.dlgTr, false)
        XCTAssertNil(s.card("7"), "the tombstone is newer")
        XCTAssertEqual(s.card("3")?.interval, 1)
        XCTAssertEqual(s.lessons["l1"]?.words.map(\.id), ["3", "u1"])
        XCTAssertEqual(s.peers["dweb"]?.answered, 5)
        XCTAssertEqual(s.dayCount("2026-10-31"), 5)
        XCTAssertTrue(ahead, "this device's stats are not on the server yet")
        // Ids go back out the way the web app wrote them
        let out = String(data: try JSONEncoder().encode(SyncDoc(state: s, device: "dios")), encoding: .utf8)!
        XCTAssertTrue(out.contains("\"favs\":[3,\"v2\"]"), out)
        XCTAssertTrue(out.contains("\"7\":{\"gone\":1,\"t\":300}") || out.contains("\"7\":{\"t\":300,\"gone\":1}"), out)
    }
    func testStampTombstone() {
        var s = AppState()
        s.grade("9", 2)
        var snap = Snapshot(AppState())
        XCTAssertTrue(s.stamp(&snap, now: 1000))
        XCTAssertEqual(s.srs["9"]?.t, 1000)
        s.resetWord("9")
        XCTAssertTrue(s.stamp(&snap, now: 2000))
        XCTAssertEqual(s.srs["9"]?.gone, 1)
        XCTAssertFalse(s.stamp(&snap, now: 3000))
        XCTAssertEqual(SyncCode.parse("abcde-fghjk-lmnpq-rstuv"), "ABCDE-FGHJK-LMNPQ-RSTUV")
        XCTAssertNil(SyncCode.parse("ABCDE-FGHJK-LMNPQ-RSTU0"))
    }
}

final class PitchTests: XCTestCase {
    /// A voice-like tone (harmonics) following a pitch contour in semitones around 200 Hz
    func voice(_ contours: [[Double]], gap: Double = 0.12) -> [Float] {
        var out: [Float] = [], phase = 0.0
        let sr = Pitch.sampleRate
        for c in contours {
            let n = Int(0.3 * sr)
            for i in 0..<n {
                let p = Double(i) / Double(n) * Double(c.count - 1), k = min(Int(p), c.count - 2), f = p - Double(k)
                let semis = c[k] * (1 - f) + c[k + 1] * f
                let f0 = 200 * pow(2, semis / 12)
                phase += 2 * .pi * f0 / sr
                out.append(Float(0.3 * sin(phase) + 0.15 * sin(2 * phase) + 0.08 * sin(3 * phase)))
            }
            out += [Float](repeating: 0, count: Int(gap * sr))
        }
        return out
    }
    let flat: [Double] = [3, 3, 3], rise: [Double] = [-2, 0, 4], dip: [Double] = [-3, -6, -5], fall: [Double] = [4, 0, -5]

    func testFourTones() {
        for (py, c) in [("mā", flat), ("má", rise), ("mǎ", dip), ("mà", fall)] {
            let r = Pitch.check(py: py, frames: Pitch.track(voice([c])), f0base: 200)
            XCTAssertFalse(r.none, py)
            XCTAssertEqual(r.score, 1, "\(py): got \(String(describing: r.syllables.first?.got))")
        }
    }
    func testThirdToneChange() {
        let r = Pitch.check(py: "nǐ hǎo", frames: Pitch.track(voice([rise, dip])), f0base: 200)
        XCTAssertTrue(r.sandhi)
        XCTAssertEqual(r.syllables.map(\.want), [2, 3])
        XCTAssertEqual(r.score, 1)
    }
    func testFlatFourthToneGetsATip() {
        let r = Pitch.check(py: "xìng", frames: Pitch.track(voice([flat])), f0base: 200)
        XCTAssertEqual(r.syllables.first?.ok, false)
        XCTAssertEqual(r.syllables.first?.tip, "tipFall")
    }
    func testSilence() {
        XCTAssertTrue(Pitch.check(py: "mā", frames: Pitch.track([Float](repeating: 0, count: 16000)), f0base: nil).none)
    }
}

final class PauseTests: XCTestCase {
    /// Feeds 43 ms chunks: background, then speech (with small dips between syllables), then background again.
    /// Returns when it stopped, in seconds (nil = never before the end).
    func run(background: Float, speech: Float, speechSeconds: Double, quiet: Double = 0.8, max: Double = 15) -> Double? {
        var d = PauseDetector(maxSeconds: max, quiet: quiet)
        let chunk = 2048.0 / 48000, t0 = 0.6, t1 = t0 + speechSeconds
        var t = 0.0, k = 0
        while t < t1 + 4 {
            let speaking = t >= t0 && t < t1
            let rms = speaking ? (k % 6 == 5 ? speech * 0.35 : speech) : background * Float(0.8 + 0.4 * Double((k * 7) % 5) / 4)
            if d.feed(rms: rms, seconds: chunk) { return t }
            t += chunk; k += 1
        }
        return nil
    }
    func testStopsAfterSpeakingInAQuietRoom() {
        let t = run(background: 0.002, speech: 0.04, speechSeconds: 1.2)!
        XCTAssertEqual(t, 0.6 + 1.2 + 0.8, accuracy: 0.25)
    }
    func testSoftVoiceBelowTheOldFixedThreshold() {
        XCTAssertNotNil(run(background: 0.0008, speech: 0.009, speechSeconds: 1.0)) // the old fixed 0.02 never heard this
    }
    func testNoisyRoom() {
        let t = run(background: 0.03, speech: 0.2, speechSeconds: 1.5)! // the old fixed 0.02 never found a pause here
        XCTAssertLessThan(t, 0.6 + 1.5 + 1.5)
    }
    func testLongSentenceIsNotCutShort() {
        let t = run(background: 0.003, speech: 0.03, speechSeconds: 7, quiet: 1.2)!
        XCTAssertGreaterThan(t, 0.6 + 7)
    }
    func testSilenceStopsAtTheLimit() {
        var d = PauseDetector(maxSeconds: 6, quiet: 0.8)
        var stoppedAt = 0.0
        for k in 0..<400 { if d.feed(rms: 0.002, seconds: 0.0427) { stoppedAt = Double(k) * 0.0427; break } }
        XCTAssertEqual(stoppedAt, 6, accuracy: 0.1)
    }
}
