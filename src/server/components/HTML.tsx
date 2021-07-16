import { Component } from 'solid-js'
import type { JSX } from 'solid-js/types'
import { HydrationScript } from 'solid-js/web'

import { Root, IProps as IPropsRoot } from '$srcClient/components/Root'
import { TUnpacked } from '$src/types/model'

export type { IPropsRoot }

export interface IPropsHTML {
  readonly contentHead: Array<{
    readonly atrributes?: Record<string, string | unknown>
    readonly content?: string
    readonly nameTag: string
  }>
  readonly manifestAssets: Array<{
    readonly href: string
  }>
  readonly contentMain: string
  readonly tags: IPropsRoot['tags']
}

const local = {
  mapContentHead: (x: TUnpacked<IPropsHTML['contentHead']>): JSX.Element => {
    switch (x.nameTag) {
      case 'title':
        return <title>{x.content}</title>
      case 'meta':
        return <meta {...x.atrributes} />
      case 'link':
        return <link {...x.atrributes} />
      case 'script':
        return <script {...x.atrributes} />

      default:
        return undefined
    }
  },

  mapTags: (x: TUnpacked<IPropsRoot['tags']>) =>
    local.mapContentHead({ nameTag: x.tag, atrributes: x.props }),

  mapManifestAssets: (x: TUnpacked<IPropsHTML['manifestAssets']>) => (
    <link rel="modulepreload" href={x.href} />
  ),
}

export const HTML: Component<IPropsHTML> = (p) => (
  <>
    {'<!DOCTYPE html>'}

    <html lang="en">
      <head>
        {p.manifestAssets.map(local.mapManifestAssets)}
        {p.contentHead.map(local.mapContentHead)}
        {p.tags.map(local.mapTags)}
        <HydrationScript />
      </head>

      <body innerHTML={p.contentMain} />
    </html>
  </>
)

export interface IPropsHTMLPre {
  readonly tags: IPropsRoot['tags']
  readonly URL: IPropsRoot['URL']
}

export const HTMLPre: Component<IPropsHTMLPre> = ({ tags, URL }) => <Root tags={tags} URL={URL} />
