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
    func testTwoVoicesSettingDecodes() throws {
        let s = try JSONDecoder().decode(Settings.self, from: Data(#"{"rate": 1, "twoVoices": false}"#.utf8))
        XCTAssertEqual(s.twoVoices, false)
        XCTAssertNil(try JSONDecoder().decode(Settings.self, from: Data(#"{"rate": 1}"#.utf8)).twoVoices)
        XCTAssertEqual(try JSONDecoder().decode(Settings.self, from: JSONEncoder().encode(s)).twoVoices, false)
    }
}
