/* eslint-disable import/no-extraneous-dependencies */
import { UserConfigFn } from 'vite'
import { readFile } from 'fs-extra'
import pluginSolid from 'vite-plugin-solid'
import pluginTSConfigPaths from 'vite-tsconfig-paths'
import pluginCompression from 'vite-plugin-compression'
import pluginWindiCSS from 'vite-plugin-windicss'
import pluginFonts from 'vite-plugin-fonts'

import { Configuration } from './internals/common/configuration'

export default (async ({ mode }) => {
  const config = new Configuration({ pathRoot: __dirname })
  const { paths } = config

  const [SSLCert, SSLCertKey] = await Promise.all([
    readFile(paths.file.rootInternalsCertificatesCert),
    readFile(paths.file.rootInternalsCertificatesKey),
  ])

  return {
    plugins: [
      pluginWindiCSS(),
      pluginSolid({ dev: mode !== 'production', ssr: true }),
      pluginTSConfigPaths(),
      pluginCompression({
        algorithm: 'brotliCompress',
      }),
      pluginFonts({
        google: {
          families: [
            {
              name: 'Merriweather',
            },
          ],
        },
      }),
    ],

    build: {
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      target: 'esnext',
      polyfillDynamicImport: false,
    },

    server: {
      host: Configuration.defaults.development.host,
      port: Configuration.defaults.development.port,
      strictPort: true,

      https: {
        cert: SSLCert,
        key: SSLCertKey,
      },

      open: true,
      force: true,
    },

    ssr: {
      noExternal: ['@rturnq/solid-router'],
    },
  }
}) as UserConfigFn
