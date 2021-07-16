import { once } from './once'

export interface IOptionsHook {
  readonly code: number
  readonly name: string
}

export interface IHook {
  readonly ID: string
  readonly callback: (x: IOptionsHook) => void | PromiseLike<void>
}

export class ExitHook {
  static defaults = {
    signals: [
      {
        code: 0,
        name: 'SIGHUP',
      },
      {
        code: 0,
        name: 'SIGINT',
      },
      {
        code: 0,
        name: 'SIGTERM',
      },
      {
        code: 0,
        name: 'SIGBREAK',
      },

      {
        code: 0,
        // nodemon
        name: 'SIGUSR2',
      },

      {
        code: 0,
        name: 'exit',
      },
    ],
  }

  static hooks = new Set<IHook>()

  static async onExit<
    T1 extends {
      readonly code: number
      readonly name: string
    }
  >({ code, name }: T1) {
    let exitCode = 0

    // eslint-disable-next-line no-console
    console.info(`Exit by event: ${name}, code: ${code}`)

    const promises = Array.from(ExitHook.hooks).reduce((acc, { ID, callback }) => {
      acc.push(() => {
        if (code > exitCode) {
          exitCode = code
        }
        // eslint-disable-next-line no-console
        console.info(`Executing exit hook: ${ID}`)
        // eslint-disable-next-line no-await-in-loop
        return callback({ code, name })
      })

      return acc
    }, [] as Array<() => void | PromiseLike<void>>)

    await Promise.all(promises)

    process.exit(exitCode)
  }

  static registerExit() {
    ExitHook.defaults.signals.forEach(({ code, name }) => {
      process.once(name, () =>
        ExitHook.onces.onExit({
          code,
          name,
        })
      )
    })

    // PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
    // explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
    // event cannot support async handlers, since the event loop is never called after it.
    process.on('message', (message) => {
      if (message === 'shutdown') {
        ExitHook.onces.onExit({
          code: 0,
          name: 'child shutdown',
        })
      }
    })
  }

  static add(callback: IHook) {
    ExitHook.onces.registerExit()
    ExitHook.hooks.add(callback)

    return () => {
      ExitHook.hooks.delete(callback)
    }
  }

  static onces = {
    onExit: once(ExitHook.onExit),
    registerExit: once(ExitHook.registerExit),
  }
}
