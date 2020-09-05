import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { TOKEN } from 'stores/interfaces';
import { Button, Text, Title } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { useEffect, useState } from 'react';
import { MintTokens } from '../MintTokens';

enum ACTION_MODE {
  MINT = 'MINT',
  NONE = 'NONE',
  BURN = 'BURN',
  TRANSFER = 'TRANSFER',
  UNISWAP = 'UNISWAP',
}

export const EthBridge = observer((props: any) => {
  const { user, exchange, routing } = useStores();

  const [mode, setMode] = useState<ACTION_MODE>(ACTION_MODE.NONE);

  useEffect(() => {
    if (props.match.params.token) {
      if ([TOKEN.LINK, TOKEN.BUSD].includes(props.match.params.token)) {
        exchange.setToken(props.match.params.token);
      } else {
        routing.push(TOKEN.BUSD);
      }
    }

    if (props.match.params.operationId) {
      exchange.setOperationId(props.match.params.operationId);
      exchange.sendOperation(props.match.params.operationId);
    }
  }, []);

  const actionModeRender = () => {
    switch (mode) {
      case ACTION_MODE.MINT:
        return <MintTokens onCancel={() => setMode(ACTION_MODE.NONE)} />;
      default:
        return <MintTokens onCancel={() => setMode(ACTION_MODE.NONE)} />;
    }
  };

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" fill={true} justify="between" align="start">
          <Box
            direction="column"
            align="center"
            justify="center"
            className={styles.base}
          >
            {mode === ACTION_MODE.NONE ? (
              <Box
                direction="column"
                align="center"
                justify="center"
                margin={{ top: 'large' }}
                fill={true}
              >
                <Title size="medium" color="BlackTxt" bold>
                  What would you like to do?
                </Title>

                <Box
                  direction="row"
                  style={{ maxWidth: '600px' }}
                  wrap={true}
                  margin={{ top: 'medium' }}
                  align="center"
                  justify="center"
                >
                  <Box
                    className={styles.actionItem}
                    onClick={() => setMode(ACTION_MODE.MINT)}
                  >
                    <img src="/mint.svg" />
                    <Title>MINT</Title>
                    <Text>Mint Synths by 1HRV</Text>
                  </Box>

                  <Box className={styles.actionItem}>
                    <img src="/burn.svg" />
                    <Title>BURN</Title>
                    <Text>Burn Synths to unlock 1HRV</Text>
                  </Box>

                  <Box className={styles.actionItem}>
                    <img src="/transfer.svg" />
                    <Title>TRANSFER</Title>
                    <Text>Transfer 1HRV or Synths</Text>
                  </Box>

                  <Box className={styles.actionItem}>
                    <img src="/uniswap.webp" />
                    <Title>UNISWAP</Title>
                    <Text>Get 1HRV from Uniswap</Text>
                  </Box>
                </Box>
              </Box>
            ) : actionModeRender()}

            {/*<Box*/}
            {/*  direction="row"*/}
            {/*  justify="between"*/}
            {/*  width="560px"*/}
            {/*  margin={{ vertical: 'large' }}*/}
            {/*>*/}
            {/*  <LargeButton*/}
            {/*    title="ETH -> ONE"*/}
            {/*    description="(Metamask)"*/}
            {/*    onClick={() => exchange.setMode(EXCHANGE_MODE.ETH_TO_ONE)}*/}
            {/*    isActive={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}*/}
            {/*  />*/}
            {/*  <LargeButton*/}
            {/*    title="ONE -> ETH"*/}
            {/*    reverse={true}*/}
            {/*    description="(ONE Wallet)"*/}
            {/*    onClick={() => exchange.setMode(EXCHANGE_MODE.ONE_TO_ETH)}*/}
            {/*    isActive={exchange.mode === EXCHANGE_MODE.ONE_TO_ETH}*/}
            {/*  />*/}
            {/*</Box>*/}

            {/*<Exchange />*/}
          </Box>

          <WalletBalances />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
