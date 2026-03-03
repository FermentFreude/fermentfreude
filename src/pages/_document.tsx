import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Minimal _document for compatibility when Next.js expects a Pages Router document.
 * This project uses App Router; this file satisfies internal Next.js/Payload expectations.
 */
export default function Document() {
  return (
    <Html lang="de">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
