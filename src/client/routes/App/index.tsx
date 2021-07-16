import type { Component } from 'solid-js'

import logo from '$srcClient/assets/logo.svg'
import styles from './index.module.css'

export const App: Component = () => (
  <div class={styles.root}>
    <header class={styles.header}>
      <img src={logo} class={styles.logo} alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        class={styles.link}
        href="https://github.com/ryansolid/solid"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn Solid
      </a>
    </header>
  </div>
)
