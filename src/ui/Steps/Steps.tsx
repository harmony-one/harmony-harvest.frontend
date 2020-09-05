import * as React from 'react';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import cn from 'classnames';
import * as styles from './feeds.styl';

const StepRow = ({ active, label, completed, number }) => {
  return (
    <Text
      className={cn(
        styles.stepRow,
        active ? styles.active : '',
        completed ? styles.completed : '',
      )}
    >
      {number + 1 + '. ' + label}
    </Text>
  );
};

export const Steps = ({steps, currentStep}) => {
  return (
    <Box direction="column" className={styles.stepsContainer}>
      {steps.map((value, idx) => (
        <StepRow
          key={idx}
          label={value}
          active={currentStep === idx}
          completed={currentStep > idx}
          number={idx}
        />
      ))}
    </Box>
  );
};
