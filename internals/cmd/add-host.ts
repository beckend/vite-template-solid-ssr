import * as yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const hostile = require('hostile')

const args = yargs(hideBin(process.argv)).parse() as any

const isSpawned = args.hostToAdd !== undefined

export const cmd = (hostToAddInput?: string) => {
  if (process.getuid() !== 0) {
    throw new Error('To add a host, root privilege is required.')
  }

  const hostToAdd = hostToAddInput || args.hostToAdd

  return new Promise<string>((resolve, reject) => {
    hostile.set('127.0.0.1', hostToAdd, (err: undefined | Error) => {
      if (err) {
        reject(err)
      } else {
        resolve(`host: ${hostToAdd} added successfully.`)
      }
    })
  })
}

if (isSpawned) {
  cmd().then(console.log).catch(console.error)
}
