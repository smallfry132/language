import Foundation
// Builds web/js/pinyin-chars.js: the reading of the 3,755 most common characters (GB2312 level 1), from the system's
// Mandarin → Latin transform (ICU), for the Heard line when a character is outside the word lists.
let enc = String.Encoding(rawValue: CFStringConvertEncodingToNSStringEncoding(CFStringEncoding(CFStringEncodings.GB_18030_2000.rawValue)))
var pairs: [String] = []
for hi in 0xB0...0xD7 {
    for lo in 0xA1...0xFE {
        if hi == 0xD7 && lo > 0xF9 { break }
        guard let ch = String(data: Data([UInt8(hi), UInt8(lo)]), encoding: enc), ch.count == 1,
              let py = ch.applyingTransform(.mandarinToLatin, reverse: false), py != ch else { continue }
        pairs.append(ch + py)
    }
}
// One string, each entry the character followed by its reading, entries separated by spaces
let body = pairs.joined(separator: " ")
let js = "/* Readings of the 3,755 most common Chinese characters (GB2312 level 1), generated with the system's ICU\n * Mandarin → Latin transform (tools/pinyin-chars.swift). Used only to read back what a speech recogniser wrote. */\nwindow.PINYIN_CHARS = \"\(body)\";\n"
try! js.write(toFile: CommandLine.arguments[1], atomically: true, encoding: .utf8)
print(pairs.count)
