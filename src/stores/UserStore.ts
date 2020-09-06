import {action, computed, observable} from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
import {
  getHmyBalance,
  usdTokenMethods,
  btcTokenMethods,
  govTokenMethods,
    hmyMethods
} from '../blockchain-bridge';
import { StoreConstructor } from './core/StoreConstructor';

const defaults = {};

export interface ISynth {
  address: string;
  gov: boolean;
  rate: number;
  exchangePrice: number;
}

export class UserStoreEx extends StoreConstructor {
  public stores: IStores;
  @observable public isAuthorized: boolean;
  public status: statusFetching;
  redirectUrl: string;

  private onewallet: any;
  @observable public isOneWallet = false;

  @observable public sessionType: 'mathwallet' | 'ledger' | 'wallet';
  @observable public address: string;

  @observable public balance: string = '0';

  @observable public usdBalance: string = '0';
  @observable public btcBalance: string = '0';
  @observable public govBalance: string = '0';
  @observable public lockedBalance: string = '0';

  @observable public usdInfo: ISynth;
  @observable public btcInfo: ISynth;
  @observable public govInfo: ISynth;

  normalRatio = 800;

  @computed
  get collateralizationRatio() {
    // return Number(this.usdBalance) * this.usdInfo.rate;
    return 800;
  }


  constructor(stores) {
    super(stores);

    setInterval(async () => {
      // @ts-ignore
      this.isOneWallet = window.onewallet && window.onewallet.isOneWallet;
      // @ts-ignore
      this.onewallet = window.onewallet;

      // await this.getBalances();
      // await this.getOneBalance();
    }, 3000);

    setInterval(() => this.getBalances(), 3 * 1000);

    // @ts-ignore
    this.isOneWallet = window.onewallet && window.onewallet.isOneWallet;
    // @ts-ignore
    this.onewallet = window.onewallet;

    const session = localStorage.getItem('harmony_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.address) {
      this.address = sessionObj.address;
      this.sessionType = sessionObj.sessionType;
      this.isAuthorized = true;

      this.stores.exchange.transaction.oneAddress = this.address;

      this.getOneBalance();
      this.getSynthsInfo();
    }
  }

  @action public signIn() {
    return this.onewallet
      .getAccount()
      .then(account => {
        this.sessionType = `mathwallet`;
        this.address = account.address;
        this.isAuthorized = true;

        this.stores.exchange.transaction.oneAddress = this.address;

        this.syncLocalStorage();

        this.getOneBalance();

        return Promise.resolve();
      })
      .catch(e => {
        this.onewallet.forgetIdentity();
      });
  }

  @action public getBalances = async () => {
    if (this.address) {
      try {
        let res = await getHmyBalance(this.address);
        this.balance = res && res.result;

        this.usdBalance = await usdTokenMethods.getBalance(this.address);
        this.btcBalance = await btcTokenMethods.getBalance(this.address);
        this.govBalance = await govTokenMethods.getBalance(this.address);
        this.lockedBalance = await hmyMethods.getLockedBalance(this.address);
      } catch (e) {
        console.error(e);
      }
    }
  };

  @action public getSynthsInfo = async () => {
      try {
        this.usdInfo = await hmyMethods.getSynth(process.env.USD_TOKEN_ADDRESS);
        this.btcInfo = await hmyMethods.getSynth(process.env.BTC_TOKEN_ADDRESS);
        this.govInfo = await hmyMethods.getSynth(process.env.HRV_TOKEN_ADDRESS);
      } catch (e) {
        console.error(e);
      }
  };

  @action public getOneBalance = async () => {
    if (this.address) {
      let res = await getHmyBalance(this.address);
      this.balance = res && res.result;
    }
  };

  @action public signOut() {
    if (this.isOneWallet) {
      this.isAuthorized = false;

      return this.onewallet
        .forgetIdentity()
        .then(() => {
          this.sessionType = null;
          this.address = null;
          this.isAuthorized = false;

          // this.balanceGem = '0';
          // this.balanceDai = '0';
          // this.balance = '0';
          //
          // this.vat = { ink: '0', art: '0' };

          this.syncLocalStorage();

          return Promise.resolve();
        })
        .catch(err => {
          console.error(err.message);
        });
    }
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'harmony_session',
      JSON.stringify({
        address: this.address,
        sessionType: this.sessionType,
      }),
    );
  }

  @action public signTransaction(txn: any) {
    if (this.sessionType === 'mathwallet' && this.isOneWallet) {
      return this.onewallet.signTransaction(txn);
    }
  }

  public saveRedirectUrl(url: string) {
    if (!this.isAuthorized && url) {
      this.redirectUrl = url;
    }
  }

  @action public reset() {
    Object.assign(this, defaults);
  }
}
