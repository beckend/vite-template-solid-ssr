import { basename, join } from 'path'

export interface IConfigurationOptions {
  pathRoot: string
}

const defaults = {
  commonEnv: {
    host: process.env.SERVER_HOST || 'local.internal',
    port: parseInt(process.env.SERVER_PORT, 10) || 3000,
    IPv4: '0.0.0.0',
  },
}

export class Configuration {
  static defaults = {
    development: {
      ...defaults.commonEnv,
      uri: `https://${defaults.commonEnv.host}:${defaults.commonEnv.port}`,
    },

    production: {
      ...defaults.commonEnv,
      uri: `http://${defaults.commonEnv.host}:${defaults.commonEnv.port}`,
    },

    isProd: process.env.NODE_ENV === 'production',
  }

  static getters = {
    paths<TOptions extends {} & IConfigurationOptions>({ pathRoot }: TOptions) {
      const pathDirRoot = pathRoot
      const pathDirRootSrc = join(pathRoot, 'src')
      const pathDirRootInternal = join(pathDirRoot, 'internals')
      const pathRootDist = join(pathRoot, 'dist')
      const pathRootInternalsCertificates = join(pathDirRootInternal, 'certificates')
      const names = Configuration.getters.names({ pathRoot })

      return {
        dir: {
          root: pathDirRoot,
          rootDist: pathRootDist,
          rootSrc: pathDirRootSrc,
          rootSrcClient: join(pathDirRootSrc, 'client'),
          rootDistSrcClient: join(pathRootDist, 'src/client'),
          rootDistSrcServer: join(pathRootDist, 'src/server'),
          rootInternals: pathDirRootInternal,
          rootInternalsCertificates: pathRootInternalsCertificates,
        },

        file: {
          tailwindCSSConfig: join(pathDirRoot, 'tailwindcss.config.js'),

          rootInternalsCertificatesCert: join(
            pathRootInternalsCertificates,
            names.files.rootInternalsCertificatesCert
          ),

          rootInternalsCertificatesKey: join(
            pathRootInternalsCertificates,
            names.files.rootInternalsCertificatesKey
          ),
        },
      }
    },

    names<TOptions extends IConfigurationOptions>({ pathRoot }: TOptions) {
      return {
        dir: {
          thisProject: basename(pathRoot),
        },

        files: {
          rootInternalsCertificatesCert: 'local.pem',
          rootInternalsCertificatesKey: 'local-key.pem',
        },
      }
    },
  }

  paths: ReturnType<typeof Configuration['getters']['paths']>

  names: ReturnType<typeof Configuration['getters']['names']>

  constructor({ pathRoot }: IConfigurationOptions) {
    this.paths = Configuration.getters.paths({ pathRoot })
    this.names = Configuration.getters.names({ pathRoot })
  }
}
