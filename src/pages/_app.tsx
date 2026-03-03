import type { AppProps } from 'next/app'

/**
 * Minimal _app for Pages Router compatibility when _document exists.
 * This project primarily uses App Router.
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
