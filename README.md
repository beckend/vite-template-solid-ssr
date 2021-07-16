# Vite + SolidJS SSR + TailwindCSS template

## Install and usage

```bash
# or pnpm install or yarn install
$ npm i
# installs local development SSL certificates, customize settings in .envrc file
$ npm run prepare
```

# Recommended to install
* [direnv](https://github.com/direnv/direnv) - autoloads `.envrc` and `.envrc.local.sh`(if executable, and is gitignored for local customizations)

---


## Useful scripts

In the project directory, you can run:

### npm scripts

### `dev:ssr`
Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `dev:ssr-production`

Same as `dev:ssr` but will build production bundles

### `build`
Builds the app for production to the `dist` folder.<br>

---
## Deployment

You can deploy the `dist` folder to any static host.


---

## Information
- TailwindCSS in jit mode
- Uses fastify
- Client related files => `src/client`, server => `src/server`

### Environment information
- Development has valid local signed SSL certificate using `mkcert` running the script `npm run prepare`, this will pass for major web browsers.
- Production will have no SSL since normally you have a load balancer which terminates SSL.

---

### Learn more on the [Solid Website](https://solidjs.com)
