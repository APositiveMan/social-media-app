/**
 * All of the story's text lives here. Edit freely — no UI code needs to change.
 *
 * - Each chapter has a `title` and a `body`.
 * - In `body`, leave a blank line between paragraphs.
 * - Keep exactly 7 chapters (the test suite checks this). To change the count,
 *   update `EXPECTED_CHAPTER_COUNT` in __tests__/story.test.tsx too.
 */

export type Chapter = {
  title: string;
  body: string;
};

export type Story = {
  title: string;
  welcome: {
    intro: string;
    startLabel: string;
  };
  chapters: Chapter[];
  closing: {
    takeaway: string;
    restartLabel: string;
  };
};

export const story: Story = {
  title: "The Phone That Wouldn't Let Go",

  welcome: {
    intro:
      'A short story in seven chapters. Read it at your own pace — it has a beginning and an end.',
    startLabel: 'Begin',
  },

  chapters: [
    {
      title: 'Where I was',
      body: `I couldn't sleep properly. My brain felt foggy all the time. My attention span was gone, and the smallest things made me angry, including with the people I love. I struggled to do anything hard, and my work suffered. All I wanted was to scroll and watch videos.

It got so bad that I took my phone out for a one-minute bathroom break.`,
    },
    {
      title: 'The first deletion',
      body: `Instagram was my biggest trap. I was losing hours a day to Reels. Deleting it took courage, and more time than I expected to build up to.`,
    },
    {
      title: 'The whack-a-mole',
      body: `It didn't end there. I moved to YouTube Shorts and Facebook Reels. Different app, same endless feed. I had to delete those too.`,
    },
    {
      title: 'The moment I understood',
      body: `Then something strange happened. My hand kept reaching for my phone, and I'd start looking for apps I had already deleted. My brain had forgotten they were gone. That was the moment I understood how deep this went.`,
    },
    {
      title: 'The pressure to go back',
      body: `Then came the FOMO. Friends asked why I'd deleted Instagram. Some assumed I was going through a rough patch. I had to explain, again and again, that I was detoxing from social media. Saying it out loud made it real, and I felt my joy coming back.`,
    },
    {
      title: 'A phone that made it boring',
      body: `I bought a Bigme Hibreak Pro, an e-ink phone with a black-and-white screen and a very low refresh rate. I put my social media back on it, and it didn't work for me anymore. Without color and smooth motion, short videos stopped being fun. The pull was gone.`,
    },
    {
      title: 'Where I am now',
      body: `I went back to my iPhone 15 and never reinstalled social media. I realized I didn't need it.`,
    },
  ],

  closing: {
    takeaway:
      'The apps are only half of it. The feed is the trap, and you can break its pull.',
    restartLabel: 'Back to the start',
  },
};

/** Splits a chapter body into paragraphs on blank lines. */
export function toParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, ' '))
    .filter(Boolean);
}
