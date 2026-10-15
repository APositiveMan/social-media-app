import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { story } from '../../content/story';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { spacing, type, useColors } from '../theme';

export default function ClosingScreen() {
  const colors = useColors();

  return (
    <Screen centered>
      <Text style={[type.title, styles.takeaway, { color: colors.text }]}>
        {story.closing.takeaway}
      </Text>
      <Button
        label={story.closing.restartLabel}
        variant="quiet"
        onPress={() => router.dismissTo('/')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  takeaway: { marginBottom: spacing.xxl },
});
