import { _decorator, Component, Label, Node } from 'cc';
import { AppState } from './AppState';

const { ccclass, property } = _decorator;

@ccclass('HallMvpController')
export class HallMvpController extends Component {
  @property(Label)
  public infoLabel: Label | null = null;

  @property(Node)
  public roomPanel: Node | null = null;

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

