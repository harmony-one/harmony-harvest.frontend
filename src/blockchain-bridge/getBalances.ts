import { hmy } from './hmy';

export const getBech32Address = address =>
  hmy.crypto.getAddress(address).bech32;

export const getHmyBalance = address => {
  return hmy.blockchain.getBalance({ address });
};
