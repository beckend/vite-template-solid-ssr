/** @type {import("windicss/helpers").defineConfig } */
const { defineConfig } = require('windicss/helpers')
/** @type {import("windicss/plugin/forms") } */
const pluginForms = require('windicss/plugin/forms')

module.exports = defineConfig({
  attributify: true,
  darkMode: 'media',
  // to silence tailwind, windi is using extract property
  purge: false,
  extract: {
    exclude: ['node_modules', '.git', 'dist'],
    include: ['./src/**/*.{ts,tsx,html}'],
  },
  plugins: [pluginForms],
})
