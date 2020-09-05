import { HmyMethods, HmyTokenMethods } from './HmyMethods';
const { Harmony } = require('@harmony-js/core');
const { ChainID, ChainType } = require('@harmony-js/utils');

export const hmy = new Harmony(
  // let's assume we deploy smart contract to this end-point URL
  process.env.HMY_NODE_URL,
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  },
);

const mainJson = require('../out/Demeter.json');
const mainContract = this.hmy.contracts.createContract(
    mainJson.abi,
  process.env.MAIN_CONTRACT_ADDRESS,
);

const tokenJson = require('../out/IERC20.json');
const usdContract = this.hmy.contracts.createContract(
    tokenJson.abi,
    process.env.USD_TOKEN_ADDRESS,
);

const govContract = this.hmy.contracts.createContract(
    tokenJson.abi,
    process.env.GOV_TOKEN_ADDRESS,
);

const btcContract = this.hmy.contracts.createContract(
    tokenJson.abi,
    process.env.BTC_TOKEN_ADDRESS,
);

export const hmyMethods = new HmyMethods({
  hmy: hmy,
  hmyManagerContract: mainContract,
});

export const govTokenMethods = new HmyTokenMethods({
    hmy: hmy,
    tokenContract: govContract,
});

export const usdTokenMethods = new HmyTokenMethods({
    hmy: hmy,
    tokenContract: usdContract,
});

export const btcTokenMethods = new HmyTokenMethods({
    hmy: hmy,
    tokenContract: btcContract,
});

