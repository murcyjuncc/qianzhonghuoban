export type EntryOkMsg = {
  userInfo: any;
  config: any;
};

class AppStateImpl {
  public token = '';
  public userInfo: any = null;
  public config: any = null;

  public setEntryData(token: string, msg: EntryOkMsg) {
    this.token = token;
    this.userInfo = msg?.userInfo ?? null;
    this.config = msg?.config ?? null;
  }
}

export const AppState = new AppStateImpl();

