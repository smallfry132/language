import Foundation

/* Word families (families.json, written for the app on the web side): small sets of words to see side by side.
 * kind: pair (opposites; `whole` is the word the two make together, 大 + 小 → 大小 "size"), tone (the same syllable,
 * another tone), build (one part inside several words), final (Korean: one final consonant differs).
 * A word is matched by its spelling in the course's list (and its reading where given); words missing from the
 * list carry their own reading and meaning and get the id "f:" + spelling. A set needs at least two words. */

/// One entry of a family in the data file: a spelling, or a spelling with its own reading and meaning
public struct FamilyWordRef: Decodable, Sendable {
    public let hz: String
    public let py: String?
    public let en: String?
    public let de: String?
    enum K: String, CodingKey { case hz, py, en, de }
    public init(from d: Decoder) throws {
        if let s = try? d.singleValueContainer().decode(String.self) { hz = s; py = nil; en = nil; de = nil; return }
        let c = try d.container(keyedBy: K.self)
        hz = try c.decode(String.self, forKey: .hz)
        py = try c.decodeIfPresent(String.self, forKey: .py)
        en = try c.decodeIfPresent(String.self, forKey: .en)
        de = try c.decodeIfPresent(String.self, forKey: .de)
    }
}
public struct FamilyData: Decodable, Sendable {
    public let kind: String
    public let words: [FamilyWordRef]
    public let whole: FamilyWordRef?
    public let note: LocalText?
}

/// A family resolved against a course's words
public struct Family: Identifiable, Hashable, Sendable {
    public let id: Int          // position in the data file (stable: used in routes)
    public let kind: String
    public let items: [Word]
    public let whole: Word?
    public let note: LocalText?
    public static func == (a: Family, b: Family) -> Bool { a.id == b.id && a.items.map(\.id) == b.items.map(\.id) }
    public func hash(into h: inout Hasher) { h.combine(id) }
    public static let kinds = ["pair", "tone", "final", "build"]
}

extension Word {
    /// A word that only lives in a family (not in the word list): never graded
    public var isFamilyOnly: Bool { id.hasPrefix("f:") }
}

/// Resolved families per course, computed once (they only change when own words change the list)
final class FamilyCache: @unchecked Sendable {
    static let shared = FamilyCache()
    private let lock = NSLock()
    private var cache: [String: (n: Int, sets: [Family])] = [:]
    func get(_ key: String, n: Int, make: () -> [Family]) -> [Family] {
        lock.lock(); defer { lock.unlock() }
        if let c = cache[key], c.n == n { return c.sets }
        let sets = make(); cache[key] = (n, sets); return sets
    }
}

extension CourseWords {
    /// The course's word families, resolved against its words (cached)
    public var families: [Family] {
        FamilyCache.shared.get(course.id, n: all.count) {
            let raw = Library.shared.families[course.id] ?? []
            // Spellings → words, one pass (Japanese entries may list variants: 伯父; 叔父さん)
            var byHz: [String: [Word]] = [:]
            for w in all where !w.id.hasPrefix("u") {
                byHz[w.hz, default: []].append(w)
                if w.hz.contains(";") { for v in w.hz.split(separator: ";") { byHz[v.trimmingCharacters(in: .whitespaces), default: []].append(w) } }
            }
            func find(_ r: FamilyWordRef) -> Word? {
                if let w = byHz[r.hz]?.first(where: { r.py == nil || $0.py == r.py }) { return w }
                guard let en = r.en else { return nil }
                return Word(id: "f:" + r.hz, hz: r.hz, py: r.py ?? "", en: en, de: r.de, cat: "misc", lvl: 0, course: course.id)
            }
            return raw.enumerated().compactMap { k, f in
                let items = f.words.compactMap(find)
                guard items.count >= 2 else { return nil }
                let whole = f.whole.flatMap(find)
                return Family(id: k, kind: f.kind, items: items, whole: whole, note: f.note)
            }
        }
    }
    /// The families a word belongs to
    public func families(of id: String) -> [Family] { families.filter { f in f.items.contains { $0.id == id } } }
}
