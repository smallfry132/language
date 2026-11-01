import Foundation

/* Sync, as in the web app (js/app.js, "Change stamps" and "Sync").
 * save() compares the state with a snapshot of the last save and stamps what changed: entries of the
 * keyed maps get their own time `t` (a removed entry becomes { gone: 1, t }), whole-value fields get a
 * time in mt. Devices merge by these times, newest wins. Stats are counted per device. */

let sortedEncoder: JSONEncoder = { let e = JSONEncoder(); e.outputFormatting = [.sortedKeys]; return e }()
func json<T: Encodable>(_ v: T) -> String { (try? sortedEncoder.encode(v)).flatMap { String(data: $0, encoding: .utf8) } ?? "" }
func entryJson<E: SyncEntry>(_ e: E) -> String { var x = e; x.t = nil; return json(x) }

public enum SyncFields {
    /// Whole-value fields, newest wins (the current course stays per device)
    public static let lww = ["favs", "settings", "courses", "typer", "lang"]
}

public struct Snapshot {
    var lww: [String: String] = [:]
    var srs: [String: String] = [:], lessons: [String: String] = [:], custom: [String: String] = [:], dlg: [String: String] = [:]
    var stats = ""

    public init(_ s: AppState) {
        for f in SyncFields.lww { lww[f] = s.lwwJson(f) }
        srs = s.srs.mapValues(entryJson); lessons = s.lessons.mapValues(entryJson)
        custom = s.custom.mapValues(entryJson); dlg = s.dlg.mapValues(entryJson)
        stats = json(s.stats)
    }
}

extension AppState {
    func lwwJson(_ f: String) -> String {
        switch f {
        case "favs": return json(favs)
        case "settings": return json(settings.synced)
        case "courses": return json(courses)
        case "typer": return json(typer)
        default: return json(lang)
        }
    }

    /// Stamps everything that changed since the snapshot. Returns true when something did.
    public mutating func stamp(_ snap: inout Snapshot, now: Double = nowMs()) -> Bool {
        var changed = false
        let sj = json(stats)
        if sj != snap.stats { snap.stats = sj; changed = true } // device-own counts, merged per device
        for f in SyncFields.lww {
            let j = lwwJson(f)
            if j != snap.lww[f] { mt[f] = now; snap.lww[f] = j; changed = true }
        }
        func stampMap<E: SyncEntry>(_ cur: inout [String: E], _ old: inout [String: String]) {
            for (id, e) in cur {
                let j = entryJson(e)
                if j != old[id] { cur[id]!.t = now; old[id] = j; changed = true }
            }
            for id in old.keys where cur[id] == nil {
                cur[id] = E.tombstone(now); old[id] = entryJson(cur[id]!); changed = true
            }
        }
        stampMap(&srs, &snap.srs); stampMap(&lessons, &snap.lessons); stampMap(&custom, &snap.custom); stampMap(&dlg, &snap.dlg)
        return changed
    }
}

/// The document on the server: one per sync code
public struct SyncDoc: Codable {
    public var mt: [String: Double]?
    public var settings: Settings?
    public var stats: [String: Stats]?
    public var favs: [WordRef]?
    public var courses: [String: CourseState]?
    public var typer: [String: Int]?
    public var lang: String?
    public var srs: [String: Card]?
    public var lessons: [String: Lesson]?
    public var custom: [String: CustomWord]?
    public var dlg: [String: DialogueProgress]?

    public init(state s: AppState, device: String) {
        mt = s.mt; settings = s.settings.synced
        var st = s.peers; st[device] = s.stats; stats = st
        favs = s.favs; courses = s.courses; typer = s.typer; lang = s.lang
        srs = s.srs; lessons = s.lessons; custom = s.custom; dlg = s.dlg
    }
}

extension AppState {
    /// Merges a pulled document. Returns true when this device has something the server lacks.
    public mutating func merge(_ d: SyncDoc, device: String) -> Bool {
        var ahead = false
        let rmt = d.mt ?? [:]
        for f in SyncFields.lww {
            let theirs = rmt[f] ?? 0, mine = mt[f] ?? 0
            if theirs > mine {
                switch f {
                case "favs": favs = d.favs ?? []
                case "settings": let v = settings.voices; settings = d.settings ?? Settings(); settings.voices = v
                case "courses": if let c = d.courses { courses = c; for c in Course.all where (courses[c.id]?.levels ?? []).isEmpty { courses[c.id] = CourseState() } }
                case "typer": typer = d.typer
                default: lang = d.lang ?? lang
                }
                mt[f] = theirs
            } else if mine > theirs { ahead = true }
        }
        func mergeMap<E: SyncEntry>(_ mine: inout [String: E], _ theirs: [String: E]?) {
            let theirs = theirs ?? [:]
            for (id, e) in theirs {
                if let m = mine[id], (e.t ?? 0) <= (m.t ?? 0) { continue }
                mine[id] = e
            }
            for (id, m) in mine where theirs[id] == nil || (m.t ?? 0) > (theirs[id]!.t ?? 0) { ahead = true }
        }
        mergeMap(&srs, d.srs); mergeMap(&lessons, d.lessons); mergeMap(&custom, d.custom); mergeMap(&dlg, d.dlg)
        // Stats: each device reports its own counts; a reset anywhere drops the counts from before it
        let reset = max(mt["statsReset"] ?? 0, rmt["statsReset"] ?? 0)
        if reset > (rmt["statsReset"] ?? 0) { ahead = true }
        mt["statsReset"] = reset > 0 ? reset : nil
        if stats.since < reset { stats = Stats(since: reset) }
        let theirStats = d.stats ?? [:]
        peers = theirStats.filter { $0.key != device && $0.value.since >= reset }
        if theirStats[device] != stats { ahead = true }
        return ahead
    }
}

/// Sync codes: 4 groups of 5 from 32 unambiguous characters (100 bits), easy to read out and type
public enum SyncCode {
    static let abc = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
    public static func make() -> String {
        var g = SystemRandomNumberGenerator()
        let s = String((0..<20).map { _ in abc[Int(g.next() % 32)] })
        return stride(from: 0, to: 20, by: 5).map { i in String(s.dropFirst(i).prefix(5)) }.joined(separator: "-")
    }
    public static func parse(_ s: String) -> String? {
        let c = s.uppercased().filter { $0.isLetter || $0.isNumber }
        guard c.count == 20, c.allSatisfy({ abc.contains($0) }) else { return nil }
        return stride(from: 0, to: 20, by: 5).map { i in String(c.dropFirst(i).prefix(5)) }.joined(separator: "-")
    }
}
