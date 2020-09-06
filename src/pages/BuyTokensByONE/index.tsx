import * as React from 'react';
import { useCallback, useState } from 'react';
import { Box } from 'grommet';
import { ItemToken, Spinner } from 'ui';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Icon,
  NumberInput,
  Text,
  TextInput,
  Title,
} from 'components/Base';
import { TOKEN } from 'stores/interfaces';
import { useStores } from 'stores';
import { statusFetching } from '../../constants';
import * as styles from '../Exchange/styles.styl';
import * as stylesLocal from './styles.styl';
import { hmyMethods } from '../../blockchain-bridge';
import { AssetRow } from '../Exchange/Details';
import { formatWithSixDecimals, formatWithTwoDecimals } from '../../utils';

export const BuyTokens = observer((props: any) => {
  const { user } = useStores();
  const [status, setStatus] = useState<statusFetching>('init');
  const [error, setError] = useState('');
  const [token, setToken] = useState<TOKEN>(TOKEN.BUSD);
  const [address, setAddress] = useState<string>('0');

  const isPending = status === 'fetching';

  const willBeMinted = Number(address) / user.govInfo.exchangePrice;

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

  const actionHandler = () => {
    setStatus('fetching');
    setError('');

    const tokenAddress =
      token === TOKEN.BUSD
        ? process.env.USD_TOKEN_ADDRESS
        : process.env.BTC_TOKEN_ADDRESS;

    hmyMethods
      .getGovTokenByOne(address)
      .then((res: any) => {
        if (res.status === 'called') {
          setStatus('success');
        } else {
          throw new Error('Transaction rejected');
        }
      })
      .catch(e => {
        if (e.status && e.response.body) {
          setError(e.response.body.message);
        } else {
          setError(e.message);
        }

        setStatus('error');
      });
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
        <Box className={stylesLocal.actionItemLarge} style={{ height: 150 }}>
          <img src="/trade.svg" />
          <Title>EXCHANGE</Title>
          <Text>Buy 1HRV by ONEs</Text>
        </Box>
        {/*<Box direction="row">*/}
        {/*  <ItemToken*/}
        {/*    onClick={setToken}*/}
        {/*    disabled={isPending}*/}
        {/*    tokenType={TOKEN.BUSD}*/}
        {/*    selected={token === TOKEN.BUSD}*/}
        {/*  />*/}
        {/*  <ItemToken*/}
        {/*    onClick={setToken}*/}
        {/*    disabled={isPending}*/}
        {/*    tokenType={TOKEN.LINK}*/}
        {/*    selected={token === TOKEN.LINK}*/}
        {/*  />*/}
        {/*</Box>*/}
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
            <Box className={styles.description} margin={{ top: 'medium' }}>
              <Text>{description}</Text>
              {/*{exchange.txHash ? (*/}
              {/*  <a*/}
              {/*    style={{ marginTop: 10 }}*/}
              {/*    href={EXPLORER_URL + `/tx/${exchange.txHash}`}*/}
              {/*    target="_blank"*/}
              {/*  >*/}
              {/*    Tx id: {truncateAddressString(exchange.txHash)}*/}
              {/*  </a>*/}
              {/*) : null}*/}
            </Box>
          </Box>
        ) : null}

        <Box direction="column" align="center" gap="5px">
          <Text>Enter ONEs amount:</Text>
          <NumberInput
            disabled={isPending}
            style={{ width: 400 }}
            value={address}
            onChange={setAddress}
          />
        </Box>

        <Box direction="column" fill={true} style={{ width: 400 }}>
          <AssetRow
            label={'1HRV exchange price'}
            value={formatWithTwoDecimals(user.govInfo.exchangePrice) + 'ONE'}
          />
          <AssetRow
            label={`1HRV, will be received`}
            value={formatWithSixDecimals(willBeMinted) + ' 1HRV'}
          />
          <AssetRow label="Harmony network fee" value="0.006721 ONE" />
        </Box>

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
            Buy 1HRV tokens
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
