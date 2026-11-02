import SwiftUI
import LanguageCore

@main
struct LanguageTrainerApp: App {
    @State private var store: Store
    init() { Fonts.register(); _store = State(initialValue: Store()) }
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .tint(.accent)
                // First launch: the welcome (course, level, voice, microphone, daily plan)
                .fullScreenCover(isPresented: Binding(get: { store.state.settings.onboarded == nil }, set: { _ in })) {
                    Onboarding().environment(store).tint(.accent)
                }
        }
        .onChange(of: phase) { _, p in
            if p == .active { store.speaker.reloadVoices(); store.voiceCheck += 1 }
            if p == .background { store.flushSave() }
            if p == .active || store.device.dirty { Task { await store.syncNow() } }
        }
    }
}

enum Tab: String, CaseIterable { case learn, practice, words, me }

/* The app's frame: four sections in a flat dock (from the style canvas) — Learn, Practice, Words, Me —
 * labelled in the language being learnt. The dock shows on the four main screens and steps aside
 * inside exercises and while typing. */
struct RootView: View {
    @Environment(Store.self) var store
    @State private var tab = Tab.learn
    @State private var paths: [Tab: NavigationPath] = [:]
    @State private var keyboard = false
    @Environment(\.horizontalSizeClass) private var hSize

