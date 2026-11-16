// ai-excited-01 entry (Node 22, standard library only).
//
// The entry image lives beside this file as entry.png. The program copies it,
// byte for byte, to entry.png inside the output directory: /output in the
// grader's container, or $MAKEFUN_OUTPUT_DIR when that is set (the kit's way
// of standing in for /output in a local run):
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The gate reads only the copied file: a whole PNG or JPEG (told apart by its
// first bytes; ours is a JPEG) of at most 1 MiB and at most 1024x1024 pixels.
// Copying the same committed bytes on every run keeps both graded runs
// identical, as the rules require.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// The image sits beside main.ts in the repository (mounted read-only at /bot
// in the grader). If it is somehow not there, fall back to the /bot root.
const beside = join(here, 'entry.png');
const source = existsSync(beside) ? beside : join('/bot', 'entry.png');

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const target = join(outputDir, 'entry.png');
copyFileSync(source, target);

// Verify the copy landed whole before reporting success: same byte count as
// the source, and a PNG or JPEG signature at its head (the gate tells the two
// apart by those first bytes). A short or garbled copy would score 0 as an
// invalid entry, so fail loudly here instead of writing it quietly.
const copied = readFileSync(target);
if (copied.length !== statSync(source).size) {
  throw new Error(`copy incomplete: wrote ${copied.length} bytes from ${source}`);
}
const isPng = copied[0] === 0x89 && copied[1] === 0x50 && copied[2] === 0x4e && copied[3] === 0x47;
const isJpeg = copied[0] === 0xff && copied[1] === 0xd8 && copied[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error('copied file starts with neither a PNG nor a JPEG signature');
}
