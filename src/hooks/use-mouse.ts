'use client'

import { useEffect, useState } from 'react'

interface UseMouseOptions {
  /** Use pageX/pageY instead of clientX/clientY */
  allowPage?: boolean
}

/**
 * Hook that tracks the mouse position.
 * Returns { x, y } in client coordinates by default.
 */
export function useMouse({ allowPage }: UseMouseOptions = {}) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setX(allowPage ? e.pageX : e.clientX)
      setY(allowPage ? e.pageY : e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [allowPage])

  return { x, y }
}
