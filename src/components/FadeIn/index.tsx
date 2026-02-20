'use client'

import React, { useEffect, useRef, useState } from 'react'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /** Stagger delay in ms */
  delay?: number
  /** Direction to animate from */
  from?: 'bottom' | 'left' | 'right'
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  from = 'bottom',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const translate = {
    bottom: isVisible ? 'translate-y-0' : 'translate-y-5',
    left: isVisible ? 'translate-x-0' : '-translate-x-5',
    right: isVisible ? 'translate-x-0' : 'translate-x-5',
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${translate[from]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
