// eslint-disable-next-line import/no-extraneous-dependencies
import * as execa from 'execa'
import { join } from 'path'

import { cmd as cmdAddhost } from '../cmd/add-host'

export class AddHosts {
  static async execute<
    T1 extends {
      readonly hostToAdd: string
    }
  >({ hostToAdd }: T1) {
    if (process.getuid() === 0) {
      await cmdAddhost(hostToAdd)
      return
    }

    await execa(
      'sudo',
      ['-E', 'ts-node', join(__dirname, '../cmd/add-host.ts'), `--host-to-add=${hostToAdd}`],
      {
        shell: true,
      }
      // eslint-disable-next-line no-console
    ).then(({ stdout }) => console.log(stdout))
  }
}
