import { vars } from 'nativewind';

export type Scheme = 'light' | 'dark';

/** Space-separated RGB triples — consumed by Tailwind as rgb(var(--x) / alpha). */
const tokens = {
  light: {
    bg: '250 250 250',
    surface: '255 255 255',
    elevated: '242 242 244',
    line: '230 230 234',
    ink: '10 10 11',
    muted: '107 107 116',
    subtle: '160 160 170',
    accent: '91 79 245',
    'on-accent': '255 255 255',
    danger: '225 45 57',
  },
  dark: {
    bg: '9 9 11',
    surface: '18 18 21',
    elevated: '26 26 31',
    line: '38 38 44',
    ink: '244 244 245',
    muted: '139 139 149',
    subtle: '92 92 102',
    accent: '143 135 255',
    'on-accent': '11 11 15',
    danger: '255 99 99',
  },
} as const;

type TokenName = keyof (typeof tokens)['light'];
type Palette = Record<TokenName, string>;

const toHex = (triple: string) =>
  '#' +
  triple
    .split(' ')
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const toPalette = (scheme: Scheme): Palette =>
  Object.fromEntries(Object.entries(tokens[scheme]).map(([k, v]) => [k, toHex(v)])) as Palette;

/** Hex colors for places Tailwind can't reach (icons, Skia, status bar, native props). */
export const palette: Record<Scheme, Palette> = {
  light: toPalette('light'),
  dark: toPalette('dark'),
};

/** CSS-variable style objects applied at the app root. */
export const themeVars: Record<Scheme, ReturnType<typeof vars>> = {
  light: vars(Object.fromEntries(Object.entries(tokens.light).map(([k, v]) => [`--${k}`, v]))),
  dark: vars(Object.fromEntries(Object.entries(tokens.dark).map(([k, v]) => [`--${k}`, v]))),
};

/** The liquid recorder is the one place gradients are allowed. */
export const liquid = {
  core: ['#E4E0FF', '#9D94FF', '#5B4FF5', '#22198F'],
  sheen: ['#7DE3FF', '#9D94FF', '#FF9DE6', '#7DE3FF'],
  glow: '#7A6DFF',
} as const;
