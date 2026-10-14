// ─────────────────────────────────────────────────────────────────────────────
// Screen-building helpers — paste the ones you need at the top of a figma_execute.
// Each encodes a fix for a trap in references/build-mechanics.md.
//
//   const { set, errs } = makeSetter();
//   const row = makeFrame('Tên kho · Mã kho', 'HORIZONTAL'); fields.appendChild(row); fill(row);
//   await addFormField(fvComp, row, { type:'Text', label:'Tên kho', required:true, placeholder:'Nhập tên kho', count:120 }, set);
//   await setFieldError(fieldInstance, 'Vui lòng nhập tên kho.', set);
//   await capLines(textNode, 2);
//   return { errs };
// ─────────────────────────────────────────────────────────────────────────────

// setProperties that collects failures instead of throwing or swallowing them.
// Return `errs` from every build call — an empty array is the evidence it worked.
function makeSetter() {
  const errs = [];
  const set = (node, props) => {
    try { node.setProperties(props); }
    catch (e) { errs.push(`${node && node.name}: ${JSON.stringify(props).slice(0, 80)} → ${e.message}`); }
  };
  return { set, errs };
}

// A structural frame that doesn't paint or clip. createFrame() clips by default, which hides
// absolutely positioned bits such as a Textarea's counter.
function makeFrame(name, layoutMode = 'VERTICAL') {
  const f = figma.createFrame();
  f.name = name; f.fills = []; f.clipsContent = false; f.layoutMode = layoutMode;
  f.itemSpacing = 0; f.paddingTop = f.paddingRight = f.paddingBottom = f.paddingLeft = 0;
  return f;
}

// Call after the node is inside an auto-layout parent (the setters throw before that).
function fill(node, vertical = 'HUG') { node.layoutSizingHorizontal = 'FILL'; node.layoutSizingVertical = vertical; }

// Bind a spacing property to a harvested variable id (see the product data file).
async function bindSpace(node, prop, variableId) {
  const v = await figma.variables.getVariableByIdAsync(variableId);
  if (!v) throw new Error(`variable ${variableId} not found — re-harvest tokens`);
  node.setBoundVariable(prop, v);
}

// Load every font used inside a subtree — needed before characters, textAutoResize or alignment.
async function loadFontsIn(root) {
  const seen = new Set();
  for (const t of root.findAll(n => n.type === 'TEXT')) {
    const f = t.fontName;
    if (f && typeof f === 'object' && !seen.has(f.family + f.style)) { seen.add(f.family + f.style); await figma.loadFontAsync(f); }
  }
}

// Truncate a TEXT node to n lines with an ellipsis. The order matters; see build-mechanics › Text.
async function capLines(textNode, n) {
  await figma.loadFontAsync(textNode.fontName);
  textNode.layoutSizingVertical = 'HUG';
  textNode.textAutoResize = 'HEIGHT';
  textNode.textTruncation = 'ENDING';
  textNode.maxLines = n;
}

// Set an input's counter maximum ("0 / 40" → "0 / 120"). The counter is plain TEXT nodes.
async function setCounterMax(control, max) {
  const t = control.findAll(n => n.type === 'TEXT' && /^\d+$/.test(n.characters) && n.characters !== '0')[0];
  if (t) { await figma.loadFontAsync(t.fontName); t.characters = String(max); }
}

// One UpS Form / Vertical field. `fvComp` = await figma.importComponentByKeyAsync('baa47c2b…').
// type: 'Text' | 'Textarea' | 'Select' | 'InputNumber' | 'Switch' | …
async function addFormField(fvComp, row, { type, label, required = false, tooltip = false, placeholder = '', count = 0 }, set) {
  const inst = fvComp.createInstance(); row.appendChild(inst); inst.name = label;
  inst.layoutSizingHorizontal = 'FILL';
  const item = inst.children[0]; item.layoutSizingHorizontal = 'FILL';
  set(item, { Type: type });                                                  // variant first…
  const lab = item.children[0];
  set(lab, { Mark: required ? 'Required' : 'None', Tooltip: tooltip ? 'True' : 'False' });
  set(lab, { 'Text#516:4': label });                                         // …content second
  const ctrl = item.children[1]; ctrl.layoutSizingHorizontal = 'FILL';
  if (type === 'Text') { set(ctrl, { 'Text#515:158': placeholder, 'Show Count#5011:4': !!count }); if (count) await setCounterMax(ctrl, count); }
  if (type === 'Textarea') { set(ctrl, { 'Text#533:4': placeholder, 'Show Count#5012:0': !!count }); if (count) await setCounterMax(ctrl, count); }
  if (type === 'Select') set(ctrl.findOne(n => n.name === 'Select / Select Input / Outlined'), { 'Text#533:121': placeholder });
  return inst;
}

// Put a Form / Vertical field into its error state without losing its content.
// A Status variant change resets the control's text overrides, so read them first and re-apply.
async function setFieldError(field, message, set) {
  const item = field.children[0]; const ctrl = item.children[1];
  if (ctrl.name === 'Select') {
    const si = ctrl.findOne(n => n.name === 'Select / Select Input / Outlined');
    const ph = si.componentProperties['Text#533:121'].value;
    set(si, { Status: 'Error' }); set(si, { 'Text#533:121': ph });
  } else if (ctrl.componentProperties['Text#515:158']) {
    const ph = ctrl.componentProperties['Text#515:158'].value;
    const sc = ctrl.componentProperties['Show Count#5011:4'].value;
    const maxNode = ctrl.findAll(n => n.type === 'TEXT' && /^\d+$/.test(n.characters) && n.characters !== '0')[0];
    const max = maxNode && maxNode.characters;
    set(ctrl, { Status: 'Error' }); set(ctrl, { 'Text#515:158': ph, 'Show Count#5011:4': sc });
    if (max) await setCounterMax(ctrl, max);
  }
  set(item, { 'Caption#515:251': true });
  const cap = item.children.find(c => c.name === 'Input / Input Caption');
  set(cap, { Status: 'Error' }); set(cap, { 'Text#533:0': message });
}

// Place an ABSOLUTE FloatButton 24px from the right, `gap` above a bottom-right element (or the
// frame bottom). Call again whenever the frame's height changes — clones keep the old y.
function placeFloatButton(screen, above = null, gap = 16) {
  const fb = screen.findChild(n => n.name === 'FloatButton'); if (!fb) return null;
  fb.x = screen.width - fb.width - 24;
  fb.y = above ? Math.round(above.absoluteBoundingBox.y - screen.absoluteBoundingBox.y - fb.height - gap)
               : screen.height - fb.height - 24;
  return [fb.x, fb.y];
}
