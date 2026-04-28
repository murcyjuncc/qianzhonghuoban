import { _decorator, Component, Label, Node, UITransform, Color, director, Widget, Button } from 'cc';
import { AppState } from '../../Script/AppState';

const { ccclass } = _decorator;

/**
 * Mahjong bundle bootstrap (placeholder).
 * This exists mainly to make the bundle non-empty and to provide a stable entry point.
 */
@ccclass('MaJiangBoot')
export class MaJiangBoot extends Component {
  start() {
    // Align to Canvas directly (Widget requires a valid UITransform on parent).
    const canvasNode = this.node.parent ?? this.node;
    const canvasTrans = canvasNode.getComponent(UITransform);

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
      `\n(点击按钮返回大厅)`;
    label.fontSize = 22;
    label.lineHeight = 26;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;

    const btnNode = new Node('BtnBackHall');
    btnNode.layer = canvasNode.layer;
    overlay.addChild(btnNode);
    btnNode.addComponent(UITransform).setContentSize(220, 72);
    const btnWidget = btnNode.addComponent(Widget);
    btnWidget.isAlignHorizontalCenter = true;
    btnWidget.horizontalCenter = 0;
    btnWidget.isAlignBottom = true;
    btnWidget.bottom = 80;
    btnWidget.alignMode = 1;

    const btn = btnNode.addComponent(Button);
    btn.transition = Button.Transition.NONE;

    const btnLabelNode = new Node('Label');
    btnLabelNode.layer = canvasNode.layer;
    btnNode.addChild(btnLabelNode);
    btnLabelNode.addComponent(UITransform).setContentSize(220, 72);
    const blw = btnLabelNode.addComponent(Widget);
    blw.isAlignHorizontalCenter = true;
    blw.isAlignVerticalCenter = true;
    blw.horizontalCenter = 0;
    blw.verticalCenter = 0;
    blw.alignMode = 1;

    const btnLabel = btnLabelNode.addComponent(Label);
    btnLabel.string = '返回大厅';
    btnLabel.color = new Color(255, 255, 255, 255);
    btnLabel.fontSize = 28;
    btnLabel.lineHeight = 32;
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

