/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-explicit-any */
import { dirname, join } from 'path'
import * as forge from 'node-forge'
import { isAfter as dIsAfter, sub as dSub } from 'date-fns'
import * as fs from 'fs-extra'
import * as execa from 'execa'

import { Configuration } from '../common/configuration'
import { File } from './file'

export class SSL {
  static createSSL = async <
    T1 extends {
      readonly configuration: Configuration
      readonly hostToAdd: string
      readonly pathOutput: string
    }
  >({
    configuration,
    hostToAdd,
    pathOutput,
  }: T1) => {
    if ((await execa('which', ['mkcert'], { shell: true })).exitCode !== 0) {
      throw new Error(
        'This script requires mkcert, nss, install from https://github.com/FiloSottile/mkcert'
      )
    }

    const pathFileCertCA = process.env.NODE_EXTRA_CA_CERTS

    if (!pathFileCertCA) {
      throw new Error(
        'environment variable NODE_EXTRA_CA_CERTS is not properly set, use --> export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"'
      )
    }

    const paths = {
      file: {
        certificates: {
          CA: pathFileCertCA,
          cert: join(pathOutput, configuration.names.files.rootInternalsCertificatesCert),
          key: join(pathOutput, configuration.names.files.rootInternalsCertificatesKey),
        },
      },
    }

    const getReturn = async () => {
      const [contentFileCA, contentFileCert, contentFileKey] = await Promise.all([
        File.read.toString({ pathFile: paths.file.certificates.CA }),
        File.read.toString({ pathFile: paths.file.certificates.cert }),
        File.read.toString({ pathFile: paths.file.certificates.key }),
      ])

      return {
        contents: {
          CA: contentFileCA,
          cert: contentFileCert,
          key: contentFileKey,
        },

        paths: paths.file.certificates,
      }
    }

    try {
      const cert = forge.pki.certificateFromPem(
        await File.read.toString({ pathFile: paths.file.certificates.cert })
      )

      dSub(new Date(), {
        weeks: 1,
      })

      // not expired then do not create anything new
      if (
        dIsAfter(
          cert.validity.notAfter,
          // renew 1 week before
          dSub(new Date(), {
            weeks: 1,
          })
        )
      ) {
        return await getReturn()
      }
      // eslint-disable-next-line no-empty
    } catch {}

    await fs.ensureDir(dirname(paths.file.certificates.cert))

    const hostToAddSplit = hostToAdd.split('.')
    if (hostToAddSplit.length < 2) {
      throw new Error(`invalid host name to add: ${hostToAdd}`)
    }

    const hostBase = (
      hostToAddSplit.length > 2 ? hostToAddSplit.slice(1).slice(-2) : hostToAddSplit
    ).join('.')

    await Promise.all([
      execa(
        `mkcert -key-file ${paths.file.certificates.key} -cert-file ${paths.file.certificates.cert} "${hostBase}" "*.${hostBase}" localhost 127.0.0.1 ::1`,
        {
          shell: true,
        }
      ),
      execa('mkcert -install', {
        shell: true,
      }),
    ])

    return getReturn()
  }
}
