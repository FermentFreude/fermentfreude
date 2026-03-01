'use client'

import Link from 'next/link'
import { useState, useCallback } from 'react'
import { motion } from 'motion/react'

const BRAND = 'FERMENTFREUDE'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function FooterBrand() {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <div className="w-full py-8 flex items-end gap-4 flex-nowrap">
      <Link
        href="/"
        aria-label="FermentFreude home"
        className="block flex-1 min-w-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className="font-display font-black uppercase leading-[0.85] tracking-[-0.04em] text-[#1d1d1d] block whitespace-nowrap select-none"
          style={{ fontSize: 'clamp(1.8rem, 9vw, 10rem)' }}
        >
          {BRAND.split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={
                isHovered
                  ? {
                      opacity: [0, 1],
                      filter: ['blur(10px)', 'blur(0px)'],
                    }
                  : { opacity: 1, filter: 'blur(0px)' }
              }
              transition={
                isHovered
                  ? {
                      duration: 0.4,
                      delay: i * 0.04,
                      ease: 'easeOut',
                    }
                  : { duration: 0.2 }
              }
            >
              {char}
            </motion.span>
          ))}
        </span>
      </Link>

      {/* Back to top button */}
      <motion.button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="flex-shrink-0 aspect-square bg-[#1d1d1d] text-white rounded-full flex items-center justify-center cursor-pointer mb-1"
        style={{ width: 'clamp(2.5rem, 5vw, 5.5rem)', height: 'clamp(2.5rem, 5vw, 5.5rem)' }}
        whileHover={{ scale: 1.1, backgroundColor: '#e6be68' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          className="w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </motion.button>
    </div>
  )
}
