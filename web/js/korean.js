/* Korean: Hangul → Revised Romanization, as it is pronounced (the main sound changes between syllables).
 *   KO.romanize("감사합니다") → "gamsahamnida", KO.romanize("한국어") → "hangugeo"
 *   KO.pronounce("독일") → "도길" (how it is said, in Hangul; the hint shown when it differs from the spelling)
 *   KO.romanize(text, { spelled: true }) → letter by letter, without sound changes ("gamsahapnida")
 * Like the official system, tensing (없어요 eopseoyo) and ㄱㄷㅂ + ㅎ in nouns (백화점 baekhwajeom) are not marked.
 * Used by the app (pronunciation shown under words) and by tools/export-data.mjs (the iPhone app gets it precomputed). */
(function (root) {
  const INI = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
  const VOW = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
  // Final consonants (index 0 = none) as jamo initial indexes: what they sound like when they move to the next syllable
  //            -  ㄱ ㄲ ㄳ   ㄴ ㄵ   ㄶ   ㄷ ㄹ ㄺ   ㄻ   ㄼ   ㄽ   ㄾ   ㄿ   ㅀ   ㅁ ㅂ ㅄ   ㅅ ㅆ ㅇ ㅈ  ㅊ  ㅋ  ㅌ  ㅍ  ㅎ
  const FIN = [[], [0], [1], [0, 9], [2], [2, 12], [2, 18], [3], [5], [5, 0], [5, 6], [5, 7], [5, 9], [5, 16], [5, 17], [5, 18], [6], [7], [7, 9], [9], [10], [-1], [12], [14], [15], [16], [17], [18]];
  // How a final sounds at the end of a syllable (before a consonant or at the end): k n t l m p ng
  const END = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];
  const isSyl = (c) => c >= 0xac00 && c <= 0xd7a3;
  const split = (c) => { const n = c - 0xac00; return { i: Math.floor(n / 588), v: Math.floor((n % 588) / 28), f: n % 28 }; };

  function romanizeWord(word, spelled, opts) {
    const s = Array.from(word).map((ch) => (isSyl(ch.codePointAt(0)) ? split(ch.codePointAt(0)) : ch));
    // Sound changes between neighbouring syllables
    if (!spelled) for (let k = 0; k < s.length - 1; k++) {
      const a = s[k], b = s[k + 1];
      if (typeof a === "string" || typeof b === "string" || !a.f) continue;
      const fin = FIN[a.f];
      if (b.i === 11 && a.f !== 21) { // next syllable starts with a vowel: the final moves over (liaison)
        if (a.f === 27) { a.f = 0; continue; } // ㅎ falls silent
        if (a.f === 6 || a.f === 15) { a.f = a.f === 6 ? 4 : 8; continue; } // ㄶ ㅀ: ㅎ silent, ㄴ/ㄹ stays
        if (fin.length === 2) { b.i = fin[1]; a.f = { 3: 1, 5: 4, 9: 8, 10: 8, 11: 8, 12: 8, 13: 8, 14: 8, 18: 17 }[a.f] ?? 0; continue; }
        b.i = fin[0] === 3 && b.v === 20 ? 12 : fin[0] === 16 && b.v === 20 ? 14 : fin[0]; // 같이 gachi, 굳이 guji
        a.f = 0; continue;
      }
      const end = END[a.f];
      if (a.f === 27 || a.f === 6 || a.f === 15) { // ㅎ + ㄱㄷㅈ → ㅋㅌㅊ
        const asp = { 0: 15, 3: 16, 12: 14 }[b.i];
        if (asp !== undefined) { b.i = asp; a.f = a.f === 27 ? 0 : a.f === 6 ? 4 : 8; continue; }
      }
      if ((b.i === 2 || b.i === 6) && /^[ktp]$/.test(end)) a.f = { k: 21, t: 4, p: 16 }[end]; // nasalization: 합니다 → hamnida
      else if (b.i === 5 && (end === "n")) a.f = 8; // ㄴ + ㄹ → ㄹㄹ
      else if (b.i === 2 && end === "l") b.i = 5; // ㄹ + ㄴ → ㄹㄹ
      else if (b.i === 5 && /^(m|ng|k|p)$/.test(end)) { b.i = 2; if (end === "k") a.f = 21; if (end === "p") a.f = 16; } // ㄹ after ㅁㅇ(ㄱㅂ) → ㄴ
    }
    if (opts && opts.hangul) return s.map((x) => (typeof x === "string" ? x : String.fromCharCode(0xac00 + (x.i * 21 + x.v) * 28 + x.f))).join("");
    let out = "";
    s.forEach((x, k) => {
      if (typeof x === "string") { out += x; return; }
      const prevL = k > 0 && typeof s[k - 1] !== "string" && END[s[k - 1].f] === "l";
      out += (x.i === 5 && prevL ? "l" : INI[x.i]) + VOW[x.v] + END[x.f]; // ㄹ after ㄹ is "ll"
    });
    return out;
  }
  function romanize(text, opts) {
    const spelled = !!(opts && opts.spelled);
    return String(text).split(/(\s+)/).map((w) => (/\S/.test(w) ? romanizeWord(w, spelled) : w)).join("");
  }
  /** How a word is said, written in Hangul: 독일 → 도길, 감사합니다 → 감사함니다; the word itself when nothing changes */
  function pronounce(text) {
    return String(text).split(/(\s+)/).map((w) => (/\S/.test(w) ? romanizeWord(w, false, { hangul: true }) : w)).join("");
  }
  root.KO = { romanize, pronounce, isHangul: (s) => /[가-힣]/.test(s) };
})(typeof window !== "undefined" ? window : globalThis);
