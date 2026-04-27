import fs from 'node:fs';
import path from 'node:path';

function getNodeName(n) {
  return (n && typeof n === 'object' && typeof n._name === 'string' && n._name) ? n._name : '(unnamed)';
}

function buildNodePath(nodesById, nodeId) {
  const parts = [];
  const seen = new Set();
  let cur = nodeId;
  while (typeof cur === 'number' && nodesById.has(cur) && !seen.has(cur)) {
    seen.add(cur);
    const node = nodesById.get(cur);
    parts.push(getNodeName(node));
    const p = node?._parent?.__id__;
    cur = typeof p === 'number' ? p : null;
  }
  return parts.reverse().join('/');
}

function main() {
  const repoRoot = process.cwd();
  const scenePath = path.join(repoRoot, 'assets', 'HallMvp.scene');
  const raw = fs.readFileSync(scenePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Scene JSON is not an array.');

  const nodesById = new Map();
  data.forEach((o, idx) => {
    if (o && o.__type__ === 'cc.Node') nodesById.set(idx, o);
  });

  const sprites = [];
  data.forEach((o, idx) => {
    if (!o || o.__type__ !== 'cc.Sprite') return;
    const nodeId = o?.node?.__id__;
    const spriteFrameUuid = o?._spriteFrame?.__uuid__ ?? null;
    const spriteType = o?._type; // 0: SIMPLE, 1: SLICED, 2: TILED, 3: FILLED (engine enum)
    sprites.push({
      compId: idx,
      nodeId: typeof nodeId === 'number' ? nodeId : null,
      nodePath: typeof nodeId === 'number' ? buildNodePath(nodesById, nodeId) : '(no node)',
      enabled: !!o._enabled,
      type: spriteType,
      spriteFrameUuid,
      spriteFrameMainUuid: typeof spriteFrameUuid === 'string' ? spriteFrameUuid.split('@')[0] : null,
    });
  });

  sprites.sort((a, b) => (a.nodePath || '').localeCompare(b.nodePath || ''));

  const uniqMain = new Map();
  for (const s of sprites) {
    if (s.spriteFrameMainUuid) uniqMain.set(s.spriteFrameMainUuid, (uniqMain.get(s.spriteFrameMainUuid) ?? 0) + 1);
  }

  console.log(`Total Sprites: ${sprites.length}`);
  console.log(`Unique SpriteFrame main UUIDs: ${uniqMain.size}`);
  console.log('--- Unique main UUID counts ---');
  for (const [u, c] of [...uniqMain.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${u}  x${c}`);
  }

  console.log('--- Sprite list ---');
  for (const s of sprites) {
    console.log(
      JSON.stringify(
        {
          nodePath: s.nodePath,
          enabled: s.enabled,
          type: s.type,
          spriteFrameUuid: s.spriteFrameUuid,
          compId: s.compId,
          nodeId: s.nodeId,
        },
        null,
        0,
      ),
    );
  }
}

main();

