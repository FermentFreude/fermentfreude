export const metadata = {
  title: 'FermentFreude — Coming Soon',
  description: 'FermentFreude — Coming Soon',
  robots: { index: false, follow: false },
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/dtk7kir.css" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"neue-haas-grotesk-display-pro", sans-serif',
          fontWeight: 700,
          background: '#faf9f6',
          color: '#1a1a1a',
        }}
      >
        {children}
      </body>
    </html>
  )
}
