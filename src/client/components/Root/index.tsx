import { Component, createSignal, ErrorBoundary, lazy, onMount, Suspense, Switch } from 'solid-js'
import { MetaProvider } from 'solid-meta'
import { isServer } from 'solid-js/web'
import { createStore } from 'solid-js/store'
import { Router, pathIntegration, MatchRoute, useRouter } from '@rturnq/solid-router'
import cn from 'classnames'

import { TArgumentTypes } from '$src/types/model'
import { ErrorContent } from '$srcClient/components/Error'
import { Circles, ID as IDCircles } from '$src/client/components/Loaders/Circles'

import styles from './styles.module.css'

interface TagDescription {
  tag: string
  props: Record<string, unknown>
}

export interface IProps {
  readonly tags?: Array<TagDescription>
  readonly URL?: string
}

const local = {
  C404: lazy(() =>
    import('$srcClient/components/Error').then(({ ErrorContent: x }) => ({ default: x }))
  ),

  RouteLoading: (() => undefined) as Component,

  App: lazy(() => import('$srcClient/routes/App').then(({ App: x }) => ({ default: x }))),

  errorFallback: ((err) => <ErrorContent code={500} message={err.message} />) as TArgumentTypes<
    typeof ErrorBoundary
  >[0]['fallback'],
}

// @TODO detect light theme after finish render and switch window.matchMedia('(prefers-color-scheme: dark|light)')
const RootBase: Component<IProps> = (p) => {
  const [state, setState] = createStore({
    initialPageLoaded: false,
  })

  onMount(() => {
    requestAnimationFrame(() => {
      setState({ initialPageLoaded: true })

      setTimeout(() => {
        document.getElementById(IDCircles).remove()
      }, 2000)
    })
  })

  // All navigation in the router is done under transition so we can suspend while waiting for lazy
  // components or resources. Use `isRouting` to access the loading state of that transition and
  // the user an indicator.
  const { isRouting } = useRouter()
  const getInitialPageLoaded = () => !isRouting() && state.initialPageLoaded

  return (
    <ErrorBoundary fallback={local.errorFallback}>
      <MetaProvider tags={p.tags}>
        <div class={styles.root}>
          <Circles
            classes={cn(styles.overlay, {
              [styles.overlayLoadingDone]: getInitialPageLoaded(),
            })}
          />

          <header class={styles.header} />

          <main class={styles.main}>
            <Suspense fallback={<local.RouteLoading />}>
              <Switch fallback={<local.C404 code={404} message="not found" />}>
                <MatchRoute end>
                  <local.App />
                </MatchRoute>
              </Switch>
            </Suspense>
          </main>

          <footer class={styles.footer} />
        </div>
      </MetaProvider>
    </ErrorBoundary>
  )
}

export const Root: Component<IProps> = (p) => (
  <Router integration={isServer && p.URL ? createSignal({ value: p.URL }) : pathIntegration()}>
    <RootBase {...p} />
  </Router>
)
