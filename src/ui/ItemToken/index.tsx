import * as React from 'react';
import { Box } from 'grommet';
import cn from 'classnames';
import { Text } from 'components/Base/components/Text';
import * as styles from './styles.styl';
import { TOKEN } from 'stores/interfaces';

const icons: Record<TOKEN, string> = {
  [TOKEN.BUSD]: '/hUSD_Logo.png',
  [TOKEN.LINK]: '/hBTC_Logo.png',
};

export const ItemToken = ({ selected, onClick, tokenType, disabled }) => {
  const icon = icons[tokenType];

  return (
    <Box direction="row">
      <Box
        className={cn(styles.itemTokenLarge, selected ? styles.selected : '')}
        onClick={() => !disabled && onClick(tokenType)}
      >
        <img className={styles.imgToken} src={icon} />
        <Text>{tokenType}</Text>
      </Box>
    </Box>
  );
};
