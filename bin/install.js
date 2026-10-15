#!/usr/bin/env node
// Install or update the UpBase design skills, or start a product's data folder.
//
//   npx github:datvu98/upbase-design-skills                 install/update → ~/.claude/skills (all projects)
//   npx github:datvu98/upbase-design-skills --project       install/update → ./.claude/skills (this repo only)
//   npx github:datvu98/upbase-design-skills --dir <path>    install/update → <path>
//   npx github:datvu98/upbase-design-skills init <product>  create ./upbase/<product>/ from the template
//   add --dry-run to see what would change
//
// Updating = running it again. The skills hold no product data: each team keeps its own in its repo
// under upbase/<product>/ (see GUIDE.md), so an update never touches it.

'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const valueOf = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

if (has('--help') || has('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 12).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const pkgRoot = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
const srcSkills = path.join(pkgRoot, 'skills');
const templateDir = path.join(srcSkills, '_shared', 'product-template');
const dryRun = has('--dry-run');

// ── init <product>: copy the four templates into ./upbase/<product>/ ─────────────────────────────
if (args[0] === 'init') {
  const product = args[1];
  if (!product || product.startsWith('-') || !/^[a-z0-9][a-z0-9-]*$/.test(product)) {
    console.log('Usage: npx github:datvu98/upbase-design-skills init <product>\n' +
      '  <product> is a short lowercase slug, e.g. uplms. Run it at the root of your team\'s design repo.');
    process.exit(1);
  }
  const dest = path.join(process.cwd(), 'upbase', product);
  if (fs.existsSync(dest)) {
    console.log(`${path.relative(process.cwd(), dest)}/ already exists — nothing copied. Edit the files there.`);
    process.exit(1);
  }
  const files = ['kit-build.md', 'kit-usage.md', 'product-file.md', 'gap-log.md'];
  console.log(`Creating upbase/${product}/${dryRun ? '  [dry run]' : ''}`);
  if (!dryRun) fs.mkdirSync(dest, { recursive: true });
  for (const f of files) {
    console.log(`  + upbase/${product}/${f}`);
    if (!dryRun) fs.copyFileSync(path.join(templateDir, f), path.join(dest, f));
  }
  console.log(`
Next:
  1. Fill the header of kit-build.md (kit file key, platform reach, owner) and its
     "Decisions to make once" table. Fill the header of product-file.md (product file key,
     kit probe key). The other two files start empty and grow as you build.
     Or open Claude in this repo and say: "register our kit <kit url> and product file <url>".
  2. Commit upbase/${product}/ so the whole team shares it.
  3. A filled-in example: skills/_shared/product-template/EXAMPLE.md, or examples/ups/ in the repo.`);
  process.exit(0);
}

// ── install / update ─────────────────────────────────────────────────────────────────────────────
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

// ── Rescue product data from versions ≤ 0.3, which kept it inside the skills ──────────────────────
// 0.1 kept a team's kit file in ub-component-creator/references/kit/; 0.2–0.3 kept it in
// ui-kit-builder/kits/ and product-screen-builder/references/{products,kit-maps}/. Since 0.4 that
// data belongs in the team's repo (upbase/<product>/). Anything a team added there is moved to
// <target>/_rescued-data/ — never deleted — and the user is told where to put it.
const OLD_DATA_DIRS = [
  ['ub-component-creator/references/kit', ['_template.md', 'gap-log-template.md', 'mode.md', 'patterns.md',
    'page-template.md', 'subscription.md', 'wrapper-pattern.md', 'ups.md']],
  ['ui-kit-builder/kits', ['_template.md', '_gap-log-template.md', 'ups-ui-kit.md']],
  ['product-screen-builder/references/products', ['_template.md', 'ups-product-2026.md']],
  ['product-screen-builder/references/kit-maps', ['_template.md', 'ups-ui-kit.md', 'ups.md']],
];
const rescued = [];
for (const [rel, shippedNames] of OLD_DATA_DIRS) {
  const dir = path.join(target, rel);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && !shippedNames.includes(f))) {
    const to = path.join(target, '_rescued-data', rel.replace(/\//g, '__'), f);
    rescued.push(`${rel}/${f} → _rescued-data/${path.relative(path.join(target, '_rescued-data'), to)}`);
    if (!dryRun) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.renameSync(path.join(dir, f), to); }
  }
}
const legacyDir = path.join(target, 'ub-component-creator');
if (fs.existsSync(path.join(legacyDir, 'SKILL.md'))) {
  console.log('  - removing ub-component-creator (replaced by design-system-builder + ui-kit-builder)');
  if (!dryRun) fs.rmSync(legacyDir, { recursive: true, force: true });
}
// Files 0.1 shipped without a manifest that later versions renamed.
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

// Files an earlier version shipped but this one doesn't are removed.
const gone = (previousFiles || LEGACY_REMOVED).filter(rel => !shipped.includes(rel));
for (const rel of gone) {
  const dest = path.join(target, rel);
  if (!fs.existsSync(dest)) continue;
  removed++;
  console.log(`  - ${rel}`);
  if (!dryRun) fs.rmSync(dest);
}
// Drop folders that are now empty (old data folders, renamed folders).
if (!dryRun) for (const skill of [...skills, 'ub-component-creator']) {
  const dir = path.join(target, skill);
  if (!fs.existsSync(dir)) continue;
  const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) prune(path.join(d, e.name));
    if (d !== dir && fs.readdirSync(d).length === 0) fs.rmdirSync(d); };
  prune(dir);
}

// Anything else inside the skill folders isn't ours. Since 0.4 nothing should be there.
const stray = [];
for (const skill of skills) {
  const dir = path.join(target, skill);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const rel = path.relative(target, file);
    if (!fs.existsSync(path.join(srcSkills, rel))) stray.push(rel);
  }
}

if (!dryRun) fs.writeFileSync(stamp, JSON.stringify({ version: pkg.version, installedAt: new Date().toISOString(), skills, files: shipped }, null, 2) + '\n');

console.log(`\n${added} added · ${updated} updated · ${removed} removed · ${same} unchanged`);
if (rescued.length) console.log(`
Product data found inside the skills (kept there by versions ≤ 0.3) was moved out, not deleted:
${rescued.map(r => '  → ' + r).join('\n')}
Move it into your team's repo as upbase/<product>/ (kit file → kit-build.md, kit map →
kit-usage.md, product file → product-file.md) and commit it. GUIDE.md › "Registering a product".`);
if (stray.length) console.log(`\nFiles inside the skill folders that this repo doesn't ship (left alone):\n${stray.map(k => '  = ' + k).join('\n')}`);

// The same skill in both the user and the project folder loads twice; Claude may pick either.
const other = target === userDir ? projectDir : target === projectDir ? userDir : null;
if (other) {
  const dupes = [...skills, 'ub-component-creator'].filter(s => fs.existsSync(path.join(other, s, 'SKILL.md')));
  if (dupes.length) console.log(`\n⚠ Also installed in ${other}: ${dupes.join(', ')}.\n  Keep one copy — remove the other folder(s), or they load twice and drift apart.`);
}

console.log(`\nRestart Claude Code (or start a new session) to pick up the change.`);
if (previous && previous !== pkg.version) console.log(`What changed since ${previous}: CHANGELOG.md in the repo.`);
