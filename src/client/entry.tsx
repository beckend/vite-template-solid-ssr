import './styles/global.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

import { hydrate, render } from 'solid-js/web'

import { Root } from '$srcClient/components/Root'
import { getGlobal } from '$src/modules/global'

const g = getGlobal()
// eslint-disable-next-line no-underscore-dangle
const fnRender = (g as any)._$HYDRATION ? hydrate : render

fnRender(() => <Root />, document.body)
