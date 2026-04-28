import { _decorator, Component, Label, Node, UITransform, Color, director, Vec3 } from 'cc';
import { AppState } from '../../Script/AppState';

const { ccclass } = _decorator;

/**
 * Mahjong bundle bootstrap (placeholder).
 * This exists mainly to make the bundle non-empty and to provide a stable entry point.
 */
@ccclass('MaJiangBoot')
export class MaJiangBoot extends Component {
  start() {
    // Mount under Canvas so UI is always visible.
    const canvasNode = this.node.parent ?? this.node;
    const canvasTrans = canvasNode.getComponent(UITransform);

    const overlay = new Node('MaJiangBootOverlay');
    overlay.layer = canvasNode.layer;
    canvasNode.addChild(overlay);

    // Fullscreen overlay (no Widget to avoid layout edge cases).
    overlay.addComponent(UITransform).setContentSize(canvasTrans?.contentSize?.width ?? 1280, canvasTrans?.contentSize?.height ?? 720);
    overlay.setPosition(new Vec3(0, 0, 0));

    const labelNode = new Node('TipLabel');
    labelNode.layer = canvasNode.layer;
    overlay.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(980, 300);
    labelNode.setPosition(new Vec3(0, 80, 0));

    const label = labelNode.addComponent(Label);
    label.color = new Color(255, 255, 255, 255);
    const room = AppState.room;
    label.string =
      `麻将模块已加载（占位）\n` +
      `roomID=${room?.roomID ?? room?.roomId ?? '(none)'}\n` +
      `serverId=${room?.serverId ?? '(none)'}\n` +
      `\n(点击按钮返回大厅)`;
    label.fontSize = 22;
    label.lineHeight = 26;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;
    label.enableWrapText = true;

    const btnNode = new Node('BackHallButton');
    btnNode.layer = canvasNode.layer;
    overlay.addChild(btnNode);
    btnNode.addComponent(UITransform).setContentSize(320, 80);
    btnNode.setPosition(new Vec3(0, -220, 0));

    const btnLabel = btnNode.addComponent(Label);
    btnLabel.string = '【返回大厅】';
    btnLabel.color = new Color(255, 255, 255, 255);
    btnLabel.fontSize = 32;
    btnLabel.lineHeight = 36;
    btnLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
    btnLabel.verticalAlign = Label.VerticalAlign.CENTER;

    // Delay binding to avoid the click that triggered scene switch.
    this.scheduleOnce(() => {
      btnNode.on(Node.EventType.TOUCH_END, () => {
        AppState.setRoom(null);
        director.loadScene('HallMvp');
      });
    }, 0.3);
  }
}

