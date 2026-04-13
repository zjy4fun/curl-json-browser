function resolveInitialTheme({ savedTheme, systemPrefersDark }) {
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return systemPrefersDark ? 'dark' : 'light'
}

if (typeof window !== 'undefined') {
  window.JsonOpenThemePreference = { resolveInitialTheme }
}

export { resolveInitialTheme }
