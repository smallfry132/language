import XCTest
@testable import LanguageCore

final class VoiceTests: XCTestCase {
    func testTuneClampsAndDecodesLeniently() throws {
        let t = VoiceTune(bass: 12, clarity: -9, bright: .nan, pitch: 900)
        XCTAssertEqual(t, VoiceTune(bass: 6, clarity: -6, bright: 0, pitch: 300))
        XCTAssertEqual(VoiceTune.standard.clarity, 2) // a light clarity boost by default
        let back = try JSONDecoder().decode(VoiceTune.self, from: JSONEncoder().encode(VoiceTune(bass: -2, clarity: 3, bright: 1.5, pitch: -100)))
        XCTAssertEqual(back, VoiceTune(bass: -2, clarity: 3, bright: 1.5, pitch: -100))
        let partial = try JSONDecoder().decode(VoiceTune.self, from: Data(#"{"bass": 20}"#.utf8))
        XCTAssertEqual(partial, VoiceTune(bass: 6, clarity: 2, bright: 0, pitch: 0))
    }
    func testSecondVoiceForDialogues() {
        let anna = VoiceInfo(id: "anna", language: "de-DE", rank: 50, gender: 2)
        let helena = VoiceInfo(id: "helena", language: "de-DE", rank: 40, gender: 2)
        let martin = VoiceInfo(id: "martin", language: "de-DE", rank: 30, gender: 1)
        let eddy = VoiceInfo(id: "eddy", language: "de-DE", rank: 0, gender: 1)       // robotic: never
        let austria = VoiceInfo(id: "at", language: "de-AT", rank: 50, gender: 1)
        // the other gender wins over a better voice of the same gender
        XCTAssertEqual(VoicePick.second(main: anna, among: [anna, helena, martin, eddy], language: "de-DE")?.id, "martin")
        // without the other gender: the best other voice
        XCTAssertEqual(VoicePick.second(main: anna, among: [anna, helena, eddy], language: "de-DE")?.id, "helena")
        // only robotic voices besides the main one: none (the main voice speaks lower)
        XCTAssertNil(VoicePick.second(main: anna, among: [anna, eddy], language: "de-DE"))
        // another region only when the exact language has no second voice
        XCTAssertEqual(VoicePick.second(main: anna, among: [anna, austria], language: "de-DE")?.id, "at")
        XCTAssertEqual(VoicePick.second(main: anna, among: [anna, austria, helena], language: "de-DE")?.id, "helena")
        // Chinese never takes a voice of another region (Taiwan speaks another standard)
        let ting = VoiceInfo(id: "ting", language: "zh-CN", rank: 30, gender: 2), mei = VoiceInfo(id: "mei", language: "zh-TW", rank: 30, gender: 2)
        XCTAssertNil(VoicePick.second(main: ting, among: [ting, mei], language: "zh-CN"))
    }
    func testDialogueVoicesFollowGender() {
        let anna = VoiceInfo(id: "anna", language: "de-DE", rank: 50, gender: 2)
        let helena = VoiceInfo(id: "helena", language: "de-DE", rank: 40, gender: 2)
        let martin = VoiceInfo(id: "martin", language: "de-DE", rank: 30, gender: 1)
        let markus = VoiceInfo(id: "markus", language: "de-DE", rank: 40, gender: 1)
        let pick = { (g: Int, who: Int, og: Int, main: VoiceInfo, all: [VoiceInfo]) in VoicePick.person(gender: g, who: who, otherGender: og, main: main, among: all, language: "de-DE") }
        // Lena (woman, first) and Tom (man, second) with a woman's main voice: Lena keeps it, Tom gets a man's voice
        XCTAssertEqual(pick(2, 0, 1, anna, [anna, helena, martin]).id, nil)
        XCTAssertEqual(pick(1, 1, 2, anna, [anna, helena, martin]).id, "martin")
        // A man speaking FIRST still gets the man's voice (the old rule gave the first person the main voice)
        XCTAssertEqual(pick(1, 0, 2, anna, [anna, helena, martin, markus]).id, "markus")
        XCTAssertEqual(pick(2, 1, 1, anna, [anna, helena, martin, markus]).id, nil)
        // No man's voice installed: the woman's voice pitched down
        let low = pick(1, 0, 2, anna, [anna, helena])
        XCTAssertNil(low.id); XCTAssertLessThan(low.cents, -300)
        // A man's main voice and a woman in the dialogue: she gets a woman's voice
        XCTAssertEqual(pick(2, 1, 1, martin, [martin, anna]).id, "anna")
        XCTAssertEqual(pick(2, 1, 1, martin, [martin]).cents, 300)
        // Two women (Lan and Anna): the second gets another woman's voice, or the main one a little higher
        XCTAssertEqual(pick(2, 1, 2, anna, [anna, helena, martin]).id, "helena")
        XCTAssertEqual(pick(2, 1, 2, anna, [anna, martin]).cents, 150)
        // Gender of the main voice not known: the old rule (second person: another voice)
        let plain = VoiceInfo(id: "plain", language: "de-DE", rank: 30, gender: 0)
        XCTAssertEqual(pick(1, 1, 2, plain, [plain, helena]).id, "helena")
        XCTAssertEqual(pick(1, 0, 2, plain, [plain, helena]).id, nil)
    }
    func testDialoguePeopleHaveGenders() {
        for (c, ds) in Library.shared.dialogues { for d in ds { for p in d.people { XCTAssertNotEqual(p.gender, 0, "\(c) \(d.id) \(p.hz)") } } }
        let greet = Library.shared.dialogues["zh"]?.first { $0.id == "zh-greet" }
        XCTAssertEqual(greet?.people.map(\.gender), [1, 2]) // 王明 and 安娜
    }
    func testTwoVoicesSettingDecodes() throws {
        let s = try JSONDecoder().decode(Settings.self, from: Data(#"{"rate": 1, "twoVoices": false}"#.utf8))
        XCTAssertEqual(s.twoVoices, false)
        XCTAssertNil(try JSONDecoder().decode(Settings.self, from: Data(#"{"rate": 1}"#.utf8)).twoVoices)
        XCTAssertEqual(try JSONDecoder().decode(Settings.self, from: JSONEncoder().encode(s)).twoVoices, false)
    }
}
