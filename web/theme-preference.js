export function resolveInitialTheme({ savedTheme, systemPrefersDark }) {
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return systemPrefersDark ? 'dark' : 'light'
}
