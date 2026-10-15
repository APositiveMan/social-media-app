import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { story } from '../../content/story';
import { Button } from '../components/Button';
import { ChapterView } from '../components/ChapterView';
import { ProgressBar } from '../components/ProgressBar';
import { maxContentWidth, spacing, useColors } from '../theme';

const { chapters } = story;

/** The seven chapters as swipeable pages, with progress and Back/Next controls. */
export default function StoryScreen() {
  const colors = useColors();
  const pager = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(windowWidth);
  const [current, setCurrent] = useState(0);

  const isLast = current === chapters.length - 1;

  function goTo(index: number) {
    pager.current?.scrollTo({ x: index * pageWidth, animated: true });
    setCurrent(index);
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (index !== current && index >= 0 && index < chapters.length) setCurrent(index);
  }

  function onLayout(e: LayoutChangeEvent) {
    const width = e.nativeEvent.layout.width;
    if (width !== pageWidth) {
      setPageWidth(width);
      // Keep the current chapter in view after a size change (e.g. web resize).
      pager.current?.scrollTo({ x: current * width, animated: false });
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.bar}>
        <ProgressBar current={current} total={chapters.length} />
      </View>

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={onLayout}
        style={styles.pager}
      >
        {chapters.map((chapter, i) => (
          <ChapterView key={i} chapter={chapter} width={pageWidth} />
        ))}
      </ScrollView>

      <View style={[styles.bar, styles.controls]}>
        <Button
          label="Back"
          variant="quiet"
          disabled={current === 0}
          onPress={() => goTo(current - 1)}
        />
        <Button
          label={isLast ? 'Finish' : 'Next'}
          onPress={() => (isLast ? router.push('/closing') : goTo(current + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bar: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  pager: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
