#!/usr/bin/env python3
"""
修复 Cocos Creator 场景文件中的 Button._target 引用错误
Button._target 应该引用 cc.Node，而不是组件
"""
import json
from pathlib import Path

PROJECT_ROOT = Path(r"D:\App\qianzhonghuoban3.8.8")
SCENES_DIR = PROJECT_ROOT / "assets" / "scenes"

def fix_button_targets(scene_path):
    """修复场景中的 Button._target 引用"""
    with open(scene_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False

    # Build id map
    id_map = {}
    for i, obj in enumerate(data):
        if isinstance(obj, dict):
            if '__id__' in obj:
                id_map[obj['__id__']] = (i, obj)
            else:
                id_map[i] = (i, obj)

    # Find all Node objects and their ids
    node_ids = {}
    for i, obj in enumerate(data):
        if isinstance(obj, dict) and obj.get('__type__') == 'cc.Node':
            node_ids[i] = obj

    # Check and fix Button components
    for i, obj in enumerate(data):
        if isinstance(obj, dict) and obj.get('__type__') == 'cc.Button':
            if '_target' in obj:
                target = obj['_target']
                if isinstance(target, dict) and '__id__' in target:
                    tid = target['__id__']
                    if tid in id_map:
                        ref_idx, ref_obj = id_map[tid]
                        # Check if it's a Node
                        if ref_obj.get('__type__') != 'cc.Node':
                            # Get the Button's node
                            button_node_ref = obj.get('node')
                            if isinstance(button_node_ref, dict) and '__id__' in button_node_ref:
                                button_node_id = button_node_ref['__id__']
                                # Fix the _target to point to the Button's node
                                obj['_target'] = {'__id__': button_node_id}
                                print(f"  Fixed: Button at index {i}, _target: {tid} -> {button_node_id}")
                                modified = True

    if modified:
        with open(scene_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Saved: {scene_path.name}")

    return modified

def main():
    print("Fixing Button._target references in scene files...")
    print("=" * 50)

    fixed_count = 0
    for scene_path in sorted(SCENES_DIR.glob("*.scene")):
        print(f"\nProcessing: {scene_path.name}")
        if fix_button_targets(scene_path):
            fixed_count += 1

    print("\n" + "=" * 50)
    print(f"Done! Fixed {fixed_count} scene(s).")

if __name__ == "__main__":
    main()
