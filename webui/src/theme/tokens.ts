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
    "--mb-color-secondary-container": "#3f4947",
    "--mb-color-on-secondary-container": "#dbe5e2",
    "--mb-color-tertiary-container": "#3b4858",
    "--mb-color-on-tertiary-container": "#d8e4f8",
    "--mb-color-surface": "#101414",
    "--mb-color-surface-container": "#1b2020",
    "--mb-color-surface-container-high": "#252b2b",
    "--mb-color-on-surface": "#e0e3e1",
    "--mb-color-on-surface-variant": "#bec9c6",
    "--mb-color-outline": "#899390",
    "--mb-color-shadow": "#000000",
    "--mb-color-error": "#ffb4ab",
    "--mb-color-error-container": "#93000a",
    "--mb-color-on-error-container": "#ffdad6",
    "--mb-motion-standard": "180ms cubic-bezier(0.2, 0, 0, 1)"
  },
  light: {
    "--mb-color-primary": "#466965",
    "--mb-color-on-primary": "#ffffff",
    "--mb-color-primary-container": "#c9f0ea",
    "--mb-color-on-primary-container": "#00201d",
    "--mb-color-secondary": "#52615e",
    "--mb-color-secondary-container": "#d5e7e3",
    "--mb-color-on-secondary-container": "#0e1f1c",
    "--mb-color-tertiary-container": "#d8e4f8",
    "--mb-color-on-tertiary-container": "#101d2b",
    "--mb-color-surface": "#f7fbf8",
    "--mb-color-surface-container": "#e9efec",
    "--mb-color-surface-container-high": "#dde5e2",
    "--mb-color-on-surface": "#191c1b",
    "--mb-color-on-surface-variant": "#424947",
    "--mb-color-outline": "#727c79",
    "--mb-color-shadow": "#000000",
    "--mb-color-error": "#ba1a1a",
    "--mb-color-error-container": "#ffdad6",
    "--mb-color-on-error-container": "#410002",
    "--mb-motion-standard": "180ms cubic-bezier(0.2, 0, 0, 1)"
  }
};

export function applyThemeTokens(theme: ConsoleTheme, root: HTMLElement): void {
  Object.entries(themeTokens[theme]).forEach(([name, value]) => {
    root.style.setProperty(name, value);
    if (name.startsWith("--mb-color-")) {
      const mdSysName = name.replace("--mb-color-", "--md-sys-color-");
      root.style.setProperty(mdSysName, value);
    }
  });
}
