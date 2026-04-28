import { _decorator, Component, Label, Node, UITransform, Color, director, Widget } from 'cc';
import { AppState } from '../../Script/AppState';

const { ccclass } = _decorator;

/**
 * Mahjong bundle bootstrap (placeholder).
 * This exists mainly to make the bundle non-empty and to provide a stable entry point.
 */
@ccclass('MaJiangBoot')
export class MaJiangBoot extends Component {
  start() {
    // eslint-disable-next-line no-console
    console.log('[MaJiangBoot] start, node=', this.node?.name, 'parent=', this.node?.parent?.name);

    // Align to Canvas directly (Widget requires a valid UITransform on parent).
    const canvasNode = this.node.parent ?? this.node;
    const canvasTrans = canvasNode.getComponent(UITransform);
    // eslint-disable-next-line no-console
    console.log('[MaJiangBoot] canvas=', canvasNode?.name, 'hasUITransform=', !!canvasTrans, 'size=', canvasTrans?.contentSize);

    const overlay = new Node('MaJiangBootOverlay');
    overlay.layer = canvasNode.layer;
    canvasNode.addChild(overlay);

    // Fullscreen overlay aligned to parent (Canvas) to avoid offscreen UI.
    const ot = overlay.addComponent(UITransform);
    ot.setContentSize(canvasTrans?.contentSize?.width ?? 1280, canvasTrans?.contentSize?.height ?? 720);
    const widget = overlay.addComponent(Widget);
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.isAlignTop = true;
    widget.isAlignBottom = true;
    widget.left = 0;
    widget.right = 0;
    widget.top = 0;
    widget.bottom = 0;
    widget.alignMode = 1;

    const labelNode = new Node('Tip');
    labelNode.layer = canvasNode.layer;
    overlay.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(980, 260);
    const labelWidget = labelNode.addComponent(Widget);
    labelWidget.isAlignHorizontalCenter = true;
    labelWidget.isAlignVerticalCenter = true;
    labelWidget.horizontalCenter = 0;
    labelWidget.verticalCenter = 0;
    labelWidget.alignMode = 1;

    const label = labelNode.addComponent(Label);
    label.color = new Color(255, 255, 255, 255);
    const room = AppState.room;
    label.string =
      `麻将模块已加载（占位）\n` +
      `roomID=${room?.roomID ?? room?.roomId ?? '(none)'}\n` +
      `serverId=${room?.serverId ?? '(none)'}\n` +
      `\n0.3s 后点击任意位置返回大厅`;
    label.fontSize = 22;
    label.lineHeight = 26;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;

    // Avoid immediately bouncing back due to the click that triggered scene switch
    // (the same pointer event can land on the new scene in some browsers).
    this.scheduleOnce(() => {
      overlay.on(Node.EventType.TOUCH_END, () => {
        AppState.setRoom(null);
        director.loadScene('HallMvp');
      });
    }, 0.3);
  }
}

