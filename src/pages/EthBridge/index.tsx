import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { TOKEN } from 'stores/interfaces';
import cn from 'classnames';
import { Text, Title } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { useEffect } from 'react';

const LargeButton = (props: {
  title: string;
  onClick: () => void;
  description: string;
  isActive: boolean;
  reverse?: boolean;
}) => {
  return (
    <Box
      direction="column"
      align="center"
      justify="center"
      className={cn(
        styles.largeButtonContainer,
        props.isActive ? styles.active : '',
      )}
      onClick={props.onClick}
      gap="10px"
    >
      <Box direction={props.reverse ? 'row-reverse' : 'row'} align="center">
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/eth.svg" />
          <Text size="large" className={styles.title}>
            ETH
          </Text>
        </Box>
        <Box direction="row" margin={{ horizontal: 'medium' }} align="center">
          <img src="/right.svg" />
        </Box>
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/one.svg" />
          <Text size="large" className={styles.title}>
            ONE
          </Text>
        </Box>
      </Box>
      <Text size="xsmall" color="#748695" className={styles.description}>
        {props.description}
      </Text>
    </Box>
  );
};

export const EthBridge = observer((props: any) => {
  const { user, exchange, routing } = useStores();

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

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          fill={true}
          justify="between"
          align="start"
        >
          <Box
            direction="column"
            align="center"
            justify="center"
            className={styles.base}
          >
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
                <Box className={styles.actionItem}>
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
