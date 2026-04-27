import { _decorator, Component, EditBox, Label } from 'cc';
import { RoomService } from './RoomService';
import { AppState } from './AppState';

const { ccclass, property } = _decorator;

@ccclass('RoomPanelController')
export class RoomPanelController extends Component {
  @property(EditBox)
  public unionIdEdit: EditBox | null = null;

  @property(EditBox)
  public ruleIdEdit: EditBox | null = null;

  @property(EditBox)
  public roomIdEdit: EditBox | null = null;

  @property(Label)
  public resultLabel: Label | null = null;

  @property(EditBox)
  public gameRuleJsonEdit: EditBox | null = null;

  public show() {
    this.node.active = true;
    const u = RoomService.getEntryUserInfo() || {};
    const unionInfo = (u as any).unionInfo;

    // Try to prefill unionID if exists (userInfo -> config -> cached last input)
    if (this.unionIdEdit && !this.unionIdEdit.string) {
      const cfg = AppState.config || {};
      const candidates: any[] = [];

      // 1) userInfo common fields
      const direct =
        (u.unionID ?? u.unionId ?? u.union_id ?? u.union?.id ?? u.union?.unionID ?? u.union?.unionId) as any;
      if (direct !== undefined && direct !== null) candidates.push(direct);

      // 2) userInfo list shapes: unions/unionList/clubList
      for (const key of ['unions', 'unionList', 'clubList', 'clubs', 'teaHouseList', 'teahouseList']) {
        const v = (u as any)[key];
        if (Array.isArray(v) && v.length) candidates.push(v[0]);
      }

      // 3) config shapes
      for (const key of ['unionID', 'unionId', 'defaultUnionID', 'defaultUnionId']) {
        const v = (cfg as any)[key];
        if (v !== undefined && v !== null) candidates.push(v);
      }
      for (const key of ['unions', 'unionList', 'clubList', 'clubs', 'teaHouses', 'teahouses']) {
        const v = (cfg as any)[key];
        if (Array.isArray(v) && v.length) candidates.push(v[0]);
      }

      const pickFromObj = (obj: any) =>
        obj?.unionID ??
        obj?.unionId ??
        obj?.union_id ??
        obj?.id ??
        obj?._id ??
        obj?.clubId ??
        obj?.clubID ??
        obj?.teaHouseId ??
        obj?.teaHouseID;

      let inferred: any = candidates.find((x) => typeof x === 'number' || typeof x === 'string');
      if (inferred && typeof inferred === 'object') inferred = pickFromObj(inferred);
      if (inferred && typeof inferred === 'object') inferred = pickFromObj(inferred);

      // 4) last cached value
      if (inferred === undefined || inferred === null || inferred === '') {
        try {
          const cached = (globalThis as any)?.localStorage?.getItem?.('mvp_unionID');
          if (cached) inferred = cached;
        } catch {
          // ignore
        }
      }

      if (inferred !== undefined && inferred !== null && inferred !== '') {
        this.unionIdEdit.string = String(inferred);
      }
    }

    // If still no unionID, give actionable hint early (most servers require union/club for room ops).
    if (this.unionIdEdit && !this.unionIdEdit.string) {
      const hasUnionList =
        Array.isArray(unionInfo) ? unionInfo.length > 0 : Array.isArray((u as any).unions) ? (u as any).unions.length > 0 : false;
      if (!hasUnionList) {
        this.setResult(
          '未获取到 unionID：当前账号 unionInfo 为空。\n' +
            '创建房间/快速加入通常需要先创建或加入亲友圈(茶馆)/联盟后才会分配 unionID。\n' +
            '你也可以手动输入一个有效的 unionID 再试。'
        );
      }
    }

    // Fire-and-forget connectivity probe to distinguish "hall route unreachable" vs "game rpc stuck".
    // (This is safe to ignore if server hasn't updated yet.)
    RoomService.pingHall()
      .then((resp) => {
        // eslint-disable-next-line no-console
        console.log('[RoomPanel] hall.ping resp=', resp);
      })
      .catch((e: any) => {
        // eslint-disable-next-line no-console
        console.warn('[RoomPanel] hall.ping failed:', e?.message || e);
      });

    // Prefill a default ruleId if we can infer it from config.
    if (this.ruleIdEdit && !this.ruleIdEdit.string) {
      const cfg = AppState.config || {};
      const candidates: any[] = [];
      // Try common shapes: config.gameRules = [{ gameRuleID: 1 }, ...] or config.ruleList = [...]
      for (const key of ['gameRules', 'ruleList', 'rules', 'gameRuleList', 'gameRuleCfg']) {
        const v = (cfg as any)[key];
        if (Array.isArray(v) && v.length) candidates.push(...v);
      }
      const first = candidates[0];
      const id =
        first?.gameRuleID ?? first?.gameRuleId ?? first?.ruleId ?? first?.ruleID ?? first?.id ?? first?._id;
      if (id !== undefined && id !== null) this.ruleIdEdit.string = String(id);
    }

    // If scene has a rule json editbox, prefill from config snapshot.
    if (this.gameRuleJsonEdit && !this.gameRuleJsonEdit.string) {
      const cfg = AppState.config || {};
      const rule =
        (cfg.gameRuleDefault ?? cfg.gameRule ?? cfg.rule ?? cfg.defaultRule) &&
        typeof (cfg.gameRuleDefault ?? cfg.gameRule ?? cfg.rule ?? cfg.defaultRule) === 'object'
          ? (cfg.gameRuleDefault ?? cfg.gameRule ?? cfg.rule ?? cfg.defaultRule)
          : null;
      if (rule) this.gameRuleJsonEdit.string = JSON.stringify(rule);
    }
  }

