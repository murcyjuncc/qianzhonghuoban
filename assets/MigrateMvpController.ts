import { _decorator, Component, Label } from 'cc';

// Load legacy pomelo client (attaches window.pomelo)
import './pomelo-creator-client.js';

const { ccclass, property } = _decorator;

@ccclass('MigrateMvpController')
export class MigrateMvpController extends Component {
  @property({ tooltip: 'Pomelo host (connector clientHost)' })
  public host = '127.0.0.1';

  @property({ tooltip: 'Pomelo clientPort (see server config)' })
  public port = 12000;

  @property({ tooltip: 'Gate HTTP address (old client Constant.gateServerAddress)' })
  public gateServerAddress = 'http://127.0.0.1:13000';

  @property({ tooltip: 'Guest account (will auto-generate if empty)' })
  public account = '';

  @property({ tooltip: 'Guest password (will auto-generate if empty)' })
  public password = '';

  @property({ tooltip: 'Auto register when login says not found (code=105)' })
  public autoRegister = true;

  @property({ tooltip: 'Entry token (can be empty for connectivity test)' })
  public token = '';

  @property(Label)
  public logLabel: Label | null = null;

  private codeMessage(code: number): string {
    // Mirror server-side app/constant/code.js (partial, for MVP)
    switch (code) {
      case 0:
        return 'OK';
      case 2:
        return '请求数据错误（服务端要求 msg.token，当前 token 为空或格式不对）';
      case 105:
        return '账号不存在/未绑定（首次生成游客账号需要先注册）';
      case 10:
        return '服务器维护中';
      case 201:
        return 'token 无效';
      case 203:
        return '账号被冻结';
      default:
        return `未知错误码 ${code}`;
    }
  }

  private log(msg: string) {
    // Keep it visible in both console + UI label
    // eslint-disable-next-line no-console
    console.log(`[MigrateMvp] ${msg}`);
    if (this.logLabel) this.logLabel.string = msg;
  }

  private async postJson<T>(url: string, body: any): Promise<T> {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    return (await resp.json()) as T;
  }

  public async onClickLogin() {
    // Minimal migration login flow:
    // POST {gateServerAddress}/login -> {token, serverInfo} -> pomelo.init -> entry
    const loginUrl = `${this.gateServerAddress}/login`;
    const registerUrl = `${this.gateServerAddress}/register`;
    const account = this.account || `${Date.now()}`;
    const password = this.password || `${Date.now()}`;
    // old enum: enumeration.loginPlatform.ACCOUNT = 1
    const loginPlatform = 1;

    this.log(`开始 HTTP 登录：${loginUrl}`);

    type LoginResp = { code: number; msg?: { token?: string; serverInfo?: { host: string; port: number } } };
    type RegisterResp = {
      code: number;
      msg?: { token?: string; serverInfo?: { host: string; port: number } };
    };

    try {
      let data = await this.postJson<LoginResp>(loginUrl, { account, password, loginPlatform });

      if (!data || typeof data.code !== 'number') {
        this.log(`登录返回异常：${JSON.stringify(data)}`);
        return;
      }

      // If account not found on first login, auto register as guest then login/enter.
      if (data.code === 105 && this.autoRegister) {
        this.log(`登录返回 code=105，开始自动注册游客：${registerUrl}`);
        const registerInfo = {
          nickname: `游客${Math.floor(Math.random() * 9000 + 1000)}`,
          avatar: '',
          sex: Math.floor(Math.random() * 2),
        };
        const reg = await this.postJson<RegisterResp>(registerUrl, {
          account,
          password,
          loginPlatform,
          smsCode: '',
          wxCode: '',
          registerInfo: JSON.stringify(registerInfo),
        });
        if (!reg || typeof reg.code !== 'number') {
          this.log(`注册返回异常：${JSON.stringify(reg)}`);
          return;
        }
        if (reg.code !== 0) {
          this.log(`注册失败 code=${reg.code}（${this.codeMessage(reg.code)}）`);
          return;
        }
        data = reg as any;
        this.log('注册成功，继续连接并 entry...');
      }

      if (data.code !== 0) {
        this.log(`登录失败 code=${data.code}（${this.codeMessage(data.code)}）`);
        return;
      }

      const token = (data as any).msg?.token;
      const serverInfo = (data as any).msg?.serverInfo;
      if (!token || !serverInfo?.host || !serverInfo?.port) {
        this.log(`登录/注册成功但缺少 token/serverInfo：${JSON.stringify((data as any).msg || {})}`);
        return;
      }

      this.token = token;
      this.host = serverInfo.host;
      this.port = serverInfo.port;
      this.log(`登录/注册成功，拿到 token。连接 Pomelo：${this.host}:${this.port}`);

      this.onClickPing();
    } catch (e: any) {
      this.log(`登录异常：${e?.message || e}`);
    }
  }

  public onClickPing() {
    this.log(`准备连接 Pomelo：${this.host}:${this.port}`);

    const pomelo = (globalThis as any).pomelo;
    if (!pomelo || typeof pomelo.init !== 'function') {
      this.log('pomelo 客户端未加载成功（window.pomelo 不存在）');
      return;
    }

    try {
      let connected = false;
      const timeoutId = setTimeout(() => {
        if (!connected) this.log('连接超时：请确认 gameServer 已启动且端口正确（默认 12000）');
      }, 3000);

      if (typeof pomelo.on === 'function') {
        pomelo.off?.('disconnect');
        pomelo.on('disconnect', () => {
          this.log('Pomelo 连接断开（disconnect）');
        });
      }

      pomelo.init({ host: this.host, port: this.port }, () => {
        connected = true;
        clearTimeout(timeoutId);
        this.log('Pomelo 连接成功，开始 entry...');
        const userInfo = {};
        pomelo.request(
          'connector.entryHandler.entry',
          { token: this.token, userInfo },
          (resp: any) => {
            if (resp && typeof resp.code === 'number') {
              this.log(`entry 返回 code=${resp.code}（${this.codeMessage(resp.code)}）`);
            } else {
              this.log(`entry 返回：${JSON.stringify(resp)}`);
            }
          }
        );
      });
    } catch (e: any) {
      this.log(`连接异常：${e?.message || e}`);
    }
  }
}

