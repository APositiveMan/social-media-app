import { ScrollView, StyleSheet, Text } from 'react-native';

import { type Chapter, toParagraphs } from '../../content/story';
import { maxContentWidth, spacing, type, useColors } from '../theme';

type Props = {
  chapter: Chapter;
  /** Page width; each chapter fills exactly one page of the pager. */
  width: number;
};

/** One chapter page. Long chapters scroll vertically within the page. */
export function ChapterView({ chapter, width }: Props) {
  const colors = useColors();

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {chapter.title}
      </Text>
      {toParagraphs(chapter.body).map((paragraph, i) => (
        <Text key={i} style={[styles.paragraph, { color: colors.text }]}>
          {paragraph}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  title: type.heading,
  paragraph: type.body,
});
