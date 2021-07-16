import { Component } from 'solid-js'
import cn from 'classnames'

import styles from './styles.module.css'

export const ID = 'loader-overlay'

export const Circles: Component<{
  readonly classes?: Array<string> | string
  readonly dark?: boolean
  readonly onRef?: (x: HTMLElement) => void
}> = (p) => (
  <div
    id={ID}
    class={cn(p.classes, styles.root, {
      [styles.rootDark]: p.dark,
    })}
    ref={p.onRef}
  >
    <section>
      <div class={styles.spinner}>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>
    </section>
  </div>
)
