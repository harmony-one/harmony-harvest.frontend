import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error, Spinner } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import {
  addCurrency,
  formatWithSixDecimals,
  formatWithTwoDecimals,
  ones,
  truncateAddressString,
} from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { TOKEN } from '../../stores/interfaces';
// import { Routes } from '../../constants';

const AssetRow = observer<any>(props => {
  return (
    <Box
      className={cn(
        styles.walletBalancesRow,
        props.last ? '' : styles.underline,
      )}
    >
      <Box>
        <Text color={props.selected ? '#00ADE8' : null} bold={false}>
          {props.asset}
        </Text>
      </Box>

      <Box direction="column" align="end">
        <Box className={styles.priceColumn}>
          <Text color={props.selected ? '#00ADE8' : null} bold={true}>
            {props.value}
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

const BalanceRow = observer<any>(props => {
  const Address = ({ children }) =>
    props.address ? (
      <a
        href={process.env.HMY_EXPLORER_URL + '/address/' + props.address}
        target="_blank"
      >
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  return (
    <Box
      className={cn(
        styles.walletBalancesRow,
        props.last ? '' : styles.underline,
      )}
    >
      <Box style={{ width: '40%' }}>
        <Address>
          <Box direction="row">
            <img className={styles.imgToken} src={props.icon} />
            <Text color={props.selected ? '#00ADE8' : null} bold={false}>
              {props.asset}
            </Text>
          </Box>
        </Address>
      </Box>

      <Box direction="column" align="end" style={{ width: '30%' }}>
        <Box className={styles.priceColumn}>
          <Text color={props.selected ? '#00ADE8' : null} bold={true}>
            {props.value}
          </Text>
        </Box>
      </Box>

      <Box direction="column" align="end" style={{ width: '30%' }}>
        <Box className={styles.priceColumn}>
          <Text color={props.selected ? '#00ADE8' : null} bold={true}>
            {props.valueUSD}
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

export const WalletBalances = observer(() => {
  const { user, actionModals, exchange } = useStores();

  if (user.isAuthorized && !user.isInit) {
    return (
      <Box
        direction="column"
        className={styles.walletBalances}
        margin={{ top: 'large' }}
      >
        <Box className={styles.container}>
          <Spinner />;
        </Box>
      </Box>
    );
  }

  const hasRatio = Boolean(Number(user.usdBalance) || Number(user.btcBalance));

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ top: 'large' }}
    >
      {/*<Title>Wallet Info</Title>*/}

      <Box className={styles.container}>
        <Box direction="column" margin={{ bottom: 'small' }}>
          <Box direction="row" justify="between" margin={{ bottom: 'xsmall' }}>
            <Box direction="row" align="center">
              <img className={styles.imgToken} src="/one.svg" />
              <Title margin={{ right: 'xsmall' }}>Harmony</Title>
              <Text margin={{ top: '4px' }}>(ONE Wallet)</Text>
            </Box>
            {user.isAuthorized && (
              <Box
                onClick={() => {
                  user.signOut();
                }}
                margin={{ left: 'medium' }}
              >
                <Icon
                  glyph="Logout"
                  size="24px"
                  style={{ opacity: 0.5 }}
                  color="BlackTxt"
                />
              </Box>
            )}
          </Box>

          {user.isAuthorized ? (
            <Box>
              <AssetRow
                asset="Harmony Address"
                value={truncateAddressString(user.address)}
                last={true}
              />

              <Box
                direction="row"
                justify="between"
                gap="20px"
                margin={{ bottom: 'large', top: 'small' }}
              >
                <Box className={cn(styles.rateInfo)}>
                  <b>{user.isBalancesInit ? user.collateralizationRatio : '--'}%</b>
                  Current collateralization ratio
                </Box>
                <Box className={styles.rateInfo}>
                  <b>{user.normalRatio}%</b>
                  Target collateralization ratio
                </Box>
              </Box>

              <Box
                direction="row"
                justify="around"
                className={styles.exchangeRateContainer}
                margin={{ bottom: 'large' }}
              >
                <Box className={styles.exchangeInfo}>
                  1HRV ={' '}
                  {addCurrency(
                    formatWithTwoDecimals(user.govInfo.exchangePrice),
                  )}
                </Box>
                <Box className={styles.exchangeInfo}>
                  sUSD ={' '}
                  {addCurrency(
                    formatWithTwoDecimals(user.usdInfo.exchangePrice),
                  )}
                </Box>
              </Box>

              <BalanceRow asset="Token" value="Balance" valueUSD="ONE" />

              <BalanceRow
                icon="/one.svg"
                asset="ONE"
                value={formatWithTwoDecimals(ones(user.balance))}
                valueUSD={formatWithTwoDecimals(ones(user.balance))}
              />

              <BalanceRow
                icon="/1HRV_Logo.png"
                asset="1HRV Free"
                value={formatWithTwoDecimals(user.govBalance)}
                valueUSD={formatWithTwoDecimals(
                  Number(user.govBalance) * user.govInfo.exchangePrice,
                )}
                selected={exchange.token === TOKEN.BUSD}
                address={user.govInfo.address}
              />

              <BalanceRow
                icon="/1HRV_Logo.png"
                asset="1HRV Locked"
                value={formatWithTwoDecimals(user.lockedBalance)}
                valueUSD={formatWithTwoDecimals(
                  Number(user.lockedBalance) * user.govInfo.exchangePrice,
                )}
                selected={exchange.token === TOKEN.BUSD}
                address={user.govInfo.address}
              />

              <BalanceRow
                icon="/hUSD_Logo.png"
                asset="hUSD"
                value={formatWithTwoDecimals(user.usdBalance)}
                valueUSD={formatWithTwoDecimals(
                  Number(user.usdBalance) * user.usdInfo.exchangePrice,
                )}
                selected={exchange.token === TOKEN.LINK}
                address={user.usdInfo.address}
              />

              <BalanceRow
                icon="/hBTC_Logo.png"
                asset="hBTC"
                value={formatWithSixDecimals(user.btcBalance)}
                valueUSD={formatWithTwoDecimals(
                  Number(user.btcBalance) * user.btcInfo.exchangePrice,
                )}
                selected={exchange.token === TOKEN.LINK}
                address={user.btcInfo.address}
              />
            </Box>
          ) : (
            <Box direction="row" align="baseline" justify="start">
              <Button
                margin={{ vertical: 'medium' }}
                onClick={() => {
                  if (!user.isOneWallet) {
                    actionModals.open(() => <AuthWarning />, {
                      title: '',
                      applyText: 'Got it',
                      closeText: '',
                      noValidation: true,
                      width: '500px',
                      showOther: true,
                      onApply: () => Promise.resolve(),
                    });
                  } else {
                    user.signIn();
                  }
                }}
              >
                Connect ONE Wallet
              </Button>
              {!user.isOneWallet ? (
                <Error error="ONE Wallet not found" />
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
