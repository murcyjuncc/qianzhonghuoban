import { _decorator, Component, Label, Node, UITransform, Color, director } from 'cc';
import { AppState } from '../../Script/AppState';

const { ccclass } = _decorator;

/**
 * Mahjong bundle bootstrap (placeholder).
 * This exists mainly to make the bundle non-empty and to provide a stable entry point.
 */
@ccclass('MaJiangBoot')
export class MaJiangBoot extends Component {
  start() {
    const root = this.node;
    const overlay = new Node('MaJiangBootOverlay');
    overlay.layer = root.layer;
    root.addChild(overlay);
    overlay.addComponent(UITransform).setContentSize(900, 520);

    const label = overlay.addComponent(Label);
    label.color = new Color(255, 255, 255, 255);
    const room = AppState.room;
    label.string =
      `麻将模块已加载（占位）\n` +
      `roomID=${room?.roomID ?? room?.roomId ?? '(none)'}\n` +
      `serverId=${room?.serverId ?? '(none)'}\n` +
      `\n(下一步：创建 MaJiang 场景并在 enter() 中切换进入)`;
    label.fontSize = 22;
    label.lineHeight = 26;

    overlay.on(Node.EventType.TOUCH_END, () => {
      AppState.setRoom(null);
      director.loadScene('HallMvp');
    });
  }
}

