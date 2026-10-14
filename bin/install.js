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

// Every skill folder, plus _shared (no SKILL.md, so Claude Code doesn't load it as a skill).
const skills = fs.readdirSync(srcSkills).filter(d => d === '_shared' || fs.existsSync(path.join(srcSkills, d, 'SKILL.md')));

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}

const stamp = path.join(target, '.upbase-design-skills.json');
let previous = null, previousFiles = null;
try { const st = JSON.parse(fs.readFileSync(stamp, 'utf8')); previous = st.version; previousFiles = st.files || null; } catch (e) { /* first install */ }

console.log(`UpBase design skills ${pkg.version}${previous ? ` (installed: ${previous})` : ''}`);
console.log(`→ ${target}${dryRun ? '  [dry run]' : ''}\n`);

// ── Migrate 0.1.x: ub-component-creator was split into design-system-builder, ui-kit-builder and
// _shared. A team's own kit data file moves to ui-kit-builder/kits/; everything else was shipped.
const LEGACY_KIT_FILES = ['_template.md', 'gap-log-template.md', 'mode.md', 'patterns.md', 'page-template.md',
  'subscription.md', 'wrapper-pattern.md', 'ups.md'];
const legacyDir = path.join(target, 'ub-component-creator');
if (fs.existsSync(path.join(legacyDir, 'SKILL.md'))) {
  const kitDir = path.join(legacyDir, 'references', 'kit');
  const own = fs.existsSync(kitDir) ? fs.readdirSync(kitDir).filter(f => f.endsWith('.md') && !LEGACY_KIT_FILES.includes(f)) : [];
  for (const f of own) {
    console.log(`  → moving your kit file ub-component-creator/references/kit/${f} to ui-kit-builder/kits/${f}`);
    if (!dryRun) { fs.mkdirSync(path.join(target, 'ui-kit-builder', 'kits'), { recursive: true }); fs.renameSync(path.join(kitDir, f), path.join(target, 'ui-kit-builder', 'kits', f)); }
  }
  console.log('  - removing ub-component-creator (replaced by design-system-builder + ui-kit-builder)');
  if (!dryRun) fs.rmSync(legacyDir, { recursive: true, force: true });
}
// Files renamed in 0.2.0 that 0.1.x installed without a manifest.
const LEGACY_REMOVED = ['product-screen-builder/references/kit-maps/ups.md'];

let added = 0, updated = 0, same = 0, removed = 0;
const shipped = [];
for (const skill of skills) {
  for (const file of walk(path.join(srcSkills, skill))) {
    const rel = path.relative(srcSkills, file);
    shipped.push(rel);
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

// Files this repo shipped before but no longer does are removed; files you added are not.
const gone = (previousFiles || LEGACY_REMOVED).filter(rel => !shipped.includes(rel));
for (const rel of gone) {
  const dest = path.join(target, rel);
  if (!fs.existsSync(dest)) continue;
  removed++;
  console.log(`  - ${rel}`);
  if (!dryRun) fs.rmSync(dest);
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

if (!dryRun) fs.writeFileSync(stamp, JSON.stringify({ version: pkg.version, installedAt: new Date().toISOString(), skills, files: shipped }, null, 2) + '\n');

console.log(`\n${added} added · ${updated} updated · ${removed} removed · ${same} unchanged`);
if (kept.length) console.log(`Kept your own files (not part of the repo):\n${kept.map(k => '  = ' + k).join('\n')}`);

// The same skill in both the user and the project folder loads twice; Claude may pick either.
const other = target === userDir ? projectDir : target === projectDir ? userDir : null;
if (other) {
  const dupes = [...skills, 'ub-component-creator'].filter(s => fs.existsSync(path.join(other, s, 'SKILL.md')));
  if (dupes.length) console.log(`\n⚠ Also installed in ${other}: ${dupes.join(', ')}.\n  Keep one copy — remove the other folder(s), or they load twice and drift apart.`);
}

console.log(`\nRestart Claude Code (or start a new session) to pick up the change.`);
if (previous && previous !== pkg.version) console.log(`What changed since ${previous}: CHANGELOG.md in the repo.`);
