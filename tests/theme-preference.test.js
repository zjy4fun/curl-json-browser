import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveInitialTheme } from '../web/theme-preference.js'

test('uses saved theme when localStorage has a valid value', () => {
  assert.equal(resolveInitialTheme({ savedTheme: 'light', systemPrefersDark: true }), 'light')
  assert.equal(resolveInitialTheme({ savedTheme: 'dark', systemPrefersDark: false }), 'dark')
})

test('falls back to browser dark preference when no saved theme exists', () => {
  assert.equal(resolveInitialTheme({ savedTheme: null, systemPrefersDark: true }), 'dark')
})

test('falls back to browser light preference when no saved theme exists', () => {
  assert.equal(resolveInitialTheme({ savedTheme: null, systemPrefersDark: false }), 'light')
})

test('ignores invalid saved values and uses browser preference instead', () => {
  assert.equal(resolveInitialTheme({ savedTheme: 'system', systemPrefersDark: true }), 'dark')
  assert.equal(resolveInitialTheme({ savedTheme: 'auto', systemPrefersDark: false }), 'light')
})
