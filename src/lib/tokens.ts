/**
 * Design tokens for contexts that can't read CSS variables (OG images,
 * <meta name="theme-color">, generated icons). Keep in sync with the
 * @theme block in src/app/globals.css.
 */
export const tokens = {
  ink: "#0e0e0d",
  bone: "#f3f0ea",
  grey400: "#a39c91",
  grey800: "#24221f",
  accent: "#9a4a2e",
  accentLight: "#c9774f",
} as const;
