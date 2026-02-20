'use client'
import { useEffect, useRef } from 'react'

/**
 * useIgnoredEffect
 * @param effect - The effect callback function
 * @param triggerDeps - Dependencies that will trigger the effect when changed
 * @param ignoredDeps - Dependencies that will update their references but not trigger the effect
 */
export function useIgnoredEffect(
  effect: () => void | (() => void),
  triggerDeps: unknown[],
  ignoredDeps: unknown[],
) {
  const ignoredDepsRef = useRef(ignoredDeps)

  // Update ref when ignoredDeps change, but do not trigger the effect
  useEffect(() => {
    ignoredDepsRef.current = ignoredDeps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, ignoredDeps)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, triggerDeps)
}
