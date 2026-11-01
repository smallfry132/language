import SwiftUI
import LanguageCore

@main
struct LanguageTrainerApp: App {
    @State private var store = Store()
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .tint(.accentRed)
        }
        .onChange(of: phase) { _, p in
            if p == .active || store.device.dirty { Task { await store.syncNow() } }
        }
    }
}

enum Tab: String { case today, lessons, practice, words }

struct RootView: View {
    @Environment(Store.self) var store
    @State private var tab = Tab.today
    @State private var paths: [Tab: NavigationPath] = [:]
    @State private var showSettings = false
    @State private var showCourses = false

    var body: some View {
        TabView(selection: $tab) {
            stack(.today, title: store.t("tabToday"), icon: "sun.max.fill") { TodayView(path: path(.today)) }
            stack(.lessons, title: store.t("lessons"), icon: "book.closed.fill") { LessonsView(path: path(.lessons)) }
            stack(.practice, title: store.t("train"), icon: "dumbbell.fill") { PracticeHome() }
            stack(.words, title: store.t("words"), icon: "square.grid.2x2.fill") { WordsView() }
        }
        .overlay(alignment: .bottom) {
            if let msg = store.toastText {
                Text(msg).font(.subheadline.weight(.medium)).padding(.horizontal, 16).padding(.vertical, 10)
                    .background(.thinMaterial, in: Capsule()).padding(.bottom, 90).transition(.opacity)
                    .allowsHitTesting(false)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: store.toastText)
        .sheet(isPresented: $showSettings) { NavigationStack { SettingsView() }.environment(store) }
        .sheet(isPresented: $showCourses) { CoursePicker().presentationDetents([.medium]) }
        .onAppear { openLaunchRoute() }
    }

    func path(_ t: Tab) -> Binding<NavigationPath> {
        Binding(get: { paths[t] ?? NavigationPath() }, set: { paths[t] = $0 })
    }

    func stack<V: View>(_ t: Tab, title: String, icon: String, @ViewBuilder root: () -> V) -> some View {
        NavigationStack(path: path(t)) {
            root()
                .navigationTitle(t == .words ? title + " · " + store.levelLabel : title)
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        Button { showCourses = true } label: { Text(store.course.glyph).font(.headline).foregroundStyle(Color.accentRed) }
                            .accessibilityLabel(store.t("switchCourse"))
                    }
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showSettings = true } label: { Image(systemName: "gearshape") }.accessibilityLabel(store.t("settings"))
                    }
                }
                .navigationDestination(for: Route.self) { r in destination(r) }
                .background(Color.paper)
        }
        .tabItem { Label(title, systemImage: icon) }
        .tag(t)
    }

    @ViewBuilder func destination(_ r: Route) -> some View {
        switch r {
        case .mode(let m): PracticeScreen(mode: m)
        case .today: FlowScreen(lessonId: nil)
        case .lesson(let id): LessonEditor(path: path(tab), lid: id)
        case .lessonPractice(let id): FlowScreen(lessonId: id)
        case .dialogue(let id): DialogueScreen(id: id)
        case .dialogues: DialoguesScreen()
        case .sounds: SoundChart()
        case .soundDrill: SoundDrillScreen()
        case .progress: StatsView()
        }
    }

    /// For screenshots and testing: -route practice/mode/say opens that screen
    func openLaunchRoute() {
        let args = ProcessInfo.processInfo.arguments
        guard let k = args.firstIndex(of: "-route"), k + 1 < args.count else { return }
        let parts = args[k + 1].split(separator: "/").map(String.init)
        guard let t = Tab(rawValue: parts[0]) else { if parts[0] == "settings" { showSettings = true }; return }
        tab = t
        var p = NavigationPath()
        switch parts.dropFirst().first {
        case "session": p.append(Route.today)
        case "mode": if let m = parts.count > 2 ? Mode(rawValue: parts[2]) : nil { p.append(Route.mode(m)) }
        case "dialogue": if parts.count > 2 { p.append(Route.dialogue(parts[2])) }
        case "lesson": if let id = store.state.lessons(course: store.course.id).last?.id { p.append(Route.lesson(id)) }
        case "sounds": p.append(Route.sounds)
        case "drill": p.append(Route.soundDrill)
        case "progress": p.append(Route.progress)
        default: break
        }
        paths[t] = p
    }
}
