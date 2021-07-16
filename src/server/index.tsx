import { AsyncConstructor } from 'async-constructor'
import { extname, join } from 'path'
import { readFile } from 'fs/promises'
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { fastify } from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyMiddie from 'middie'
import { Stats } from 'fs'
import { ServerResponse } from 'http'
import { readJson } from 'fs-extra'

import type { IEntryModule, IPropsRoot } from './entry'

import { ExitHook } from '$src/modules/exit-hook'
import { Configuration } from '$root/internals/common/configuration'

class Server extends AsyncConstructor {
  static getters = {
    async HTTPSSLConfig(config: Configuration) {
      if (Configuration.defaults.isProd) {
        return undefined
      }

      const [cert, key] = await Promise.all([
        readFile(config.paths.file.rootInternalsCertificatesCert),
        readFile(config.paths.file.rootInternalsCertificatesKey),
      ])

      return {
        http2: !Configuration.defaults.isProd,

        https: {
          cert,
          key,
        },
      }
    },

    async manifestsAsset<
      T1 extends {
        readonly config: Configuration
      }
    >({ config }: T1) {
      const fileContents = (await readJson(
        join(config.paths.dir.rootDistSrcClient, 'ssr-manifest.json')
      )) as {
        [k: string]: Array<string>
      }

      const duplicateCheck = new Set<string>()

      return Object.values(fileContents).reduce(
        (acc, x) => {
          x.forEach((href) => {
            if (!href.endsWith('.js')) {
              return
            }

            if (!duplicateCheck.has(href)) {
              acc.push({ href })
            }

            duplicateCheck.add(href)
          })

          return acc
        },
        [] as Array<{
          readonly href: string
        }>
      )
    },

    async baseHTML<
      T1 extends {
        readonly config: Configuration
      }
    >({ config }: T1) {
      const baseHTML = parseHTML(
        await readFile(
          join(
            Configuration.defaults.isProd
              ? config.paths.dir.rootDistSrcClient
              : config.paths.dir.root,
            'index.html'
          ),
          'utf-8'
        )
      )

      return baseHTML.querySelector('head').childNodes.reduce(
        (acc, x) => {
          if (x instanceof HTMLElement) {
            const added = {
              nameTag: x.rawTagName,
            } as {
              atrributes?: Record<string, string>
              content?: string
              readonly nameTag: string
            }

            if (Object.keys(x.attributes).length) {
              added.atrributes = x.attributes
            }

            if (x.childNodes.length) {
              const text = x.childNodes[0].rawText

              if (text?.length) {
                added.content = text
              }
            }

            acc.push(added)
          }

          return acc
        },
        [] as Array<{
          readonly atrributes?: Record<string, string>
          readonly content?: string
          readonly nameTag: string
        }>
      )
    },
  }

  // http server
  #implementation: ReturnType<typeof fastify>

  #clientHTML: HTMLElement

  #baseHTML: {
    readonly contentHead: Array<{
      readonly atrributes?: Record<string, string>
      readonly content?: string
      readonly nameTag: string
    }>
    readonly manifestAssets: Array<{
      readonly href: string
    }>
  }

  #config: Configuration

  constructor(pathRoot = process.cwd()) {
    // eslint-disable-next-line prefer-arrow-callback
    super(async function construct(this: Server) {
      this.#config = new Configuration({ pathRoot })

      const [SSL, manifestAssets, contentHead] = await Promise.all([
        Server.getters.HTTPSSLConfig(this.#config),
        Server.getters.manifestsAsset({ config: this.#config }),
        Server.getters.baseHTML({ config: this.#config }),
      ])

      this.#baseHTML = {
        contentHead,
        manifestAssets,
      }

      const optionsFastify = {
        caseSensitive: true,
        ignoreTrailingSlash: true,
        disableRequestLogging: Configuration.defaults.isProd,
        ...SSL,
      }

      this.#implementation = fastify(optionsFastify)
      await this.#implementation.register(fastifyMiddie)

      ExitHook.add({
        ID: Server.name,

        callback: async () => {
          await this.#implementation.close()
          // eslint-disable-next-line no-console
          console.info('server closed')
        },
      })

      this.#implementation.register(fastifyStatic, {
        preCompressed: true,
        prefix: '/assets/',
        root: join(this.#config.paths.dir.rootDistSrcClient, 'assets'),

        // res The response object.
        // path The path of the file that is being sent.
        // stat The stat object of the file that is being sent.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setHeaders(response: ServerResponse, pathFile: string, _stat: Stats) {
          const fileExt = extname(pathFile)

          switch (fileExt) {
            case '.tsx':
              response.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
              break

            default:
          }
        },
      })

      await (Configuration.defaults.isProd ? this.#setupProduction : this.#setupDevelopment)()

      this.#implementation.listen(Configuration.defaults.production.port, () => {
        // prod supposed to run behind a load balancer
        const URIListen = Configuration.defaults.isProd
          ? `http://localhost:${Configuration.defaults.production.port}`
          : `https://${Configuration.defaults.production.host}:${Configuration.defaults.production.port}`

        // eslint-disable-next-line no-console
        console.info(`Server started: ${URIListen}`)
      })
    })
  }

  #setupProduction = () => {
    // recursive loop when generating types if import() is used in dist folder
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const entry: IEntryModule = require(join(this.#config.paths.dir.rootDistSrcServer, 'entry.js'))

    this.#implementation.get('*', async (request, reply) => {
      try {
        const tags: IPropsRoot['tags'] = []
        const contentMain = await entry.Entry.renderStringHTMLPre({
          tags,
          URL: request.url,
        })

        entry.Entry.renderStream({
          ...this.#baseHTML,
          contentMain,
          writable: reply.raw,
          tags,
        })
      } catch (err) {
        entry.Entry.renderStreamError({
          code: 500,
          message: err.message,
          writable: reply.raw,
        })
      }
    })
  }

  #setupDevelopment = async () => {
    const vite = await // prettier-ignore
    (
      // eslint-disable-next-line import/no-extraneous-dependencies
      await import('vite')
    ).createServer({
      root: this.#config.paths.dir.root,
      logLevel: 'info',

      server: {
        fs: {
          strict: false,
        },

        middlewareMode: 'ssr',
      },
    })

    this.#implementation.use(vite.middlewares)

    this.#implementation.get('*', async (request, reply) => {
      const entry: IEntryModule = (await vite.ssrLoadModule('/src/server/entry.tsx')) as any
      // tags will be mutated and added to head later
      const tags: IPropsRoot['tags'] = []
      const contentMain = await entry.Entry.renderStringHTMLPre({
        tags,
        URL: request.url,
      })

      try {
        const baseHTML = await entry.Entry.renderString({
          ...this.#baseHTML,
          contentMain,
          tags,
        })

        const html = await vite.transformIndexHtml(request.url, baseHTML)

        reply.code(200).header('Content-Type', 'text/html; charset=UTF-8').send(html)
      } catch (err) {
        vite.ssrFixStacktrace(err)

        entry.Entry.renderStreamError({
          code: 500,
          message: err.stack,
          writable: reply.raw,
        })
      }
    })
  }
}

const main = async () => {
  await new Server()
}

main()