  public hide() {
    this.node.active = false;
  }

  private codeMessage(code: number): string {
    switch (code) {
      case 0:
        return 'OK';
      case 2:
        return '请求数据错误（参数缺失/格式不对）';
      case 10:
        return '服务器维护中';
      case 201:
        return 'token 无效';
      case 203:
        return '账号被冻结';
      case 308:
        return '房间不存在（ROOM_NOT_EXIST）';
      default:
        return `未知错误码 ${code}`;
    }
  }

  private formatResp(title: string, resp: any): string {
    if (!resp || typeof resp !== 'object') return `${title} 返回：${String(resp)}`;
    const code = typeof resp.code === 'number' ? resp.code : NaN;
    const ok = code === 0;
    const clientMsg = Number.isFinite(code) ? this.codeMessage(code) : '无 code 字段';
    const brief: any = { code: resp.code, clientMsg, ok };

    // Try to surface common fields without knowing exact server schema.
    for (const k of ['roomID', 'roomId', 'rid', 'unionID', 'unionId', 'gameRuleID', 'gameRuleId', 'serverId']) {
      if (resp[k] !== undefined) brief[k] = resp[k];
    }
    if (resp.msg !== undefined) {
      // keep server raw msg separate from clientMsg, avoid confusion
      brief.serverMsg = resp.msg;
    }
    if (resp.data !== undefined) brief.data = resp.data;

    // Keep output readable in a Label.
    let json = '';
    try {
      json = JSON.stringify(brief, null, 2);
    } catch {
      json = JSON.stringify(brief);
    }
    return `${title} 返回：\n${json}`;
  }

  private extractRoomSession(source: 'createRoom' | 'joinRoom' | 'quickJoin', resp: any) {
    if (!resp || typeof resp !== 'object') return null;
    const code = typeof resp.code === 'number' ? resp.code : NaN;
    if (code !== 0) return null;

    const pick = (...paths: any[]) => {
      for (const p of paths) {
        if (p !== undefined && p !== null && p !== '') return p;
      }
      return undefined;
    };

    const roomID = pick(
      resp.roomID,
      resp.roomId,
      resp.rid,
      resp.data?.roomID,
      resp.data?.roomId,
      resp.msg?.roomID,
      resp.msg?.roomId,
      resp.msg?.rid
    );

    const serverId = pick(resp.serverId, resp.serverID, resp.data?.serverId, resp.msg?.serverId);
    const unionID = pick(resp.unionID, resp.unionId, resp.data?.unionID, resp.msg?.unionID);
    const gameRuleID = pick(resp.gameRuleID, resp.gameRuleId, resp.data?.gameRuleID, resp.msg?.gameRuleID);

    return {
      source,
      roomID,
      roomId: resp.roomId,
      serverId,
      unionID,
      gameRuleID,
      raw: resp,
    };
  }

