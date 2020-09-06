import { action, computed, observable } from 'mobx';
import { IStores } from 'stores';
import { statusFetching } from '../constants';
import {
  getHmyBalance,
  usdTokenMethods,
  btcTokenMethods,
  govTokenMethods,
  hmyMethods,
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

  @observable public contractBalance: string = '0';

  @observable public usdInfo: ISynth;
  @observable public btcInfo: ISynth;
  @observable public govInfo: ISynth;

  @observable isInit = false;
  @observable isBalancesInit = false;

  normalRatio = 1000;

  @computed
  get collateralizationRatio() {
    if (
      !this.isInit ||
      !this.isBalancesInit ||
      !this.lockedBalance ||
      !this.govInfo
    ) {
      return 0;
    }

    const totalLocked = Number(this.lockedBalance) * this.govInfo.exchangePrice;

    const totalAsset =
      Number(this.btcBalance) * this.btcInfo.exchangePrice +
      Number(this.usdBalance) * this.usdInfo.exchangePrice;

    if (!totalAsset) {
      return 0;
    }

    return Math.round(totalLocked / totalAsset) * 100;
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
    setInterval(() => this.getSynthsInfo(), 5 * 1000);

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

  @observable reloadStatus = 'init';

  @action public reload = async () => {
    this.reloadStatus = 'fetching';

    await this.getSynthsInfo();
    await this.getBalances();

    this.reloadStatus = 'success';
  };

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
        this.getSynthsInfo();

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

      this.isBalancesInit = true;
    }

    this.contractBalance = await govTokenMethods.getBalance(
        process.env.DEMETER_CONTRACT_ADDRESS,
    );
  };

  @action public getSynthsInfo = async () => {
    try {
      this.usdInfo = await hmyMethods.getSynth(process.env.USD_TOKEN_ADDRESS);
      this.btcInfo = await hmyMethods.getSynth(process.env.BTC_TOKEN_ADDRESS);
      this.govInfo = await hmyMethods.getSynth(process.env.HRV_TOKEN_ADDRESS);

      this.isInit = true;
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
