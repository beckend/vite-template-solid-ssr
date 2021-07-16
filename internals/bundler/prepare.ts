#!/usr/bin/env ts-node

import * as yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { AddHosts } from '../utils/add-hosts'
import { Configuration } from '../common/configuration'
import { SSL } from '../utils/ssl'

export const prepare = <
  T1 extends {
    readonly configuration: Configuration
    readonly hostToAdd: string
    readonly pathDirOutputCertificates: string
  }
>({
  configuration,
  hostToAdd,
  pathDirOutputCertificates,
}: T1) =>
  Promise.all([
    // eslint-disable-next-line no-console
    AddHosts.execute({ hostToAdd }).catch(console.error),
    SSL.createSSL({ configuration, hostToAdd, pathOutput: pathDirOutputCertificates }).then(
      ({ paths }) => {
        // eslint-disable-next-line no-console
        console.info('SSL certificates available =>')

        // eslint-disable-next-line no-console
        Object.entries(paths).forEach(([key, value]) => console.info(`${key}: ${value}`))
      }
    ),
  ])

const main = () => {
  const { dirRoot } = yargs(hideBin(process.argv)).parse() as any

  if (typeof dirRoot !== 'string') {
    throw new Error(`argument --dir_root is a required string`)
  }
  const config = new Configuration({ pathRoot: dirRoot })

  return prepare({
    configuration: config,
    hostToAdd: Configuration.defaults.development.host,
    pathDirOutputCertificates: config.paths.dir.rootInternalsCertificates,
  })
}

// eslint-disable-next-line no-console
main().catch(console.error)
