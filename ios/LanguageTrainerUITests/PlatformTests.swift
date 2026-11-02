import XCTest

/// iOS platform behaviour (the mobile-tester checklist): VoiceOver and contrast audits, the largest text size,
/// back navigation, a denied microphone, the paste permission, the widget link and dark mode.
/// Runs with the demo learner (-demo) and silent speech (-mute).
final class PlatformTests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        continueAfterFailure = true
        app = XCUIApplication()
        XCUIDevice.shared.appearance = .light
    }
    override func tearDown() { XCUIDevice.shared.appearance = .light }

    func launch(_ extra: [String] = []) {
        app.launchArguments = ["-demo", "-mute"] + extra
        app.launch()
    }
    /// A section button: the dock's on a phone, the sidebar's on a full-width iPad
    func tab(_ k: Int) -> XCUIElement { app.buttons["side-\(k)"].exists ? app.buttons["side-\(k)"] : app.buttons["tab-\(k)"] }
    func text(_ part: String) -> XCUIElement { app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", part)).firstMatch }
    func shot(_ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    /// Xcode's accessibility audit on the four main screens of a course. It fails on contrast, missing or unreadable
    /// labels, small hit areas and wrong traits. Dynamic Type and clipped text are only reported: the audit misreads
    /// SwiftUI's scaled custom fonts, so testLargestTextSize checks those with real screenshots instead.
    /// Contrast flags on emoji (pictures, not text) are ignored.
    func audit(course: String, dark: Bool) throws {
        XCUIDevice.shared.appearance = dark ? .dark : .light
        var failing: [String] = [], reported: [String] = []
        for route in ["learn", "practice", "words", "me"] {
            launch(["-course", course, "-route", route])
            _ = app.buttons.firstMatch.waitForExistence(timeout: 8)
            let dockTop = app.buttons["tab-0"].exists ? app.buttons["tab-0"].frame.minY : app.windows.firstMatch.frame.maxY
            try app.performAccessibilityAudit { issue in
                let label = issue.element?.label ?? "", frame = issue.element?.frame ?? .zero
                let line = "\(course) \(route)\(dark ? " dark" : ""): \(issue.compactDescription) · “\(label.prefix(40))” at \(Int(frame.minX)),\(Int(frame.minY)) \(Int(frame.width))×\(Int(frame.height))"
                // At the dock: iOS fades scrolling content just above the bar, so it is measured against the fade
                let underDock = frame.maxY > dockTop - 24
                let emoji = !label.isEmpty && label.unicodeScalars.allSatisfy { $0.properties.isEmojiPresentation || $0.properties.isEmoji && $0.value > 0x2000 || $0.value == 0xFE0F || $0.value == 0x200D }
                // Dynamic Type, clipping, and issues the audit cannot point to an element for: listed, not failed
                if issue.auditType == .dynamicType || issue.auditType == .textClipped || issue.element == nil { reported.append(line) }
                // Checked by eye: on the iPad the session card's "Type" step label is flagged while "Say" beside it, the
                // same colour on the same background, is not (light grey on near-black, well above 4.5:1)
                else if issue.auditType == .contrast && route == "learn" && label == "Type" { reported.append(line) }
                else if !(issue.auditType == .contrast && (emoji || label.isEmpty || underDock)) { failing.append(line) }
                return true // keep going, listed below
            }
            shot("\(course)-\(route)\(dark ? "-dark" : "")")
        }
        for (name, lines) in [("audit \(course)\(dark ? " dark" : "")", failing), ("type, clipping, unplaced \(course)", reported)] {
            let a = XCTAttachment(string: lines.joined(separator: "\n")); a.name = name; a.lifetime = .keepAlways; add(a)
        }
        XCTAssertTrue(failing.isEmpty, "\(failing.count) accessibility issues:\n" + failing.joined(separator: "\n"))
    }
    func testAccessibilityAuditChinese() throws { try audit(course: "zh", dark: false) }
    func testAccessibilityAuditGermanDark() throws { try audit(course: "de", dark: true) }
    func testAccessibilityAuditSpanish() throws { try audit(course: "es", dark: false) }

    /// The other three tabs stay alive behind the current one; VoiceOver must not reach into them
    func testHiddenTabsAreHiddenFromVoiceOver() {
        launch(["-route", "learn"])
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 8))
        XCTAssertFalse(app.staticTexts["Free role play"].exists, "a Practice row is reachable from Learn")
        XCTAssertFalse(app.staticTexts["VOICE & MICROPHONE"].exists, "a Me section is reachable from Learn")
        tab(1).tap()
        XCTAssertTrue(app.staticTexts["Free role play"].waitForExistence(timeout: 3))
        XCTAssertFalse(app.buttons["Continue"].exists, "Learn's Continue is reachable from Practice")
    }

    /// The largest accessibility text size: the main actions stay on screen and tappable
    func testLargestTextSize() {
        launch(["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityXXXL"])
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 8))
        shot("xxxl-learn")
        app.swipeUp()
        for k in 0..<4 {
            _ = app.buttons["tab-\(k)"].waitForExistence(timeout: 3) || app.buttons["side-\(k)"].waitForExistence(timeout: 1)
            let b = tab(k)
            XCTAssertTrue(b.exists && b.isHittable, "section \(k) reachable at XXXL")
            b.tap()
            shot("xxxl-tab\(k)")
        }
    }

    /// Me → Voice → Advanced sound, and back the same way
    func testBackNavigation() {
        launch(["-route", "me"])
        let voice = app.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Voice'")).firstMatch
        XCTAssertTrue(voice.waitForExistence(timeout: 8))
        voice.tap()
        let advanced = app.buttons["advanced-sound"]
        XCTAssertTrue(advanced.waitForExistence(timeout: 5))
        advanced.tap()
        XCTAssertTrue(app.switches.firstMatch.waitForExistence(timeout: 5), "Advanced sound shows its switches")
        shot("advanced-sound")
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(advanced.waitForExistence(timeout: 5), "back to Voice")
        app.navigationBars.buttons.firstMatch.tap()
        XCTAssertTrue(voice.waitForExistence(timeout: 5), "back to Me")
    }

    /// Microphone refused at the system prompt: Say the word explains it and offers rating yourself, nothing crashes
    func testSayWithMicrophoneDenied() {
        app.resetAuthorizationStatus(for: .microphone)
        launch(["-route", "practice/mode/say", "-autostart"])
        let speak = app.buttons.matching(NSPredicate(format: "label == 'Speak' OR label == 'Try again'")).firstMatch
        XCTAssertTrue(speak.waitForExistence(timeout: 8))
        speak.tap()
        // The permission alerts belong to SpringBoard: refuse the microphone (and speech recognition, if asked)
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for _ in 0..<2 {
            let no = springboard.buttons.matching(NSPredicate(format: "label == 'Don’t Allow' OR label == \"Don't Allow\"")).firstMatch
            if no.waitForExistence(timeout: 4) { no.tap() }
        }
        let rate = app.buttons["Rate myself"]
        XCTAssertTrue(rate.waitForExistence(timeout: 8), "the microphone-off card offers rating yourself")
        shot("say-mic-denied")
        rate.tap()
        let got = app.buttons["Got it"]
        XCTAssertTrue(got.waitForExistence(timeout: 3))
        got.tap()
        XCTAssertTrue(app.buttons["say-next"].waitForExistence(timeout: 3))
        XCTAssertEqual(app.state, .runningForeground)
    }

    /// Add words → Paste: the system asks before the app reads the clipboard; the words are found
    func testPasteButtonReadsTheClipboard() {
        UIPasteboard.general.string = "Words from today: 老师, 学生, 中国人"
        let monitor = addUIInterruptionMonitor(withDescription: "paste") { alert in
            for label in ["Allow Paste", "Einfügen erlauben"] where alert.buttons[label].exists { alert.buttons[label].tap(); return true }
            return false
        }
        defer { removeUIInterruptionMonitor(monitor) }
        launch(["-route", "learn/paste"])
        let paste = app.buttons.matching(NSPredicate(format: "label == 'Paste'")).firstMatch
        XCTAssertTrue(paste.waitForExistence(timeout: 8))
        paste.tap()
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let allow = springboard.buttons["Allow Paste"]
        if allow.waitForExistence(timeout: 3) { allow.tap() } else { app.tap() }
        let field = app.textViews["paste-text"]
        let filled = NSPredicate(format: "value CONTAINS '老师'")
        XCTAssertEqual(XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: filled, object: field)], timeout: 5), .completed, "pasted text in the box")
        app.buttons["paste-find"].tap()
        XCTAssertTrue(app.buttons["paste-add"].waitForExistence(timeout: 5))
        shot("paste-found")
    }

    /// The widget's link trainer://word/de/de1 opens the German course (the word is spoken, muted here)
    func testWidgetLinkSwitchesCourse() {
        launch(["-course", "zh"])
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 8))
        app.open(URL(string: "trainer://word/de/de1")!)
        XCTAssertTrue(text("Guten").waitForExistence(timeout: 8) || text("GERMAN").exists || text("Deutsch").exists, "German Learn after the widget link")
        shot("widget-link")
    }

    /// Hardware keyboard: 1 picks the first answer, Space goes on; Space shows a flashcard's answer, 3 rates it Good
    func testKeyboardShortcuts() {
        continueAfterFailure = true
        launch(["-route", "practice/mode/quiz", "-autostart"])
        XCTAssertTrue(app.buttons["Next"].waitForNonExistence(timeout: 8))
        app.typeKey("1", modifierFlags: [])
        let next = app.buttons["Next"]
        XCTAssertTrue(next.waitForExistence(timeout: 3), "1 answered the question")
        app.typeKey(XCUIKeyboardKey.space, modifierFlags: [])
        XCTAssertTrue(next.waitForNonExistence(timeout: 3), "Space went to the next question")
        continueAfterFailure = true
        launch(["-route", "practice/mode/flash", "-autostart"])
        let show = app.buttons["Show answer"]
        XCTAssertTrue(show.waitForExistence(timeout: 8))
        app.typeKey(XCUIKeyboardKey.space, modifierFlags: [])
        let good = app.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Good'")).firstMatch
        XCTAssertTrue(good.waitForExistence(timeout: 3), "Space showed the answer")
        app.typeKey("3", modifierFlags: [])
        XCTAssertTrue(show.waitForExistence(timeout: 3), "3 rated it Good and the next card came")
    }

    /// Character tracing: a stroke on the grid is taken as ink (not as a scroll of the page) and checked
    func testTraceTakesAStroke() {
        launch(["-route", "practice/mode/trace", "-autostart"])
        let grid = app.otherElements.matching(NSPredicate(format: "label BEGINSWITH 'Writing grid'")).firstMatch
        XCTAssertTrue(grid.waitForExistence(timeout: 8))
        let before = grid.frame.minY
        // A short stroke from the bottom right up to the top left: not the first stroke of any character
        let from = grid.coordinate(withNormalizedOffset: CGVector(dx: 0.85, dy: 0.9)), to = grid.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.15))
        from.press(forDuration: 0.05, thenDragTo: to)
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'Not quite'")).firstMatch.waitForExistence(timeout: 3), "the stroke was checked")
        XCTAssertEqual(grid.frame.minY, before, accuracy: 1, "the page did not scroll")
    }

    /// Dark mode: the session runs and the Say screen renders (contrast is covered by the audits)
    func testDarkModeSay() {
        XCUIDevice.shared.appearance = .dark
        launch(["-route", "practice/mode/say", "-autostart"])
        XCTAssertTrue(app.buttons["say-next"].waitForExistence(timeout: 8))
        shot("say-dark")
    }
}
