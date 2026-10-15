import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { story, toParagraphs } from '../content/story';
import ClosingScreen from '../src/app/closing';
import WelcomeScreen from '../src/app/index';
import StoryScreen from '../src/app/story';

const EXPECTED_CHAPTER_COUNT = 7;

const routes = {
  index: WelcomeScreen,
  story: StoryScreen,
  closing: ClosingScreen,
};

describe('story content', () => {
  it(`has ${EXPECTED_CHAPTER_COUNT} chapters, each with a title and text`, () => {
    expect(story.chapters).toHaveLength(EXPECTED_CHAPTER_COUNT);
    for (const chapter of story.chapters) {
      expect(chapter.title.trim()).not.toBe('');
      expect(toParagraphs(chapter.body).length).toBeGreaterThan(0);
    }
  });

  it('splits chapter bodies into paragraphs on blank lines', () => {
    expect(toParagraphs('One\nline.\n\n  Two.  \n\n\n')).toEqual(['One line.', 'Two.']);
  });
});

describe('screens', () => {
  it('renders every chapter title and paragraph on the story screen', async () => {
    await renderRouter(routes, { initialUrl: '/story' });

    for (const chapter of story.chapters) {
      expect(screen.getByText(chapter.title)).toBeTruthy();
      for (const paragraph of toParagraphs(chapter.body)) {
        expect(screen.getByText(paragraph)).toBeTruthy();
      }
    }
    expect(screen.getByText(`Chapter 1 of ${EXPECTED_CHAPTER_COUNT}`)).toBeTruthy();
  });

  it('goes from welcome through all chapters to the closing takeaway', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen.getByText(story.title)).toBeTruthy();

    await fireEvent.press(screen.getByText(story.welcome.startLabel));
    expect(screen.getByText(`Chapter 1 of ${EXPECTED_CHAPTER_COUNT}`)).toBeTruthy();

    for (let i = 1; i < EXPECTED_CHAPTER_COUNT; i++) {
      await fireEvent.press(screen.getByText('Next'));
      expect(screen.getByText(`Chapter ${i + 1} of ${EXPECTED_CHAPTER_COUNT}`)).toBeTruthy();
    }

    await fireEvent.press(screen.getByText('Finish'));
    expect(screen.getByText(story.closing.takeaway)).toBeTruthy();
  });
});
