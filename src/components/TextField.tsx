import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { spacing, type, useColors } from '../theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
};

/** A labeled text input with an optional error message below it. */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, ...input },
  ref,
) {
  const colors = useColors();

  return (
    <View style={styles.field}>
      <Text style={[type.label, styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          { color: colors.text, borderColor: error ? colors.danger : colors.track },
        ]}
        {...input}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[type.label, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { fontWeight: '600' },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: type.body.fontSize,
  },
});
