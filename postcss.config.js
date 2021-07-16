/* eslint-disable import/no-extraneous-dependencies */
const pluginPresetEnv = require('postcss-preset-env')
const pluginCSSNano = require('cssnano')

module.exports = {
  plugins: [
    // contains autoprefixer
    // https://github.com/csstools/postcss-preset-env
    pluginPresetEnv({
      browsers: 'last 2 versions',
      // https://preset-env.cssdb.org/features#stage-1
      stage: 1,
    }),

    pluginCSSNano({
      preset: ['default', { discardComments: { removeAll: true } }],
    }),
  ],
}
