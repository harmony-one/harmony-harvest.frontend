import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToOneWallet } from './helpers';

const ONE = '000000000000000000';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethods {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };
  public governanceAddress: string;

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }

    this.getGovernanceAddress().then(
      address => (this.governanceAddress = address),
    );
  }

  private createAction = (callback: () => Promise<any>): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        const res = await callback();

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  public lockToken = (usdToken, amount): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        // console.log(111, usdToken, amount)

        const res = await this.hmyManagerContract.methods
          .lockToken(usdToken, amount + ONE)
          .send(this.options);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  public unlockToken = (usdToken, govToken, amount) => {
    return this.createAction(() =>
      this.hmyManagerContract.methods
        .unlockToken(usdToken, govToken, amount + ONE)
        .send(this.options),
    );
  };

  public getSynth = async tokenAddress => {
    const [
      address,
      exchangePrice,
      rate,
      gov,
    ] = await this.hmyManagerContract.methods
      .getSynth(tokenAddress)
      .call(this.options);

    return {
      address,
      gov: Boolean(Number(gov)),
      rate: Number(rate),
      exchangePrice: Number(exchangePrice),
    };
  };

  public getGovernanceAddress = async () => {
    return await this.hmyManagerContract.methods
      .getGovernanceAddress()
      .call(this.options);
  };
}

interface IHmyTokenMethodsInitParams {
  hmy: Harmony;
  tokenContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyTokenMethods {
  private hmy: Harmony;
  private tokenContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  constructor(params: IHmyTokenMethodsInitParams) {
    this.hmy = params.hmy;
    this.tokenContract = params.tokenContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  public getBalance = async address => {
    const addrHex = this.hmy.crypto.getAddress(address).checksum;

    const balance = await this.tokenContract.methods
      .balanceOf(addrHex)
      .call(this.options);

    return String(balance / 1e18);
  };

  public sendTokens = (receiverAddress, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.tokenContract.wallet, null, reject);

        const res = await this.tokenContract.methods
          .transfer(receiverAddress, amount + ONE)
          .send(this.options);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };

  public approveToken = (demeterAddr, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.tokenContract.wallet, null, reject);

        let res = await this.tokenContract.methods
          .approve(demeterAddr, amount + ONE)
          .send(this.options);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  };
}
