import React from 'react'

/** Lightweight shop skeleton so the page never looks empty while streaming */
export default function Loading() {
  return (
    <article className="min-h-[60vh] animate-pulse bg-white" aria-busy="true" aria-label="Loading shop">
      <div className="relative h-[70vh] min-h-[28rem] w-full bg-ff-warm-gray/60" />
      <div className="border-b border-ff-border-light py-6">
        <div className="container mx-auto container-padding grid grid-cols-3 gap-4">
          <div className="h-4 rounded bg-ff-warm-gray/80" />
          <div className="h-4 rounded bg-ff-warm-gray/80" />
          <div className="h-4 rounded bg-ff-warm-gray/80" />
        </div>
      </div>
      <div className="container mx-auto container-padding section-padding-md">
        <div className="mx-auto mb-10 h-8 w-64 rounded bg-ff-warm-gray/80" />
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="h-80 rounded-2xl bg-ff-warm-gray/70" />
          <div className="h-80 rounded-2xl bg-ff-warm-gray/70" />
        </div>
      </div>
    </article>
  )
}
