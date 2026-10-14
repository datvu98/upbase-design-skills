#!/usr/bin/env node
// Install (or update) the UpBase design skills into a Claude Code skills folder.
//
//   npx github:<owner>/upbase-design-skills              → ~/.claude/skills   (all your projects)
//   npx github:<owner>/upbase-design-skills --project    → ./.claude/skills   (this repo only)
//   npx github:<owner>/upbase-design-skills --dir <path> → <path>
//   add --dry-run to see what would change
//
// Updating = running it again. Files shipped by this repo are overwritten; files you added
// (your kit's references/kit/<slug>.md, your product's data file) are never touched or deleted.

'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const valueOf = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

if (has('--help') || has('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 11).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const pkgRoot = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
const srcSkills = path.join(pkgRoot, 'skills');
const dryRun = has('--dry-run');

const userDir = path.join(os.homedir(), '.claude', 'skills');
const projectDir = path.join(process.cwd(), '.claude', 'skills');
const target = valueOf('--dir') ? path.resolve(valueOf('--dir')) : has('--project') ? projectDir : userDir;

const skills = fs.readdirSync(srcSkills).filter(d => fs.existsSync(path.join(srcSkills, d, 'SKILL.md')));

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

const stamp = path.join(target, '.upbase-design-skills.json');
let previous = null;
try { previous = JSON.parse(fs.readFileSync(stamp, 'utf8')).version; } catch (e) { /* first install */ }

console.log(`UpBase design skills ${pkg.version}${previous ? ` (installed: ${previous})` : ''}`);
console.log(`→ ${target}${dryRun ? '  [dry run]' : ''}\n`);

let added = 0, updated = 0, same = 0;
for (const skill of skills) {
  for (const file of walk(path.join(srcSkills, skill))) {
    const rel = path.relative(srcSkills, file);
    const dest = path.join(target, rel);
    const next = fs.readFileSync(file);
    let state = 'add';
    if (fs.existsSync(dest)) state = Buffer.compare(fs.readFileSync(dest), next) === 0 ? 'same' : 'update';
    if (state === 'same') { same++; continue; }
    state === 'add' ? added++ : updated++;
    console.log(`  ${state === 'add' ? '+' : '~'} ${rel}`);
    if (!dryRun) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, next); }
  }
}

// Files the user added under these skills (their kit / product data) are left alone — list them
// so it's visible that they survived.
const kept = [];
for (const skill of skills) {
  const dir = path.join(target, skill);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const rel = path.relative(target, file);
    if (!fs.existsSync(path.join(srcSkills, rel))) kept.push(rel);
  }
}

if (!dryRun) fs.writeFileSync(stamp, JSON.stringify({ version: pkg.version, installedAt: new Date().toISOString(), skills }, null, 2) + '\n');

console.log(`\n${added} added · ${updated} updated · ${same} unchanged`);
if (kept.length) console.log(`Kept your own files (not part of the repo):\n${kept.map(k => '  = ' + k).join('\n')}`);

// The same skill in both the user and the project folder loads twice; Claude may pick either.
const other = target === userDir ? projectDir : target === projectDir ? userDir : null;
if (other) {
  const dupes = skills.filter(s => fs.existsSync(path.join(other, s, 'SKILL.md')));
  if (dupes.length) console.log(`\n⚠ Also installed in ${other}: ${dupes.join(', ')}.\n  Keep one copy — remove the other folder(s), or they load twice and drift apart.`);
}

console.log(`\nRestart Claude Code (or start a new session) to pick up the change.`);
if (previous && previous !== pkg.version) console.log(`What changed since ${previous}: CHANGELOG.md in the repo.`);
