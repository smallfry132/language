import XCTest

/// Taps through the app like a learner would. Runs with the demo learner (-demo) and silent speech (-mute).
final class FlowTests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = false
        app = XCUIApplication()
    }
    func launch(_ extra: [String] = []) {
        app.launchArguments = ["-demo", "-mute"] + extra
        app.launch()
    }
    func button(_ prefix: String) -> XCUIElement { app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", prefix)).firstMatch }
    func text(_ part: String) -> XCUIElement { app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", part)).firstMatch }

    func testTodaySessionRunsToTheEnd() {
        launch()
        app.buttons["Continue"].tap()
        var steps: [String] = []
        for _ in 0..<300 {
            if app.buttons["FlowDone"].exists { break }
            // The session header: "Step 2 of 5 · 1 of 14"
            let sub = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'Step '")).firstMatch
            if sub.exists, let step = sub.label.components(separatedBy: " · ").first, !steps.contains(step) { steps.append(step) }
            if app.buttons["NextWord"].exists { app.buttons["NextWord"].tap(); continue }   // meet
            if app.buttons["Show answer"].exists { app.buttons["Show answer"].tap(); continue }
            if button("Good").exists { button("Good").tap(); continue }
            if text("Which word did you hear").exists {                                    // listen
                if app.buttons["Next"].exists { app.buttons["Next"].tap() } else { button("1").tap() }
                continue
            }
            if app.buttons["Speak"].exists && app.buttons["Skip"].exists { app.buttons["Skip"].tap(); continue } // speak
            if app.textFields.firstMatch.exists {                                           // type with the tone tiles
                if app.buttons["Next"].exists { app.buttons["Next"].tap(); continue }
                let f = app.textFields.firstMatch
                f.tap(); f.typeText("ni3hao3")
                XCTAssertEqual(f.value as? String, "nǐhǎo", "tone numbers become marks while typing")
                app.buttons["Check"].tap(); continue
            }
            RunLoop.current.run(until: Date().addingTimeInterval(0.3))
        }
        XCTAssertTrue(text("session is done").exists)
        XCTAssertEqual(steps.count, 5, "meet, cards, listen, say, type: \(steps)")
        app.buttons["FlowDone"].tap()
        XCTAssertTrue(text("Done for today").waitForExistence(timeout: 3))
    }

    func testLessonWithOwnWord() {
        launch(["-route", "lessons"])
        let newLesson = button("New lesson")
        // Lessons are further down on Learn: scroll until the button is clear of the dock
        for _ in 0..<6 where !newLesson.isHittable || newLesson.frame.maxY > app.frame.height - 140 { app.swipeUp(velocity: .slow) }
        newLesson.tap()
        let search = app.textFields["Search pinyin, meaning or characters…"]
        if !search.waitForExistence(timeout: 3) { print("TREE", app.debugDescription) }
        XCTAssertTrue(search.exists)
        search.tap(); search.typeText("chá")
        app.buttons.matching(NSPredicate(format: "label CONTAINS 'Add'")).firstMatch.tap()
        let py = app.textFields["Pinyin (ni3hao3 → nǐhǎo)"]
        py.tap(); py.typeText("hao3chi1")
        XCTAssertEqual(py.value as? String, "hǎochī")
        let hz = app.textFields["Characters (needed for audio)"]
        hz.tap(); hz.typeText("好吃")
        let en = app.textFields["Meaning"]
        en.tap(); en.typeText("tasty")
        app.buttons["own-add"].tap()
        XCTAssertTrue(text("tasty").waitForExistence(timeout: 2))
        XCTAssertTrue(text("tea").exists)
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(text("2 words").waitForExistence(timeout: 3))
    }

    func testDialogueTypedAnswer() {
        launch(["-route", "lessons/dialogue/zh-greet", "-dlgmode", "turn", "-dlgrole", "1"])
        let type = button("Type")
        XCTAssertTrue(type.waitForExistence(timeout: 8), "my turn comes after Wáng Míng's first line")
        type.tap()
        let field = app.textFields["…or type the pinyin"]
        XCTAssertTrue(field.waitForExistence(timeout: 3))
        field.tap(); field.typeText("ni3 hao3\n")
        XCTAssertTrue(text("✓ Correct").waitForExistence(timeout: 3))
        // Second turn: answer without tones
        XCTAssertTrue(app.staticTexts["I'm fine, thanks. And you?"].waitForExistence(timeout: 8))
        XCTAssertTrue(type.waitForExistence(timeout: 8))
        type.tap()
        XCTAssertTrue(field.waitForExistence(timeout: 3))
        field.tap(); field.typeText("wo hen hao xiexie ni ne\n")
        XCTAssertTrue(text("Next time add the tones too").waitForExistence(timeout: 3))
    }

    /// Tiles must be drawn as they scroll into view, not only after scrolling past them
    func testWordTilesAppearWhileScrolling() {
        launch(["-route", "words"])
        let list = app.scrollViews.firstMatch
        XCTAssertTrue(list.waitForExistence(timeout: 5))
        for _ in 0..<8 {
            list.swipeUp(velocity: .slow)
            // Every tile on screen has its content
            let onScreen = app.buttons.allElementsBoundByIndex.filter { $0.frame.height > 90 && $0.frame.height < 200 && $0.isHittable && list.frame.contains($0.frame) }
            XCTAssertFalse(onScreen.isEmpty, "some tiles are on screen")
            for t in onScreen.prefix(12) { XCTAssertFalse(t.label.isEmpty, "a tile without content at \(t.frame)") }
        }
    }

    func testGermanAndCourseSwitch() {
        launch()
        app.buttons["Me"].tap()
        let deutsch = app.buttons["Deutsch"].firstMatch
        for _ in 0..<6 where !deutsch.isHittable { app.swipeUp() }
        deutsch.tap()
        XCTAssertTrue(app.buttons["Lernen"].waitForExistence(timeout: 3))
        app.buttons["Lernen"].tap()
        app.buttons["Sprache wechseln"].tap()
        app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "Tiếng Việt")).firstMatch.tap()
        app.buttons["Wörter"].firstMatch.tap()
        XCTAssertTrue(text("xin chào").waitForExistence(timeout: 3))
    }
}
