import { useColorScheme } from 'react-native';

const palettes = {
  light: {
    background: '#F7F4EE',
    text: '#2B2A28',
    muted: '#6B675F',
    accent: '#4F6F63',
    onAccent: '#FFFFFF',
    track: '#E2DDD2',
    danger: '#A3412F',
  },
  dark: {
    background: '#161615',
    text: '#E8E4DC',
    muted: '#9C978D',
    accent: '#8FB3A5',
    onAccent: '#161615',
    track: '#33322F',
    danger: '#E58C7A',
  },
};

export type Colors = (typeof palettes)['light'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const type = {
  title: { fontSize: 34, lineHeight: 42, fontWeight: '600' as const },
  heading: { fontSize: 26, lineHeight: 34, fontWeight: '600' as const },
  body: { fontSize: 20, lineHeight: 32 },
  label: { fontSize: 15, lineHeight: 20 },
};

/** Text column width cap, so lines stay readable on tablets and the web. */
export const maxContentWidth = 620;

/** Colors for the current system appearance (light or dark). */
export function useColors(): Colors {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}
