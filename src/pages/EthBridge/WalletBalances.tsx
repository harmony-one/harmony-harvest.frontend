import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import {
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
  return (
    <Box
      className={cn(
        styles.walletBalancesRow,
        props.last ? '' : styles.underline,
      )}
    >
      <Box style={{ width: "40%" }}>
        <Text color={props.selected ? '#00ADE8' : null} bold={false}>
          {props.asset}
        </Text>
      </Box>

      <Box direction="column" align="end" style={{ width: "30%" }}>
        <Box className={styles.priceColumn}>
          <Text color={props.selected ? '#00ADE8' : null} bold={true}>
            {props.value}
          </Text>
        </Box>
      </Box>

      <Box direction="column" align="end" style={{ width: "30%" }}>
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

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ vertical: 'large' }}
    >
      {/*<Title>Wallet Info</Title>*/}

      <Box className={styles.container}>
        <Box direction="column" margin={{ bottom: 'large' }}>
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
                <Box className={styles.rateInfo}>
                  <b>{!user.usdBalance ? "0%" : "1000%"}</b>
                  Current collateralization ratio
                </Box>
                <Box className={styles.rateInfo}>
                  <b>800%</b>
                  Target collateralization ratio
                </Box>
              </Box>

              <Box
                direction="row"
                justify="around"
                className={styles.exchangeRateContainer}
                margin={{ bottom: 'large' }}
              >
                <Box className={styles.exchangeInfo}>1HRV = $5.10 USD</Box>
                <Box className={styles.exchangeInfo}>ONE = $382.06 USD</Box>
              </Box>

              <BalanceRow asset="Token" value="Balance" valueUSD="$ USD" />

              <BalanceRow
                asset="Harmony ONE"
                value={formatWithTwoDecimals(ones(user.balance))}
                valueUSD={formatWithTwoDecimals(ones(user.balance))}
              />

              <BalanceRow
                asset="Harmony 1HRV"
                value={formatWithTwoDecimals(user.govBalance)}
                valueUSD={formatWithTwoDecimals(ones(user.govBalance))}
                selected={exchange.token === TOKEN.BUSD}
              />

              <BalanceRow
                asset="Harmony hUSD"
                value={formatWithTwoDecimals(user.usdBalance)}
                valueUSD={formatWithTwoDecimals(ones(user.usdBalance))}
                selected={exchange.token === TOKEN.LINK}
              />

              <BalanceRow
                asset="Harmony hBTC"
                value={formatWithTwoDecimals(user.btcBalance)}
                valueUSD={formatWithTwoDecimals(ones(user.btcBalance))}
                selected={exchange.token === TOKEN.LINK}
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
