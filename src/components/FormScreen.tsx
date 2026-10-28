import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { maxContentWidth, spacing, type, useColors } from '../theme';

type Props = {
  title: string;
  /** A message for the whole form, such as "couldn't reach the server". */
  formError?: string;
  /** The fields. */
  children: ReactNode;
  /** Buttons below the fields and the form error. */
  actions: ReactNode;
};

/** A scrolling form that stays above the keyboard. Used by signup and login. */
export function FormScreen({ title, formError, children, actions }: Props) {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={[type.title, { color: colors.text }]}>
            {title}
          </Text>
          {children}
          {formError ? (
            <Text accessibilityLiveRegion="polite" style={[type.label, { color: colors.danger }]}>
              {formError}
            </Text>
          ) : null}
          <View style={styles.actions}>{actions}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  form: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
