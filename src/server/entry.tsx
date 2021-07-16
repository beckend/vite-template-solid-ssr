import { pipeToNodeWritable, renderToStringAsync } from 'solid-js/web'

import { HTML, IPropsHTML, HTMLPre, IPropsHTMLPre, IPropsRoot } from '$src/server/components/HTML'
import { TArgumentTypes } from '$src/types/model'
import { ErrorComp, IProps as IPropsErrorComp } from '$srcClient/components/Error'

export type { IPropsRoot }

export class Entry {
  static renderString = (x: IPropsHTML) => renderToStringAsync(() => <HTML {...x} />)

  static renderStringHTMLPre = (x: IPropsHTMLPre) => renderToStringAsync(() => <HTMLPre {...x} />)

  static renderStream = <
    T1 extends {
      readonly writable: TArgumentTypes<typeof pipeToNodeWritable>[1]
    } & IPropsHTML
  >({
    contentHead,
    contentMain,
    manifestAssets,
    tags,
    writable,
  }: T1) =>
    pipeToNodeWritable(
      () => (
        <HTML
          contentHead={contentHead}
          contentMain={contentMain}
          manifestAssets={manifestAssets}
          tags={tags}
        />
      ),
      writable
    )

  static renderStreamError = <
    T1 extends {
      readonly writable: TArgumentTypes<typeof pipeToNodeWritable>[1]
    } & IPropsErrorComp
  >({
    code,
    message,
    writable,
  }: T1) => pipeToNodeWritable(() => <ErrorComp code={code} message={message} />, writable)
}

export interface IEntryModule {
  readonly Entry: typeof Entry
}
