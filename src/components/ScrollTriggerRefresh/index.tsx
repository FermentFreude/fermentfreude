'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Keeps every GSAP ScrollTrigger (pins, scrubs, fade-ins) measured against the
 * real page layout.
 *
 * ScrollTriggers record their start/end positions when created. Anything that
 * changes the page height afterwards — images loading, the workshop slider
 * setting its tall scroll height, sections above appearing — leaves those
 * positions stale: pins start in the wrong place and snap, fade-ins fire early
 * or late. This watches the page height and re-measures once it settles.
 */
export function ScrollTriggerRefresh() {
  useEffect(() => {
    let lastHeight = document.documentElement.scrollHeight
    let timer: ReturnType<typeof setTimeout> | undefined

    const schedule = () => {
      clearTimeout(timer)
      // Wait for the layout to settle (several images often load together)
      timer = setTimeout(() => {
        const height = document.documentElement.scrollHeight
        if (Math.abs(height - lastHeight) < 2) return
        lastHeight = height
        ScrollTrigger.refresh()
      }, 200)
    }

    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return null
}
