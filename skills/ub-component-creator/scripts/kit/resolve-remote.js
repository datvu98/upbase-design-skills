// ─────────────────────────────────────────────────────────────────────────────
// Kit remote resolver — paste at the top of a figma_execute call against any
// kit that consumes UpBase (UpS UI Kit, or the kit named in references/kit/<kit>.md).
// `kitResolve` and `upsResolve` are the same function; the second is the original name.
//
// Replaces initUB() from scripts/source/helpers.js. That one
// resolves variables and styles from LOCAL collections, which are empty in this
// file even after importing — imported assets are remote, not local. Everything
// here goes through the team library and by key instead.
//
//   const R = await upsResolve();
//   const bg = await R.v('Colors/Neutral/Bg/colorBgContainer');   // v() is async — import is lazy
//   frame.fills = [await R.paintVar(bg)];
//   R.bindNum(frame, 'paddingLeft', await R.v('Space/Padding/paddingSM'));
//   await R.applyTextStyle(textNode, 'Text Base/Normal');
//
//   // in a tight loop, await once then use the sync accessor
//   await R.v('Space/Padding/paddingSM');
//   for (const n of nodes) R.bindNum(n, 'itemSpacing', R.vSync('Space/Padding/paddingSM'));
//
// The rest of scripts/source/helpers.js (contrast, propsBlock, addProps, frame, slot,
// insideInstance…) works unchanged — paste those alongside if you need them.
// ─────────────────────────────────────────────────────────────────────────────

const UPBASE_TEXT_STYLE_KEYS = {
  'Text Base/Normal':    'd226bd288d31ed1dcc34b811f1a7295df71d6641',
  'Text Base/Strong':    'f5332cf25bb3d59abb78905f8666991223382287',
  'Text Base/Underline': '921a11c8c5fd124437105a9a45fd72dc80800c78',
  'Text Base/Delete':    'e3554468234028ac284aee08fe6523f0d06e612f',
  'Text Base/Italic':    'f26f51d5f4033bf83ff310989ca190c21ea3c15e',
  'Text SM/Normal':      '1bf86738999bebe0f2556e6a677649939d6d17d4',
  'Text SM/Strong':      'e7db5851d52b6cd8f2cb78ed050723b18e0cab75',
  'Text SM/Underline':   '13b9d27bfb560f4617d79600448a2c03e8a2f616',
  'Text SM/Delete':      'd882735df40312cd460df755b3661d2cf0128db6',
  'Text SM/Italic':      'e4ed4a6057c27f9bf2bf9f2696b9d08b03dc3c62',
  'Text LG/Normal':      'e3c6a733172287b902ee6fac996bcbdb562e399e',
  'Text LG/Strong':      'cb0043472770df8690975185cab204c1c542ed04',
  'Text LG/Underline':   'e5228270750fa2c72c033b439641824cac36ae3e',
  'Text LG/Delete':      '2036da35de16a5f457086f6a1efad3558791784d',
  'Text LG/Italic':      '11aec083998d5a78291c0834f861ec5195268401',
  'Heading/1':           'ddbb7109eca5fca3b262028aea2014a060942f72',
  'Heading/2':           '770f6cdcc81af236107198d058afa50b0183184e',
  'Heading/3':           'd569c7fe147c02d38210f6563123a979b35babac',
  'Heading/4':           '244d76fc458a3409cc5b7fffb7115740fb4b96e9',
  'Heading/5':           'b40b02cdb40caef06e5a16d11c2de6ff1caff385',
};

const UPBASE_EFFECT_STYLE_KEYS = {
  'boxShadow':                        '4d828b4ab56531d1e5e19f20dbfbc1696459cdd7',
  'boxShadowSecondary':               '89b0ee10cabc32021023d222738abed47d4b41ff',
  'boxShadowTertiary':                '40ff9640ffba8b9b5cd95457084734ecbd8518b0',
  'Component/Button/dangerShadow':    'f08562a17739c355195334b93fe08cb84b2aea79',
  'Component/Button/defaultShadow':   '238b6c82504308b69e5743ad1592a4b9cc5df7f6',
  'Component/Button/primaryShadow':   '2bb20243d5618d7c562e241b4bf946a3a0819b21',
  'Component/Input/activeShadow':     '96eaa2f34131f08c935a0f6d2af9fc78d32b054b',
  'Component/Input/errorActiveShadow':'00e66dccde00495518fd4684fe71182faee095ef',
  'Component/Input/warningActiveShadow':'573660c40a45bf3696b9a7d34d7fde888913bb02',
  'Component/Switch/handleShadow':    'e8f1d3da08bdad12f369b5ff7260d78232727487',
};

const UPBASE_GRID_STYLE_KEYS = {
  '1440px - 12 col': 'f3b15c5b82a30104bbd450d74bc9f082974cca07',
  '1440px - 24 col': '1e763d67f0b4c16445ec79b00948a4cdf48b9c3e',
};

let UPS = null;

