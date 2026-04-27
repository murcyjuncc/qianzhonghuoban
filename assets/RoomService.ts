import { AppState } from './AppState';

type Pomelo = {
  request: (route: string, msg: any, cb: (resp: any) => void) => void;
};

function getPomelo(): Pomelo {
  const p = (globalThis as any).pomelo;
  if (!p || typeof p.request !== 'function') {
    throw new Error('pomelo 未就绪：请先完成登录并 entry');
  }
  return p as Pomelo;
}

function request(route: string, msg: any): Promise<any> {
  const pomelo = getPomelo();
  const timeoutMs = 10000;
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error(`请求超时（${timeoutMs}ms）：${route}`));
    }, timeoutMs);

    pomelo.request(route, msg, (resp: any) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(resp);
    });
  });
}

export const RoomService = {
  pingHall() {
    return request('hall.gameHandler.ping', {});
  },

  quickJoin(unionID: string | number, gameRuleID: string | number) {
    return request('hall.gameHandler.quickJoin', {
      unionID: typeof unionID === 'string' ? parseInt(unionID) : unionID,
      gameRuleID: typeof gameRuleID === 'string' ? parseInt(gameRuleID) : gameRuleID,
    });
  },

  joinRoom(roomID: string | number) {
    return request('hall.gameHandler.joinRoom', {
      roomID: typeof roomID === 'string' ? parseInt(roomID) : roomID,
    });
  },

  // Keep as extension point; actual rule structure is large.
  createRoom(unionID: string | number, gameRuleID: string | number, gameRule: any) {
    return request('hall.gameHandler.createRoom', {
      unionID: typeof unionID === 'string' ? parseInt(unionID) : unionID,
      gameRuleID: typeof gameRuleID === 'string' ? parseInt(gameRuleID) : gameRuleID,
      gameRule,
    });
  },

  getEntryUserInfo() {
    return AppState.userInfo;
  },
};

