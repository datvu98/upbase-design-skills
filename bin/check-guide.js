#!/usr/bin/env node
// Checks that GUIDE.md has an entry for every file under skills/.
//
//   node bin/check-guide.js
//
// Why: GUIDE.md is the one place a new team reads to learn what each file is for. It is written by
// hand, so it drifts the moment someone adds or renames a file and forgets the guide. This catches
// that before a release.
//
// How it matches: GUIDE.md section 3 has one "### 3.x `skills/<folder>/`" heading per folder. A file
// counts as documented when its path inside that folder (e.g. `references/patterns.md`) appears in
// backticks somewhere in that folder's section.
//
// Output: "GUIDE.md covers all N files." and exit 0, or the list of missing files and exit 1.

'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const guide = fs.readFileSync(path.join(root, 'GUIDE.md'), 'utf8');
const skillsDir = path.join(root, 'skills');

// Split section 3 into one chunk per skills/<folder>/ heading.
const sections = {};
const re = /^### 3\.\d+ `skills\/([^/`]+)\/`.*$/gm;
const heads = [...guide.matchAll(re)];
heads.forEach((m, i) => {
  const end = i + 1 < heads.length ? heads[i + 1].index : guide.indexOf('\n## 4.', m.index);
  sections[m[1]] = guide.slice(m.index, end === -1 ? undefined : end);
});

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

const missing = [];
let total = 0;
for (const folder of fs.readdirSync(skillsDir)) {
  const dir = path.join(skillsDir, folder);
  if (!fs.statSync(dir).isDirectory()) continue;
  const text = sections[folder];
  for (const file of walk(dir)) {
    if (path.basename(file).startsWith('.')) continue;
    total++;
    const rel = path.relative(dir, file).split(path.sep).join('/');
    if (!text || !text.includes('`' + rel + '`')) missing.push(`skills/${folder}/${rel}`);
  }
}

if (missing.length) {
  console.log(`GUIDE.md is missing ${missing.length} of ${total} files:\n` + missing.map(m => '  - ' + m).join('\n'));
  console.log('\nAdd an entry for each under its folder in GUIDE.md section 3.');
  process.exit(1);
}
console.log(`GUIDE.md covers all ${total} files.`);
