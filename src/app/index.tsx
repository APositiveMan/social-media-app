import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { story } from '../../content/story';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { useAuth } from '../lib/auth';
import { spacing, type, useColors } from '../theme';

export default function WelcomeScreen() {
  const colors = useColors();
  const auth = useAuth();

  return (
    <Screen centered>
      <View style={styles.text}>
        <Text accessibilityRole="header" style={[type.title, { color: colors.text }]}>
          {story.title}
        </Text>
        <Text style={[type.body, { color: colors.muted }]}>{story.welcome.intro}</Text>
      </View>
      <View style={styles.actions}>
        <Button label={story.welcome.startLabel} onPress={() => router.push('/story')} />
        {auth.status === 'signedOut' ? (
          <>
            <Button label="Log in" variant="quiet" onPress={() => router.push('/login')} />
            <Button
              label="Create an account"
              variant="quiet"
              onPress={() => router.push('/signup')}
            />
          </>
        ) : null}
        {auth.status === 'signedIn' ? (
          <>
            <Text style={[type.label, styles.signedIn, { color: colors.muted }]}>
              Signed in as {auth.account.username}
            </Text>
            <Button label="Log out" variant="quiet" onPress={auth.signOut} />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { gap: spacing.lg, marginBottom: spacing.xxl },
  actions: { gap: spacing.sm },
  signedIn: { textAlign: 'center', marginTop: spacing.md },
});
