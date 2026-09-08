import React from 'react'

/** Split supporting copy so each sentence starts on its own line. */
export function sentenceLines(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function SentenceBreakText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const lines = sentenceLines(text)
  if (lines.length <= 1) {
    return <p className={className}>{text.trim()}</p>
  }

  return (
    <p className={className}>
      {lines.map((line, i) => (
        <span key={`${i}-${line}`} className="block">
          {line}
        </span>
      ))}
    </p>
  )
}
