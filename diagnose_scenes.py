#!/usr/bin/env python3
"""
诊断 Cocos Creator 场景文件中的引用错误
"""
import json
import os
from pathlib import Path

PROJECT_ROOT = Path(r"D:\App\qianzhonghuoban3.8.8")
SCENES_DIR = PROJECT_ROOT / "assets" / "scenes"

def analyze_scene(scene_path):
    """分析场景文件，检测引用错误"""
    errors = []
    warnings = []

    try:
        with open(scene_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return [f"JSON解析失败: {e}"], []

    if not isinstance(data, list):
        return ["文件格式错误: 不是数组"], []

    # 构建 ID 到对象的映射
    id_map = {}
    for i, obj in enumerate(data):
        if isinstance(obj, dict) and '__id__' in obj:
            id_map[obj['__id__']] = (i, obj)
        elif isinstance(obj, dict):
            # 没有 __id__ 的对象，可能是数组索引
            id_map[i] = (i, obj)

    total_objects = len(data)

    # 检查每个对象的引用
    for i, obj in enumerate(data):
        if not isinstance(obj, dict):
            continue

        obj_id = obj.get('__id__', i)
        obj_type = obj.get('__type__', 'Unknown')

        # 检查 node 引用（组件应该有 node 属性）
        if obj_type.startswith('cc.') and not obj_type.startswith('cc.Node') and not obj_type.startswith('cc.Scene'):
            if 'node' in obj:
                node_ref = obj['node']
                if isinstance(node_ref, dict) and '__id__' in node_ref:
                    ref_id = node_ref['__id__']
                    if ref_id not in id_map:
                        errors.append(f"[{obj_type}] node引用无效: id={ref_id}, 对象索引={i}")
                    else:
                        ref_idx, ref_obj = id_map[ref_id]
                        if ref_obj.get('__type__') != 'cc.Node':
                            errors.append(f"[{obj_type}] node引用类型错误: 期望cc.Node, 实际{ref_obj.get('__type__')}, id={ref_id}")

        # 检查 Canvas._cameraComponent
        if obj_type == 'cc.Canvas':
            if '_cameraComponent' in obj and obj['_cameraComponent']:
                cam_ref = obj['_cameraComponent']
                if isinstance(cam_ref, dict) and '__id__' in cam_ref:
                    ref_id = cam_ref['__id__']
                    if ref_id not in id_map:
                        errors.append(f"[cc.Canvas] _cameraComponent引用无效: id={ref_id}")
                    else:
                        ref_idx, ref_obj = id_map[ref_id]
                        if ref_obj.get('__type__') != 'cc.Camera':
                            errors.append(f"[cc.Canvas] _cameraComponent类型错误: 期望cc.Camera, 实际{ref_obj.get('__type__')}")

        # 检查 Button._target
        if obj_type == 'cc.Button':
            if '_target' in obj and obj['_target']:
                target_ref = obj['_target']
                if isinstance(target_ref, dict) and '__id__' in target_ref:
                    ref_id = target_ref['__id__']
                    if ref_id not in id_map:
                        errors.append(f"[cc.Button] _target引用无效: id={ref_id}")
                    else:
                        ref_idx, ref_obj = id_map[ref_id]
                        if ref_obj.get('__type__') != 'cc.Node':
                            errors.append(f"[cc.Button] _target类型错误: 期望cc.Node, 实际{ref_obj.get('__type__')}")

        # 检查 EditBox 的子组件引用
        if obj_type == 'cc.EditBox':
            for field in ['_textLabel', '_placeholderLabel', '_background']:
                if field in obj and obj[field]:
                    ref = obj[field]
                    if isinstance(ref, dict) and '__id__' in ref:
                        ref_id = ref['__id__']
                        if ref_id not in id_map:
                            errors.append(f"[cc.EditBox] {field}引用无效: id={ref_id}")

        # 检查 Label._font
        if obj_type in ['cc.Label', 'cc.TTF'] and '_font' in obj:
            font_ref = obj['_font']
            if isinstance(font_ref, dict) and '__id__' in font_ref:
                ref_id = font_ref['__id__']
                if ref_id not in id_map:
                    warnings.append(f"[{obj_type}] _font引用无效: id={ref_id}")

        # 检查 Sprite._spriteFrame
        if obj_type == 'cc.Sprite' and '_spriteFrame' in obj:
            sf_ref = obj['_spriteFrame']
            if isinstance(sf_ref, dict) and '__id__' in sf_ref:
                ref_id = sf_ref['__id__']
                if ref_id not in id_map:
                    warnings.append(f"[cc.Sprite] _spriteFrame引用无效: id={ref_id}")

    # 检查 SceneGlobals
    for i, obj in enumerate(data):
        if obj.get('__type__') == 'cc.SceneGlobals':
            for field in ['ambient', 'shadows', 'skybox', 'fog']:
                if field in obj and obj[field]:
                    ref = obj[field]
                    if isinstance(ref, dict) and '__id__' in ref:
                        ref_id = ref['__id__']
                        if ref_id not in id_map:
                            errors.append(f"[SceneGlobals] {field}引用无效: id={ref_id}")
                        else:
                            ref_idx, ref_obj = id_map[ref_id]
                            expected_type = {
                                'ambient': 'cc.AmbientInfo',
                                'shadows': 'cc.ShadowsInfo',
                                'skybox': 'cc.SkyboxInfo',
                                'fog': 'cc.FogInfo'
                            }.get(field)
                            if expected_type and ref_obj.get('__type__') != expected_type:
                                errors.append(f"[SceneGlobals] {field}类型错误: 期望{expected_type}, 实际{ref_obj.get('__type__')}")

    # 检查重复的 UUID
    uuids = {}
    for i, obj in enumerate(data):
        if isinstance(obj, dict) and '_id' in obj and obj['_id']:
            uuid = obj['_id']
            if uuid in uuids:
                errors.append(f"[重复UUID] {uuid} 在索引{uids[uuid]}和{i}")
            else:
                uuids[uuid] = i

    return errors, warnings

def main():
    print("=" * 60)
    print("Cocos Creator 场景文件诊断工具")
    print("=" * 60)
    print()

    all_errors = []
    all_warnings = []

    for scene_file in sorted(SCENES_DIR.glob("*.scene")):
        print(f"\n分析: {scene_file.name}")
        print("-" * 40)

        errors, warnings = analyze_scene(scene_file)

        if errors:
            print(f"  [ERROR] ({len(errors)}):")
            for err in errors:
                print(f"     - {err}")
            all_errors.extend([(scene_file.name, e) for e in errors])
        else:
            print(f"  [OK] No errors")

        if warnings:
            print(f"  [WARN] ({len(warnings)}):")
            for warn in warnings:
                print(f"     - {warn}")
            all_warnings.extend([(scene_file.name, w) for w in warnings])

    print("\n" + "=" * 60)
    print(f"Total: {len(all_errors)} errors, {len(all_warnings)} warnings")
    print("=" * 60)

    return len(all_errors) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
