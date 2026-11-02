import XCTest

/// iPad layout: the sidebar instead of the dock, two-column Learn and the word pane in landscape.
/// Skipped on iPhone. Runs with the demo learner (-demo) and silent speech (-mute).
final class IPadTests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        try XCTSkipUnless(UIDevice.current.userInterfaceIdiom == .pad, "iPad only")
        continueAfterFailure = false
        app = XCUIApplication()
        XCUIDevice.shared.orientation = .portrait
    }
    override func tearDown() { XCUIDevice.shared.orientation = .portrait }

    func launch(_ extra: [String] = []) {
        app.launchArguments = ["-demo", "-mute"] + extra
        app.launch()
    }
    func shot(_ name: String) {
        let a = XCTAttachment(screenshot: app.screenshot()); a.name = name; a.lifetime = .keepAlways; add(a)
    }

    /// The sidebar replaces the dock; My lessons and Dialogues open from it, a section tap goes back
    func testSidebarNavigation() {
        launch()
        XCTAssertTrue(app.buttons["side-0"].waitForExistence(timeout: 8))
        XCTAssertFalse(app.buttons["tab-0"].exists, "no dock next to the sidebar")
        app.buttons["side-lessons"].tap()
        XCTAssertTrue(app.staticTexts["My lessons"].waitForExistence(timeout: 5))
        app.buttons["side-dialogues"].tap()
        XCTAssertTrue(app.staticTexts["Dialogues"].waitForExistence(timeout: 5))
        app.buttons["side-2"].tap()
        XCTAssertTrue(app.textFields.firstMatch.waitForExistence(timeout: 5), "Words with its search field")
        app.buttons["side-0"].tap()
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 5), "Learn again")
        shot("sidebar-portrait")
    }

    /// Landscape: Learn on two columns, a word opens in the pane beside the tiles (no sheet)
    func testLandscapeLayouts() {
        XCUIDevice.shared.orientation = .landscapeLeft
        launch()
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 8))
        shot("learn-landscape")
        // Two columns: the word of the day sits beside the session card, not below it
        let cont = app.buttons["Continue"].frame
        let wod = app.staticTexts.matching(NSPredicate(format: "label ==[c] 'WORD OF THE DAY'")).firstMatch
        XCTAssertTrue(wod.exists)
        XCTAssertGreaterThan(wod.frame.minX, cont.maxX - 10, "word of the day in the right column")
        app.buttons["side-2"].tap()
        let tile = app.buttons.matching(NSPredicate(format: "label CONTAINS 'goodbye'")).firstMatch
        XCTAssertTrue(tile.waitForExistence(timeout: 5))
        tile.tap()
        let add = app.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Add to a lesson'")).firstMatch
        XCTAssertTrue(add.waitForExistence(timeout: 3))
        XCTAssertGreaterThan(add.frame.minX, tile.frame.maxX, "the word opens in the pane on the right")
        shot("words-landscape")
        // Exercises stay a readable column
        app.buttons["side-1"].tap()
        launch(["-route", "practice/mode/say", "-autostart"])
        XCTAssertTrue(app.buttons["say-next"].waitForExistence(timeout: 8))
        XCTAssertLessThanOrEqual(app.buttons["say-next"].frame.maxX - app.buttons["Skip"].frame.minX, 730)
        shot("say-landscape")
    }

    /// The accessibility audit on the iPad layout (same rules as PlatformTests)
    func testAccessibilityAuditIPad() throws {
        for route in ["learn", "practice", "words", "me"] {
            launch(["-route", route])
            _ = app.buttons.firstMatch.waitForExistence(timeout: 8)
            var failing: [String] = []
            try app.performAccessibilityAudit { issue in
                let label = issue.element?.label ?? ""
                let emoji = !label.isEmpty && label.unicodeScalars.allSatisfy { $0.properties.isEmojiPresentation || $0.value == 0xFE0F || $0.value == 0x200D }
                if issue.auditType == .dynamicType || issue.auditType == .textClipped || issue.element == nil { return true }
                if issue.auditType == .contrast && (emoji || label.isEmpty) { return true }
                failing.append("\(route): \(issue.compactDescription) · “\(label.prefix(40))”")
                return true
            }
            XCTAssertTrue(failing.isEmpty, failing.joined(separator: "\n"))
        }
    }
}
