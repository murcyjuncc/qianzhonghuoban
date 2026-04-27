const fs = require('fs');
const d = JSON.parse(fs.readFileSync('D:/App/qianzhonghuoban3.8.8/assets/scenes/Login.scene', 'utf8'));
const byId = {};
d.forEach(function(o,i) {
  byId[o.__id__] = { type: o.__type__, name: (o._name || '') };
});

function ref(desc, fromId, field, expectedType) {
  const obj = d[fromId];
  const refId = obj[field] ? obj[field].__id__ : obj[field];
  const actual = byId[refId] ? byId[refId].type : 'MISSING';
  const ok = actual === expectedType ? 'OK' : 'FAIL';
  console.log(ok, desc, '-> __id__:'+refId, actual);
}

ref('Canvas node->parent', 2, '_parent', 'cc.Scene');
ref('Canvas._cameraComponent', 3, '_cameraComponent', 'cc.Camera');
ref('MainCamera node->parent', 4, '_parent', 'cc.Node');
ref('MainCamera UITransform->node', 5, 'node', 'cc.Node');
ref('MainCamera Camera->node', 6, 'node', 'cc.Node');
ref('Background node->parent', 7, '_parent', 'cc.Node');
ref('Background UITransform->node', 8, 'node', 'cc.Node');
ref('Background Sprite->node', 9, 'node', 'cc.Node');
ref('TitleLabel node->parent', 10, '_parent', 'cc.Node');
ref('TitleLabel UITransform->node', 11, 'node', 'cc.Node');
ref('TitleLabel Label->node', 12, 'node', 'cc.Node');
ref('inputUsername node->parent', 13, '_parent', 'cc.Node');
ref('inputUsername UITransform->node', 14, 'node', 'cc.Node');
ref('inputUsername Sprite->node', 15, 'node', 'cc.Node');
ref('inputPassword node->parent', 16, '_parent', 'cc.Node');
ref('inputPassword UITransform->node', 17, 'node', 'cc.Node');
ref('inputPassword Sprite->node', 18, 'node', 'cc.Node');
ref('btnLogin node->parent', 19, '_parent', 'cc.Node');
ref('btnLogin Button->node', 22, 'node', 'cc.Node');
ref('btnLogin Button->_target', 22, '_target', 'cc.Node');
ref('btnLogin Label->node', 23, 'node', 'cc.Node');
ref('btnGuest node->parent', 24, '_parent', 'cc.Node');
ref('btnGuest Button->node', 27, 'node', 'cc.Node');
ref('btnGuest Button->_target', 27, '_target', 'cc.Node');
ref('btnGuest Label->node', 28, 'node', 'cc.Node');
ref('SceneGlobals->ambient', 29, 'ambient', 'cc.AmbientInfo');
ref('SceneGlobals->shadows', 29, 'shadows', 'cc.ShadowsInfo');
ref('SceneGlobals->skybox', 29, 'skybox', 'cc.SkyboxInfo');
ref('SceneGlobals->fog', 29, 'fog', 'cc.FogInfo');

console.log('');
var canvas = d[2];
console.log('Canvas._children count:', canvas._children.length);
canvas._children.forEach(function(c, i) {
  var info = byId[c.__id__];
  var type = info ? info.type : 'MISSING';
  var name = info ? info.name : 'MISSING';
  console.log('  Child', i, '-> __id__:'+c.__id__, type, name);
});

// Verify no duplicate __id__ values
var ids = d.map(function(o){ return o.__id__; });
var unique = new Set(ids);
console.log('');
console.log('Total objects:', d.length, 'Unique __id__s:', unique.size, unique.size === d.length ? 'NO DUPLICATES - OK' : 'HAS DUPLICATES!');
