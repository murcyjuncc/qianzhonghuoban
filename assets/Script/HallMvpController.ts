import { _decorator, Component, Label, Node, UITransform, Color } from 'cc';
import { AppState } from './AppState';

const { ccclass, property } = _decorator;

@ccclass('HallMvpController')
export class HallMvpController extends Component {
  @property(Label)
  public infoLabel: Label | null = null;

  @property(Node)
  public roomPanel: Node | null = null;

  private roomOverlay: Node | null = null;

  start() {
    const u = AppState.userInfo || {};
    const uid = u.uid ?? u._id ?? '(unknown)';
    const nickname = u.nickname ?? '(no nickname)';
    const cfg = AppState.config || {};
    const cfgKeys = cfg && typeof cfg === 'object' ? Object.keys(cfg).slice(0, 8) : [];
    const line =
      `大厅初始化成功` +
      `\\nuid=${uid}` +
      `\\nnickname=${nickname}` +
      `\\nconfigKeys=${cfgKeys.join(',') || '(none)'}`;
    if (this.infoLabel) this.infoLabel.string = line;
  }

  update() {
    // If room session exists, show overlay once.
    const room = AppState.room;
    if (room && !this.roomOverlay) {
      this.showRoomOverlay(room);
    }
    // If room session cleared, ensure overlay is removed.
    if (!room && this.roomOverlay) {
      this.roomOverlay.destroy();
      this.roomOverlay = null;
    }
  }

  private showRoomOverlay(room: any) {
    const parent = this.node; // HallMvpRoot in scene
    const overlay = new Node('RoomOverlay');
    overlay.layer = parent.layer;
    parent.addChild(overlay);

    const pt = parent.getComponent(UITransform);
    const size = pt?.contentSize;

    const ot = overlay.addComponent(UITransform);
    if (size) {
      ot.setContentSize(size);
    }

    // Use a simple label as a "modal".
    const labelNode = new Node('RoomOverlayLabel');
    labelNode.layer = parent.layer;
    overlay.addChild(labelNode);
    const lt = labelNode.addComponent(UITransform);
    lt.setContentSize(900, 520);

    const label = labelNode.addComponent(Label);
    label.color = new Color(255, 255, 255, 255);
    label.string = this.formatRoomOverlayText(room);
    label.fontSize = 22;
    label.lineHeight = 26;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;

    // Click anywhere to close.
    overlay.on(Node.EventType.TOUCH_END, () => {
      AppState.setRoom(null);
    });

    this.roomOverlay = overlay;
  }

  private formatRoomOverlayText(room: any): string {
    const rid = room?.roomID ?? room?.roomId ?? '(unknown)';
    const serverId = room?.serverId ?? '(unknown)';
    const unionID = room?.unionID ?? '(unknown)';
    const gameRuleID = room?.gameRuleID ?? '(unknown)';
    const source = room?.source ?? '(unknown)';
    return (
      `已进入房间（MVP占位面板）` +
      `\\nsource=${source}` +
      `\\nroomID=${rid}` +
      `\\nserverId=${serverId}` +
      `\\nunionID=${unionID}` +
      `\\ngameRuleID=${gameRuleID}` +
      `\\n\\n点击任意位置关闭（返回大厅）`
    );
  }

  // Button click event signature: (event, customEventData)
  public onClickPlaceholder(_event?: unknown, feature?: string) {
    const f = feature ?? '(unknown)';
    // eslint-disable-next-line no-console
    console.log(`[HallMvp] click ${f}`);

    if (f === 'Room') {
      const panelNode = this.roomPanel;
      if (panelNode && panelNode.getComponent) {
        const ctrl = panelNode.getComponent('RoomPanelController') as any;
        if (ctrl && typeof ctrl.show === 'function') ctrl.show();
        panelNode.active = true;
        return;
      }
      if (this.infoLabel) this.infoLabel.string = 'Room 面板未配置/未挂脚本';
      return;
    }

    const line = `点击入口：${f}\\n(下一步迁移该模块真实UI/逻辑)`;
    if (this.infoLabel) this.infoLabel.string = line;
  }
}

