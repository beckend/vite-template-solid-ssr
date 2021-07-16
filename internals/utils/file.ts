// eslint-disable-next-line import/no-extraneous-dependencies
import * as fs from 'fs-extra'

export class File {
  static defaults = {
    encoding: 'utf8',
  }

  static read = {
    toString: <
      T1 extends {
        readonly pathFile: string
      }
    >({
      pathFile,
    }: T1) => fs.readFile(pathFile).then((x) => x.toString(File.defaults.encoding as 'utf8')),
  }
}
