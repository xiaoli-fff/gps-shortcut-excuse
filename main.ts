// The GPS Swears It Was a Shortcut — emit the GPS's excuse.
//
// Design, worked out in this session: the GPS never admits fault — it
// reframes the wrong turn as a favour. "That wasn't a wrong turn" is the
// defensive denial, "a private tour of a cul-de-sac" is the smug rebrand,
// and "the map begged me to show you" blames the map while making the
// dead end sound exclusive. The specific detail (a cul-de-sac) is exactly
// what the brief asks for instead of the usual "recalculating" joke, the
// voice is the GPS talking — smug, defensive, caught red-handed — and
// there is no setup and no dialogue tag, just the excuse itself, reading
// cleanly aloud in one breath with the punch at the end.
//
// Why a fixed string: the entry is one line of text, so there is nothing
// to compute. No fetch, no clock, no randomness — repeated runs always
// write the same file, which is what a deterministic harness wants.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
//
// Rhythm note: the sentence is built as denial, then rebrand, then blame —
// three beats in one breath. "That wasn't a wrong turn" denies, "a private
// tour of a cul-de-sac" upgrades the mistake into something exclusive, and
// "the map begged me to show you" shifts the fault onto the map. The punch
// lands on the last word, so the entry must stay exactly one sentence.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest cap on the entry length, in characters.
const ENTRY_LIMIT = 200;

// The entry itself. Kept verbatim: the wording, spacing and final full stop
// are part of the submission and must not be touched.
const ENTRY =
  "That wasn't a wrong turn, it was a private tour of a cul-de-sac the map begged me to show you.";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const FALLBACK_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(line: string): void {
  const len = countChars(line);
  if (len === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? FALLBACK_OUTPUT_DIR;
}

function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(`wrote ${countChars(ENTRY)}-character entry to ${target}`);
}

main();
