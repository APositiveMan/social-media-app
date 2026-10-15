import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { story } from '../../content/story';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { spacing, type, useColors } from '../theme';

export default function WelcomeScreen() {
  const colors = useColors();

  return (
    <Screen centered>
      <View style={styles.text}>
        <Text accessibilityRole="header" style={[type.title, { color: colors.text }]}>
          {story.title}
        </Text>
        <Text style={[type.body, { color: colors.muted }]}>{story.welcome.intro}</Text>
      </View>
      <Button label={story.welcome.startLabel} onPress={() => router.push('/story')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { gap: spacing.lg, marginBottom: spacing.xxl },
});
