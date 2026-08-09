export function resolveInitialTheme(storage, matchMedia) {
  const storedTheme = storage?.getItem?.('rentalls-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  if (typeof matchMedia === 'function') {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'dark';
}

export function applyInitialTheme(storage, matchMedia) {
  const theme = resolveInitialTheme(storage, matchMedia);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }

  return theme;
}
