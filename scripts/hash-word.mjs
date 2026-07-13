// Generate the SHA-256 of your secret entry word (the one you type to open
// the admin login).
//   node scripts/hash-word.mjs "yourword"
// Put the printed value in NEXT_PUBLIC_SECRET_WORD_SHA256.
// The word is lowercased and trimmed before hashing (case-insensitive).
import { createHash } from "node:crypto";

const word = process.argv[2];
if (!word) {
  console.error('Usage: node scripts/hash-word.mjs "yourword"');
  process.exit(1);
}

const hash = createHash("sha256")
  .update(word.trim().toLowerCase())
  .digest("hex");
console.log(hash);
