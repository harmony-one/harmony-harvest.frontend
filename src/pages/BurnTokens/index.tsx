import * as React from 'react';
import { useState } from 'react';
import { Box } from 'grommet';
import { ItemToken, Spinner, Steps } from 'ui';
import { observer } from 'mobx-react-lite';
import { Button, Icon, NumberInput, Text, Title } from 'components/Base';
import { TOKEN } from 'stores/interfaces';
import { useStores } from 'stores';
import { statusFetching } from '../../constants';
import * as styles from '../Exchange/styles.styl';
import * as stylesLocal from './styles.styl';
import {
  btcTokenMethods,
  govTokenMethods,
  hmyMethods,
  usdTokenMethods,
} from '../../blockchain-bridge';
import {
  formatWithSixDecimals,
  formatWithTwoDecimals,
  truncateAddressString,
} from '../../utils';
import { AssetRow } from '../Exchange/Details';

export const BurnTokens = observer((props: any) => {
  const { user } = useStores();
  const [status, setStatus] = useState<statusFetching>('init');
  const [error, setError] = useState('');
  const [token, setToken] = useState<TOKEN>(TOKEN.BUSD);
  const [txHash, setTxHash] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [amount, setAmount] = useState<string>('0');

  const isPending = status === 'fetching';

  const tokenInfo = token === TOKEN.BUSD ? user.usdInfo : user.btcInfo;

  const willBeMinted =
    (Number(amount) * tokenInfo.rate * tokenInfo.exchangePrice) /
    user.govInfo.exchangePrice;

  // useEffect(() => {
  //   setAddress(user.address);
  // }, [user.address]);

  let icon = () => <Icon style={{ width: 50 }} glyph="RightArrow" />;
  let description = '';

  switch (status) {
    case 'fetching':
      icon = () => <Spinner />;
      description = 'Operation in progress';
      break;

    case 'error':
      icon = () => <Icon size="50" style={{ width: 50 }} glyph="Alert" />;
      description = error;
      break;

    case 'success':
      icon = () => <Icon size="50" style={{ width: 50 }} glyph="CheckMark" />;
      description = 'Success';
      break;
  }

  const actionHandler = async () => {
    setStatus('fetching');
    setError('');

    const tokenAddress =
      token === TOKEN.BUSD
        ? process.env.USD_TOKEN_ADDRESS
        : process.env.BTC_TOKEN_ADDRESS;

    const tokenMethods =
      token === TOKEN.BUSD ? usdTokenMethods : btcTokenMethods;

    const max = token === TOKEN.BUSD ? user.usdBalance : user.btcBalance;

    try {
      if (Number(amount) > Number(max)) {
        throw new Error('Not enough balance');
      }

      if (Number(amount) <= 0) {
        throw new Error('Amount must be more than 0');
      }

      setStep(0);
      let res: any = await tokenMethods.approveToken(
        process.env.DEMETER_CONTRACT_ADDRESS,
        amount,
      );

      if (res.status !== 'called') throw new Error('Transaction rejected');

      setTxHash(res.transactionHash || (res.transaction && res.transaction.id));

      setStep(1);
      res = await hmyMethods.unlockToken(tokenAddress, amount);

      setTxHash(res.transactionHash || (res.transaction && res.transaction.id));

      if (res.status !== 'called') throw new Error('Transaction rejected');

      setStatus('success');
    } catch (e) {
      if (e.status && e.response.body) {
        setError(e.response.body.message);
      } else {
        setError(e.message);
      }

      setStatus('error');
    }
  };

  return (
    <Box
      wrap={true}
      fill={true}
      justify="center"
      align="center"
      margin={{ top: 'xlarge' }}
    >
      <Box
        direction="column"
        pad="xlarge"
        justify="center"
        align="center"
        gap="30px"
        background="white"
        style={{ width: 600, borderRadius: 15 }}
      >
        <Box className={stylesLocal.actionItemLarge}>
          <img src="/burn.svg" />
          <Title>BURN</Title>
          <Text>
            Burn hUSD/hBTC to unlock your locked 1HRV. This increases your
            Collateralization Ratio and reduces your debt, allowing you to
            transfer your non-escrowed 1HRV.
          </Text>
        </Box>
        <Box direction="row">
          <ItemToken
            onClick={setToken}
            disabled={isPending}
            tokenType={TOKEN.BUSD}
            selected={token === TOKEN.BUSD}
          />
          <ItemToken
            onClick={setToken}
            disabled={isPending}
            tokenType={TOKEN.LINK}
            selected={token === TOKEN.LINK}
          />
        </Box>

        {/*<Title size="medium">Mint {token} tokens to your address</Title>*/}
        {status !== 'init' ? (
          <Box
            direction="column"
            align="center"
            justify="center"
            fill={true}
            pad="medium"
            style={{ background: '#dedede40' }}
          >
            {icon()}
            <Box
              className={styles.description}
              align="center"
              margin={{ top: 'medium' }}
            >
              <Text>{description}</Text>
              {txHash ? (
                <a
                  style={{ marginTop: 10 }}
                  href={process.env.HMY_EXPLORER_URL + `/tx/${txHash}`}
                  target="_blank"
                >
                  {truncateAddressString(txHash)}
                </a>
              ) : null}
            </Box>
          </Box>
        ) : null}

        {status === 'fetching' ? (
          <Steps
            steps={[`Approve burn ${token} tokens`, `Unlock 1HRV tokens`]}
            currentStep={step}
          />
        ) : null}

        {status !== 'fetching' && status !== 'success' ? (
          <Box direction="column" gap="30px" align="center">
            <Box
              direction="column"
              align="start"
              gap="5px"
              style={{ width: 400 }}
            >
              <Box direction="row" justify="between" fill={true}>
                <Text>Enter {token} amount to lock:</Text>
                <Text>
                  max:{' '}
                  {token === TOKEN.BUSD ? user.usdBalance : user.btcBalance}
                </Text>
              </Box>
              <NumberInput
                type="decimal"
                precision={6}
                disabled={isPending}
                style={{ width: 400 }}
                value={amount}
                onChange={setAmount}
              />
            </Box>

            <Box direction="column" fill={true} style={{ width: 400 }}>
              <AssetRow label="Collateralization rate" value={tokenInfo.rate} />
              <AssetRow
                label={token + ' exchange price'}
                value={'$ ' + formatWithTwoDecimals(tokenInfo.exchangePrice)}
              />
              <AssetRow
                label={`1HRV will be unlocked`}
                value={formatWithSixDecimals(willBeMinted) + ' 1HRV'}
              />
              <AssetRow label="Harmony network fee" value="0.006721 ONE" />
            </Box>

            {/*<Text>Harmony network fees: $0 / 0.006721 ONE</Text>*/}
            <Box direction="row" justify="center" fill={true}>
              <Button
                transparent={true}
                onClick={props.onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                style={{ marginLeft: 20 }}
                onClick={actionHandler}
                disabled={isPending}
              >
                Burn {token} tokens
              </Button>
            </Box>
          </Box>
        ) : null}

        {status === 'success' ? (
          <Button
            transparent={true}
            onClick={props.onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        ) : null}
      </Box>
    </Box>
  );
});
