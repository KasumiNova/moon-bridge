export type ConsoleTheme = "dark" | "light";

export const primarySeed = "#7AA7A2";

type ThemeTokens = Record<string, string>;

export const themeTokens: Record<ConsoleTheme, ThemeTokens> = {
  dark: {
    "--mb-color-primary": primarySeed,
    "--mb-color-on-primary": "#08201d",
    "--mb-color-primary-container": "#274e4a",
    "--mb-color-on-primary-container": "#d4f3ee",
    "--mb-color-secondary": "#bbc8c5",
    "--mb-color-surface": "#101414",
    "--mb-color-surface-container": "#1b2020",
    "--mb-color-surface-container-high": "#252b2b",
    "--mb-color-on-surface": "#e0e3e1",
    "--mb-color-on-surface-variant": "#bec9c6",
    "--mb-color-outline": "#899390",
    "--mb-color-shadow": "#000000",
    "--mb-color-error": "#ffb4ab",
    "--mb-motion-standard": "180ms cubic-bezier(0.2, 0, 0, 1)"
  },
  light: {
    "--mb-color-primary": "#466965",
    "--mb-color-on-primary": "#ffffff",
    "--mb-color-primary-container": "#c9f0ea",
    "--mb-color-on-primary-container": "#00201d",
    "--mb-color-secondary": "#52615e",
    "--mb-color-surface": "#f7fbf8",
    "--mb-color-surface-container": "#e9efec",
    "--mb-color-surface-container-high": "#dde5e2",
    "--mb-color-on-surface": "#191c1b",
    "--mb-color-on-surface-variant": "#424947",
    "--mb-color-outline": "#727c79",
    "--mb-color-shadow": "#000000",
    "--mb-color-error": "#ba1a1a",
    "--mb-motion-standard": "180ms cubic-bezier(0.2, 0, 0, 1)"
  }
};

export function applyThemeTokens(theme: ConsoleTheme, root: HTMLElement): void {
  Object.entries(themeTokens[theme]).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
