// Words this short ("a", "I", "of", "to", "&"…) never end a row: each is
// bound to the word after it, so it wraps down together with that word.
// Not when punctuation closes it ("up.", "it,") — that ends a phrase and
// belongs with what came before.
const SHORT_WORD = /^[^\p{L}\p{N}&]*[\p{L}\p{N}&]{1,2}$/u;

/** Splits text into the words its rows may break between, with 1–2
 *  character words already joined to the next one by a no-break space. */
export function splitWords(text: string): string[] {
  const out: string[] = [];
  let carry = "";
  for (const w of text.split(/[ \t\n\r]+/).filter(Boolean)) {
    const word = carry ? carry + "\u00A0" + w : w;
    if (SHORT_WORD.test(w)) carry = word;
    else {
      out.push(word);
      carry = "";
    }
  }
  if (carry) out.push(carry);
  return out;
}