    var body: some View {
        // iPad at full width: a sidebar on the left, as on the web on a Mac. Phones and narrow windows (Split View,
        // Slide Over): the dock below the content (not over it), so every screen scrolls all the way to its end
        HStack(spacing: 0) {
            if hSize == .regular {
                Sidebar(tab: $tab, paths: $paths)
                Rectangle().fill(Color.line).frame(width: 1).ignoresSafeArea()
            }
            VStack(spacing: 0) {
                ZStack {
                    // All four stay alive, so each keeps its place when you switch
                    ForEach(Tab.allCases, id: \.self) { t in
                        // Hidden tabs are disabled too, so a keyboard shortcut cannot reach an exercise left open there
                        stack(t).opacity(tab == t ? 1 : 0).allowsHitTesting(tab == t).disabled(tab != t)
                    }
                }
                if hSize != .regular && (paths[tab] ?? NavigationPath()).isEmpty && !keyboard { Dock(tab: $tab, paths: $paths) }
            }
        }
        .id(store.course.id) // a new look: everything is drawn afresh
        .environment(\.openRoute) { r in var p = paths[tab] ?? NavigationPath(); p.append(r); paths[tab] = p }
        .overlay(alignment: .bottom) {
            if let msg = store.toastText {
                Text(msg).font(.subheadline.weight(.medium)).padding(.horizontal, 16).padding(.vertical, 10)
                    .background(.thinMaterial, in: Capsule()).padding(.bottom, 90).transition(.opacity)
                    .allowsHitTesting(false)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: store.toastText)
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)) { _ in keyboard = true }
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in keyboard = false }
        .onAppear { openLaunchRoute(); openPending(); if Launch.has("-soundcheck") { store.speaker.soundCheck() } }
        .onReceive(NotificationCenter.default.publisher(for: IntentRouter.notice)) { _ in openPending() }
        .onOpenURL { url in // widgets: trainer://word/<course>/<id> plays the word of the day
            let p = url.pathComponents.filter { $0 != "/" }
            if url.host == "word", p.count == 2, let w = Library.shared.word(p[1]) { if store.course.id != p[0] { store.switchCourse(p[0]) }; store.speaker.say(w.hz) }
        }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in writeWidgetSnapshot() }
    }

    func path(_ t: Tab) -> Binding<NavigationPath> {
        Binding(get: { paths[t] ?? NavigationPath() }, set: { paths[t] = $0 })
    }

    func stack(_ t: Tab) -> some View {
        NavigationStack(path: path(t)) {
            Group {
                switch t {
                case .learn: LearnView(path: path(.learn))
                case .practice: PracticeHome().navigationTitle(store.t("train"))
                case .words: WordsView().navigationTitle(store.t("words") + " · " + store.levelLabel)
                case .me: MeView()
                }
            }
            // Hidden inside the stack: on the NavigationStack itself it does not reach VoiceOver
            .accessibilityHidden(tab != t)
            // Exercises and other pushed screens: a readable column, centred on an iPad
            .navigationDestination(for: Route.self) { r in
                destination(r).frame(maxWidth: 720).frame(maxWidth: .infinity).background(Color.paper).accessibilityHidden(tab != t)
            }
            .background(Color.paper)
        }
    }

    @ViewBuilder func destination(_ r: Route) -> some View {
        switch r {
        case .mode(let m): PracticeScreen(mode: m)
        case .today: FlowScreen(lessonId: nil)
        case .lesson(let id): LessonEditor(path: path(tab), lid: id)
        case .lessonPractice(let id): FlowScreen(lessonId: id)
        case .dialogue(let id): DialogueScreen(id: id)
        case .dialogues: DialoguesScreen()
        case .dialogueTurn(let id): DialogueScreen(id: id, start: "turn")
        case .myLessons: LessonsScreen(path: path(tab))
        case .sounds: SoundChart()
        case .soundDrill: SoundDrillScreen()
        case .progress: StatsView()
        case .families: FamiliesScreen()
        case .family(let id): FamilyScreen(id: id)
        case .familyQuiz(let id): FamilyQuiz(familyId: id)
        case .paste(let lid): PasteScreen(path: path(tab), lid: lid)
        }
    }

    /// For screenshots and testing: -route practice/mode/say opens that screen
    func openLaunchRoute() {
        let args = ProcessInfo.processInfo.arguments
        guard let k = args.firstIndex(of: "-route"), k + 1 < args.count else { return }
        open(args[k + 1])
    }
    /// Siri and Shortcuts (Quiz me on …) leave a course and a route here
    func openPending() {
        guard let r = IntentRouter.shared.take() else { return }
        if store.course.id != r.course { store.switchCourse(r.course) }
        DispatchQueue.main.async { open(r.route) }
    }
    /// Streak and due words for the widgets, only where an App Group is set up
    func writeWidgetSnapshot() {
        let due = store.words.selected.filter { store.state.isDue($0.id) }.count
        WidgetSnapshot(course: store.course.id, streak: store.state.streak(), due: due, day: todayKey(nowMs())).write()
    }
    func open(_ spec: String) {
        let parts = spec.split(separator: "/").map(String.init)
        let alias = ["today": "learn", "lessons": "learn", "settings": "me"]
        guard let t = Tab(rawValue: alias[parts[0]] ?? parts[0]) else { return }
        tab = t
        var p = NavigationPath()
        switch parts.dropFirst().first {
        case "session": p.append(Route.today)
        case "mode": if let m = parts.count > 2 ? Mode(rawValue: parts[2]) : nil { p.append(Route.mode(m)) }
        case "dialogue": if parts.count > 2 { p.append(Route.dialogue(parts[2])) }
        case "lessons": p.append(Route.myLessons)
        case "paste": p.append(Route.myLessons); p.append(Route.paste(nil))
        case "dialogues": p.append(Route.dialogues)
        case "lesson": if let id = store.state.lessons(course: store.course.id).last?.id { p.append(Route.lesson(id)) }
        case "sounds": p.append(Route.sounds)
        case "drill": p.append(Route.soundDrill)
        case "progress": p.append(Route.progress)
        case "families": p.append(Route.families); if parts.count > 2 { if let k = Int(parts[2]) { p.append(Route.family(k)) } else if parts[2] == "quiz" { p.append(Route.familyQuiz(nil)) } }
        default: break
        }
        paths[t] = p
    }
}