  private setResult(line: string) {
    // eslint-disable-next-line no-console
    console.log(`[RoomPanel] ${line}`);
    if (this.resultLabel) this.resultLabel.string = line;
  }

  private parseRequiredInt(fieldName: string, raw: string): number | null {
    const s = (raw ?? '').trim();
    if (!s) {
      this.setResult(`${fieldName} 不能为空`);
      return null;
    }
    const n = parseInt(s, 10);
    if (!Number.isFinite(n)) {
      this.setResult(`${fieldName} 必须是数字：当前="${s}"`);
      return null;
    }
    return n;
  }

  public async onClickQuickJoin() {
    try {
      const unionID = this.parseRequiredInt('unionID', this.unionIdEdit?.string ?? '');
      if (unionID === null) return;
      const gameRuleID = this.parseRequiredInt('gameRuleID', this.ruleIdEdit?.string ?? '');
      if (gameRuleID === null) return;
      this.setResult(`quickJoin 请求中... unionID=${unionID} gameRuleID=${gameRuleID}`);
      const resp = await RoomService.quickJoin(unionID, gameRuleID);
      const line = this.formatResp('quickJoin', resp);
      this.setResult(line);

      const session = this.extractRoomSession('quickJoin', resp);
      if (session) {
        AppState.setRoom(session);
        const rid = session.roomID ?? session.roomId ?? '(unknown)';
        this.setResult(`quickJoin 成功，roomID=${rid}\n(下一步：迁移玩法模块后这里将切换到房间/游戏场景)`);
        this.hide();
      }
    } catch (e: any) {
      this.setResult(`quickJoin 异常：${e?.message || e}`);
    }
  }

  public async onClickJoinRoom() {
    try {
      const roomID = this.parseRequiredInt('roomID', this.roomIdEdit?.string ?? '');
      if (roomID === null) return;
      this.setResult(`joinRoom 请求中... roomID=${roomID}`);
      const resp = await RoomService.joinRoom(roomID);
      const line = this.formatResp('joinRoom', resp);
      this.setResult(line);

      const session = this.extractRoomSession('joinRoom', resp);
      if (session) {
        AppState.setRoom(session);
        const rid = session.roomID ?? session.roomId ?? roomID;
        this.setResult(`joinRoom 成功，roomID=${rid}\n(下一步：迁移玩法模块后这里将切换到房间/游戏场景)`);
        this.hide();
      }
    } catch (e: any) {
      this.setResult(`joinRoom 异常：${e?.message || e}`);
    }
  }

  public async onClickCreateRoom() {
    try {
      const unionID = this.parseRequiredInt('unionID', this.unionIdEdit?.string ?? '');
      if (unionID === null) return;
      const gameRuleID = this.parseRequiredInt('gameRuleID', this.ruleIdEdit?.string ?? '');
      if (gameRuleID === null) return;

      // cache last used unionID for next open
      try {
        (globalThis as any)?.localStorage?.setItem?.('mvp_unionID', String(unionID));
      } catch {
        // ignore
      }

      let gameRule: any = {};
      const raw = this.gameRuleJsonEdit?.string?.trim();
      if (raw) {
        try {
          gameRule = JSON.parse(raw);
        } catch (e: any) {
          this.setResult(`createRoom 规则JSON解析失败：${e?.message || e}`);
          return;
        }
      }
      this.setResult(`createRoom 请求中... unionID=${unionID} gameRuleID=${gameRuleID}`);
      const resp = await RoomService.createRoom(unionID, gameRuleID, gameRule);
      const line = this.formatResp('createRoom', resp);
      this.setResult(line);

      const session = this.extractRoomSession('createRoom', resp);
      if (session) {
        AppState.setRoom(session);
        const rid = session.roomID ?? session.roomId ?? '(unknown)';
        this.setResult(`createRoom 成功，roomID=${rid}\n(下一步：迁移玩法模块后这里将切换到房间/游戏场景)`);
        this.hide();
      }
    } catch (e: any) {
      this.setResult(`createRoom 异常：${e?.message || e}`);
    }
  }
}

