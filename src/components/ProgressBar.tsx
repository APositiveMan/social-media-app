import { StyleSheet, Text, View } from 'react-native';

import { spacing, type, useColors } from '../theme';

type Props = {
  /** Zero-based index of the current chapter. */
  current: number;
  total: number;
};

/** "Chapter 3 of 7" plus one segment per chapter, so the end is always visible. */
export function ProgressBar({ current, total }: Props) {
  const colors = useColors();
  const label = `Chapter ${current + 1} of ${total}`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
      style={styles.container}
    >
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <View style={styles.segments}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i <= current ? colors.accent : colors.track }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  label: type.label,
  segments: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
