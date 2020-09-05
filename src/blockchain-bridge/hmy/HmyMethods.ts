import { Harmony } from '@harmony-js/core';
import { Contract } from '@harmony-js/contract';
import { connectToOneWallet, ONE } from './helpers';

interface IHmyMethodsInitParams {
  hmy: Harmony;
  hmyManagerContract: Contract;
  options?: { gasPrice: number; gasLimit: number };
}

export class HmyMethods {
  private hmy: Harmony;
  private hmyManagerContract: Contract;
  private options = { gasPrice: 1000000000, gasLimit: 6721900 };

  constructor(params: IHmyMethodsInitParams) {
    this.hmy = params.hmy;
    this.hmyManagerContract = params.hmyManagerContract;

    if (params.options) {
      this.options = params.options;
    }
  }

  public lockToken = (usdToken, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        await connectToOneWallet(this.hmyManagerContract.wallet, null, reject);

        let options = { ...this.options, value: amount + ONE };

        const res = await this.hmyManagerContract.methods
          .lockToken(usdToken, amount + ONE)
          .send(options);

        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
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
}
