import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { maxContentWidth, spacing, useColors } from '../theme';

type Props = {
  children: ReactNode;
  /** Vertically center the content (used by the welcome and closing screens). */
  centered?: boolean;
};

/** Full-screen, safe-area-aware container with a centered, width-capped column. */
export function Screen({ children, centered = false }: Props) {
  const colors = useColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.column, centered && styles.centered]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  centered: { justifyContent: 'center' },
});