/// The flat dock: the section's word in the language, its name below; tapping the current one goes back to its start
struct Dock: View {
    @Environment(Store.self) var store
    @Binding var tab: Tab
    @Binding var paths: [Tab: NavigationPath]
    var body: some View {
        let names = [store.t("learn"), store.t("train"), store.t("words"), store.t("me")]
        HStack(spacing: 0) {
            ForEach(Array(Tab.allCases.enumerated()), id: \.offset) { k, t in
                let on = tab == t
                Button {
                    if on { paths[t] = NavigationPath() }
                    tab = t
                } label: {
                    if Look.current.latinTabs { // German and Spanish: the word in the language under a bar, English small below
                        VStack(spacing: 2) {
                            Rectangle().fill(on ? Color.action : Color.clear).frame(width: 28, height: 3).padding(.bottom, 4)
                            Text(Look.current.tabs[k]).scaledFont(14, on ? .bold : .regular).foregroundStyle(on ? Color.ink : Color.ink2).lineLimit(1).minimumScaleFactor(0.8)
                            if names[k] != Look.current.tabs[k] { Text(names[k]).font(.caption2).foregroundStyle(Color.ink2) }
                        }
                        .frame(maxWidth: .infinity, minHeight: 50, alignment: .top).contentShape(Rectangle())
                    } else {
                        VStack(spacing: 2) {
                            Text(Look.current.tabs[k]).hanziFont(20, on ? .semibold : .regular).foregroundStyle(on ? Color.accent : Color.ink2)
                            Text(names[k]).font(.caption2.weight(on ? .bold : .regular)).foregroundStyle(on ? Color.ink : Color.ink2)
                        }
                        .frame(maxWidth: .infinity, minHeight: 50).contentShape(Rectangle())
                    }
                }
                .buttonStyle(.card)
                .accessibilityLabel(names[k])
                .accessibilityAddTraits(on ? [.isSelected, .isButton] : .isButton)
                .accessibilityIdentifier("tab-\(k)")
                .accessibilityShowsLargeContentViewer { Text(names[k]) }
            }
        }
        .padding(.horizontal, 12).padding(.top, 6)
        .dynamicTypeSize(...DynamicTypeSize.xxLarge)
        .background(Color.paper.ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
    }
}

/// iPad sidebar: the course on top (tap to switch), the four sections in the language's look, then My lessons and
/// Dialogues as places of their own, and the streak at the bottom
struct Sidebar: View {
    @Environment(Store.self) var store
    @Binding var tab: Tab
    @Binding var paths: [Tab: NavigationPath]
    @State private var place: Route? // My lessons or Dialogues, opened from here
    @State private var showCourses = false
    var body: some View {
        let names = [store.t("learn"), store.t("train"), store.t("words"), store.t("me")]
        VStack(alignment: .leading, spacing: 4) {
            Button { showCourses = true } label: {
                HStack(spacing: 10) {
                    Text(store.course.glyph).hanziFont(20, .semibold).foregroundStyle(Color.accent)
                        .frame(width: 40, height: 40).overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(Color.accent, lineWidth: 1.5))
                    VStack(alignment: .leading, spacing: 1) {
                        Text(store.course.name).font(.headline).foregroundStyle(Color.ink).lineLimit(1)
                        Text(store.levelLabel).font(.caption).foregroundStyle(Color.ink2).lineLimit(1)
                    }
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.up.chevron.down").font(.caption).foregroundStyle(Color.ink3)
                }
                .padding(10).background(Color.elevated, in: RoundedRectangle(cornerRadius: Look.current.radius + 2))
                .overlay(RoundedRectangle(cornerRadius: Look.current.radius + 2).stroke(Color.line))
            }
            .buttonStyle(.card).accessibilityHint(store.t("switchCourse")).padding(.bottom, 14)
            ForEach(Array(Tab.allCases.enumerated()), id: \.offset) { k, t in
                item(on: tab == t && place == nil, glyph: Look.current.tabs[k], symbol: ["sun.max", "target", "list.bullet", "person"][k], title: names[k], id: "side-\(k)") {
                    // Tapping the current section goes back to its start. My lessons and Dialogues live inside Learn,
                    // so leaving them from here closes them, and Learn shows Learn again.
                    if place != nil { paths[.learn] = NavigationPath() }
                    else if tab == t { paths[t] = NavigationPath() }
                    tab = t; place = nil
                }
            }
            Divider().padding(.vertical, 8)
            item(on: place == .myLessons, glyph: nil, symbol: "text.book.closed", title: store.t("myLessons"), id: "side-lessons") { open(.myLessons) }
            lessonDrops
            item(on: place == .dialogues, glyph: nil, symbol: "bubble.left.and.bubble.right", title: store.t("dialogues"), id: "side-dialogues") { open(.dialogues) }
            Spacer()
            Text(store.t("streakDays", store.state.streak())).font(.footnote.weight(.semibold)).foregroundStyle(Color.accent).padding(.horizontal, 12)
        }
        .padding(.horizontal, 12).padding(.vertical, 16)
        .frame(width: 250)
        .background(Color.paper)
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium, .large]) }
    }
    /// The newest lessons under My lessons: tap to open, drop a word tile from Words onto one to add it
    var lessonDrops: some View {
        ForEach(store.state.lessons(course: store.course.id).suffix(4).reversed(), id: \.id) { l in
            LessonDropRow(name: l.lesson.name, count: l.lesson.words.count) { open(.lesson(l.id)) } drop: { texts in
                let ids = texts.compactMap { t in store.words.selected.first { $0.hz == t }?.id ?? store.state.customWords(course: store.course.id).first { $0.hz == t }?.id }
                let new = ids.filter { !l.lesson.words.contains(WordRef($0)) }
                guard !new.isEmpty else { return false }
                store.update { s in new.forEach { s.toggleLessonWord(l.id, $0) } }
                store.toast(store.t("added"))
                return true
            }
        }
    }
    /// My lessons and Dialogues live under Learn, as on the web
    func open(_ r: Route) {
        var p = NavigationPath(); p.append(r)
        paths[.learn] = p; tab = .learn; place = r
    }
    func item(on: Bool, glyph: String?, symbol: String?, title: String, id: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Group {
                    if let glyph, !Look.current.latinTabs, glyph != title { Text(glyph).hanziFont(18, on ? .semibold : .regular) }
                    else { Image(systemName: symbol ?? "circle").font(.body) }
                }
                .foregroundStyle(on ? Color.accent : Color.ink2).frame(width: 28)
                VStack(alignment: .leading, spacing: 0) {
                    Text(Look.current.latinTabs && glyph != nil ? glyph! : title).font(.body.weight(on ? .semibold : .regular)).foregroundStyle(Color.ink)
                    if Look.current.latinTabs, let glyph, glyph != title { Text(title).font(.caption).foregroundStyle(Color.ink2) }
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 12).padding(.vertical, 9).frame(maxWidth: .infinity, alignment: .leading)
            .background(on ? Color.accent.opacity(0.1) : Color.clear, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
            .contentShape(Rectangle())
        }
        .buttonStyle(.card)
        .accessibilityAddTraits(on ? [.isSelected, .isButton] : .isButton)
        .accessibilityIdentifier(id)
    }
}

/// A lesson in the sidebar that takes dropped words; it lights up while a word is held over it
struct LessonDropRow: View {
    let name: String, count: Int
    let tap: () -> Void
    let drop: ([String]) -> Bool
    @State private var over = false
    var body: some View {
        Button(action: tap) {
            HStack(spacing: 8) {
                Text(name).font(.subheadline).foregroundStyle(Color.ink).lineLimit(1)
                Spacer(minLength: 4)
                Text("\(count)").font(.caption.monospacedDigit()).foregroundStyle(Color.ink2)
            }
            .padding(.leading, 52).padding(.trailing, 12).padding(.vertical, 6).frame(maxWidth: .infinity, minHeight: 36, alignment: .leading)
            .background(over ? Color.accent.opacity(0.15) : Color.clear, in: RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)))
            .overlay(RoundedRectangle(cornerRadius: max(2, Look.current.radius - 2)).stroke(over ? Color.accent : Color.clear, lineWidth: 1.5))
            .contentShape(Rectangle())
        }
        .buttonStyle(.card)
        .dropDestination(for: String.self) { items, _ in drop(items) } isTargeted: { over = $0 }
    }
}