async function upsResolve(opts) {
  if (UPS && !(opts && opts.force)) return UPS;
  await figma.loadAllPagesAsync();

  // Name → library-variable key, per collection. Built once; importing is lazy,
  // because eagerly importing 2,517 variables is slow and almost always waste.
  const libCols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const upbase  = libCols.filter(c => /UpBase/i.test(c.libraryName));
  if (!upbase.length) {
    throw new Error('No UpBase library variable collections available. Is the library enabled on this file?');
  }

  const keyByName = new Map();          // 'Colors/Neutral/Bg/colorBgContainer' → key
  const collectionOf = new Map();       // same name → collection name
  for (const c of upbase) {
    const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key);
    for (const v of vars) {
      if (!keyByName.has(v.name)) { keyByName.set(v.name, v.key); collectionOf.set(v.name, c.name); }
    }
  }

  const varCache   = new Map();   // name → imported Variable
  const styleCache = new Map();   // key  → imported BaseStyle
  const colCache   = new Map();   // collection id → VariableCollection

  // Imported variables are remote; a second import of the same key is cheap but
  // not free, so cache. Returns null (never throws) so a missing token is
  // visible as an unbound value rather than a dead execute call.
  async function v(name) {
    if (varCache.has(name)) return varCache.get(name);
    const key = keyByName.get(name);
    if (!key) { varCache.set(name, null); return null; }
    const imported = await figma.variables.importVariableByKeyAsync(key);
    varCache.set(name, imported);
    return imported;
  }

  // Synchronous accessor for variables already imported this run. `await v(name)`
  // at least once first; this is the form to use inside tight loops.
  function vSync(name) { return varCache.get(name) || null; }

  async function collectionFor(variable) {
    if (!variable) return null;
    const id = variable.variableCollectionId;
    if (colCache.has(id)) return colCache.get(id);
    const c = await figma.variables.getVariableCollectionByIdAsync(id);
    colCache.set(id, c);
    return c;
  }

  // Default mode of the variable's own (remote) collection: Light for Colors,
  // Default for Dimensions and Typography.
  async function defaultModeId(variable) {
    const c = await collectionFor(variable);
    return c ? c.defaultModeId : null;
  }

  // Follow a VARIABLE_ALIAS chain to a concrete value. Works across the file
  // boundary: aliases resolve in the consumer's mode context, so a UpBase alias
  // still swaps Light/Dark and Default/Compact here.
  async function resolveVar(variable, modeId, depth) {
    if (!variable || (depth || 0) > 8) return null;
    const id = modeId || await defaultModeId(variable);
    let x = variable.valuesByMode[id];
    if (x === undefined) {
      // asking for a mode that belongs to a different collection — fall back
      x = variable.valuesByMode[await defaultModeId(variable)];
    }
    if (x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS') {
      return resolveVar(await figma.variables.getVariableByIdAsync(x.id), modeId, (depth || 0) + 1);
    }
    return x;
  }

  // Bound paint that keeps the variable's alpha. Use for EVERY fill and stroke:
  // binding an alpha colour without setting opacity renders solid black.
  async function paintVar(variable, modeId) {
    const c = await resolveVar(variable, modeId);
    if (!c || typeof c !== 'object' || !('r' in c)) {
      return { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
    }
    const p = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b },
                opacity: c.a !== undefined ? c.a : 1 };
    return figma.variables.setBoundVariableForPaint(p, 'color', variable);
  }

  function bindNum(node, prop, variable) {
    if (!variable) return false;
    try { node.setBoundVariable(prop, variable); return true; } catch (e) { return false; }
  }

  async function style(name) {
    const key = UPBASE_TEXT_STYLE_KEYS[name] || UPBASE_EFFECT_STYLE_KEYS[name] || UPBASE_GRID_STYLE_KEYS[name];
    if (!key) return null;
    if (styleCache.has(key)) return styleCache.get(key);
    const s = await figma.importStyleByKeyAsync(key);
    styleCache.set(key, s);
    return s;
  }

  async function applyTextStyle(node, name) {
    const s = await style(name);
    if (!s) return false;
    await node.setTextStyleIdAsync(s.id);
    return true;
  }

  async function applyEffectStyle(node, name) {
    const s = await style(name);
    if (!s) return false;
    await node.setEffectStyleIdAsync(s.id);
    return true;
  }

  // Import a UpBase component or component set by key — a key is one or the
  // other, and the wrong call throws, so try both.
  async function importByKey(key) {
    try { return { node: await figma.importComponentSetByKeyAsync(key), isSet: true }; }
    catch (e) {
      try { return { node: await figma.importComponentByKeyAsync(key), isSet: false }; }
      catch (e2) { return { node: null, isSet: null, err: String(e2 && e2.message || e2) }; }
    }
  }

  // Icon instance, recoloured correctly: vectors get the paint, containers AND
  // the instance root get cleared. Painting everything yields a solid square.
  // Icons are remote here, so this takes a key rather than searching a page.
  const VECTORISH = new Set(['VECTOR','BOOLEAN_OPERATION','STAR','ELLIPSE','POLYGON','LINE','RECTANGLE']);
  async function icon(iconKey, size, colorVar) {
    const { node: comp, isSet } = await importByKey(iconKey);
    if (!comp) return null;
    const main = isSet ? (comp.defaultVariant || comp.children[0]) : comp;
    const inst = main.createInstance();
    if (size) inst.resize(size, size);
    if (colorVar) {
      const paint = await paintVar(colorVar);
      const stack = [inst];
      while (stack.length) {
        const n = stack.pop();
        if ('fills' in n && Array.isArray(n.fills)) {
          if (n !== inst && VECTORISH.has(n.type)) n.fills = [paint]; else n.fills = [];
        }
        if ('children' in n) stack.push(...n.children);
      }
    }
    return inst;
  }

  UPS = {
    collections: upbase.map(c => ({ name: c.name, key: c.key, library: c.libraryName })),
    variableNames: [...keyByName.keys()],
    collectionOf: n => collectionOf.get(n) || null,
    v, vSync, resolveVar, paintVar, bindNum,
    style, applyTextStyle, applyEffectStyle,
    importByKey, icon,
    // diagnostics — expected to be 0/0 in UpS; that is healthy, not broken
    localCheck: async () => ({
      localCollections: (await figma.variables.getLocalVariableCollectionsAsync()).length,
      localTextStyles:  (await figma.getLocalTextStylesAsync()).length,
    }),
  };
  return UPS;
}

const kitResolve = upsResolve;
