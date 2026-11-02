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

    var body: some View {
        // The dock sits below the content (not over it), so every screen scrolls all the way to its end
        VStack(spacing: 0) {
            ZStack {
                // All four stay alive, so each keeps its place when you switch
                ForEach(Tab.allCases, id: \.self) { t in
                    stack(t).opacity(tab == t ? 1 : 0).allowsHitTesting(tab == t).accessibilityHidden(tab != t)
                }
            }
            if (paths[tab] ?? NavigationPath()).isEmpty && !keyboard { Dock(tab: $tab, paths: $paths) }
        }
        .id(store.course.id) // a new look: everything is drawn afresh
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
        .onAppear { openLaunchRoute(); openPending() }
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
            .navigationDestination(for: Route.self) { r in destination(r) }
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
        case "dialogues": p.append(Route.dialogues)
        case "lesson": if let id = store.state.lessons(course: store.course.id).last?.id { p.append(Route.lesson(id)) }
        case "sounds": p.append(Route.sounds)
        case "drill": p.append(Route.soundDrill)
        case "progress": p.append(Route.progress)
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
                    VStack(spacing: 2) {
                        Text(Look.current.tabs[k]).hanziFont(20, on ? .semibold : .regular).foregroundStyle(on ? Color.accent : Color.ink2)
                        Text(names[k]).font(.caption2.weight(on ? .bold : .regular)).foregroundStyle(on ? Color.ink : Color.ink2)
                    }
                    .frame(maxWidth: .infinity, minHeight: 50).contentShape(Rectangle())
                }
                .buttonStyle(.card)
                .accessibilityLabel(names[k])
                .accessibilityAddTraits(on ? [.isSelected, .isButton] : .isButton)
            }
        }
        .padding(.horizontal, 12).padding(.top, 6)
        .background(Color.paper.ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
    }
}
