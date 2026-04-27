export type EntryOkMsg = {
  userInfo: any;
  config: any;
};

export type RoomSession = {
  roomID?: number | string;
  roomId?: number | string;
  serverId?: string;
  gameRuleID?: number | string;
  unionID?: number | string;
  raw?: any;
  source?: 'createRoom' | 'joinRoom' | 'quickJoin';
};

class AppStateImpl {
  public token = '';
  public userInfo: any = null;
  public config: any = null;
  public room: RoomSession | null = null;

  public setEntryData(token: string, msg: EntryOkMsg) {
    this.token = token;
    this.userInfo = msg?.userInfo ?? null;
    this.config = msg?.config ?? null;
  }

  public setRoom(room: RoomSession | null) {
    this.room = room;
  }
}

export const AppState = new AppStateImpl();

