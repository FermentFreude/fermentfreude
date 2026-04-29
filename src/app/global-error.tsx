'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#FAF7F2' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily:
              "'Neue Haas Grotesk Text Pro', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            color: '#1d1d1d',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#fff',
              border: '1px solid rgba(29,29,29,0.1)',
              borderRadius: '16px',
              padding: '32px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                backgroundColor: '#e6be68',
                padding: '2px 6px',
                marginBottom: '16px',
              }}
            >
              Error
            </span>
            <h1
              style={{
                fontFamily: "'Neue Haas Grotesk Display Pro', system-ui, sans-serif",
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 900,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Something went wrong
            </h1>
            <p style={{ marginTop: '12px', fontSize: '15px', color: 'rgba(29,29,29,0.75)' }}>
              An unexpected error occurred. Please try again.
            </p>
            {error?.digest ? (
              <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(29,29,29,0.4)' }}>
                Ref: {error.digest}
              </p>
            ) : null}
            <button
              onClick={() => reset()}
              type="button"
              style={{
                marginTop: '24px',
                backgroundColor: '#1d1d1d',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '14px',
                padding: '12px 24px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
