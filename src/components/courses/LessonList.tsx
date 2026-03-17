'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PlayCircle, X } from 'lucide-react'
import { useState } from 'react'

export interface Lesson {
  id?: string
  title?: string
  locked?: boolean
  videoUrl?: string | null
}

export interface Module {
  id?: string
  title?: string
  lessons?: Lesson[]
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function getEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'video'; src: string } {
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (yt) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`,
    }
  }
  // Vimeo
  const vim = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vim) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vim[1]}?autoplay=1` }
  }
  // Direct video file
  return { type: 'video', src: url }
}

export function LessonList({ modules }: { modules: Module[] }) {
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null)

  return (
    <>
      <div className="space-y-6">
        {modules.map((mod, i) => (
          <div key={mod.id ?? `mod-${i}`} className="text-center">
            <h3 className="font-display text-subheading font-bold text-ff-near-black">
              {mod.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {(mod.lessons ?? []).map((lesson, j) => {
                const canPlay = !lesson.locked && !!lesson.videoUrl
                return (
                  <li
                    key={lesson.id ?? `lesson-${j}`}
                    className={`flex items-center justify-between gap-4 rounded-lg border border-ff-border-light bg-ff-cream/50 px-4 py-3 transition-colors ${canPlay ? 'cursor-pointer hover:bg-ff-gold-accent/10 hover:border-ff-gold-accent/40' : ''}`}
                    onClick={() =>
                      canPlay &&
                      setActiveVideo({ title: lesson.title ?? '', url: lesson.videoUrl! })
                    }
                    role={canPlay ? 'button' : undefined}
                    tabIndex={canPlay ? 0 : undefined}
                    onKeyDown={
                      canPlay
                        ? (e) =>
                            e.key === 'Enter' &&
                            setActiveVideo({ title: lesson.title ?? '', url: lesson.videoUrl! })
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20">
                        <CheckIcon className="size-4 text-ff-olive" />
                      </div>
                      <span className="text-body text-ff-near-black text-left">{lesson.title}</span>
                    </div>

                    {lesson.locked ? (
                      <svg
                        className="size-5 shrink-0 text-ff-gray-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    ) : (
                      <PlayCircle
                        className={`size-5 shrink-0 transition-transform ${canPlay ? 'text-ff-gold-accent hover:scale-110' : 'text-ff-gold-accent/40'}`}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
          <DialogTitle className="sr-only">{activeVideo?.title}</DialogTitle>

          {/* Header bar */}
          <div className="flex items-center justify-between bg-ff-near-black px-4 py-3">
            <span className="text-sm font-medium text-white truncate">{activeVideo?.title}</span>
            <button
              onClick={() => setActiveVideo(null)}
              className="text-neutral-400 hover:text-white transition-colors ml-4 shrink-0"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Video player */}
          {activeVideo &&
            (() => {
              const { type, src } = getEmbedUrl(activeVideo.url)
              if (type === 'video') {
                return (
                  <video src={src} controls autoPlay className="w-full aspect-video bg-black" />
                )
              }
              return (
                <iframe
                  src={src}
                  className="w-full aspect-video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={activeVideo.title}
                />
              )
            })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
