import type { Metadata } from 'next'

import {
  BenefitsBar,
  FAQSection,
  GuideIntro,
  HeroSection,
  PracticeSection,
  ReadyToLearnCTA,
  SafetySection,
  WhatIsSection,
  WhySpecialSection,
} from '@/components/sections'

export const metadata: Metadata = {
  title: 'About Fermentation | Fermentfreude',
  description:
    'A complete guide to fermentation — from the science behind it to its health benefits, safety, and FAQ.',
}

/**
 * Fermentation info page.
 * Composed from reusable section components.
 */
export default function FermentationPage() {
  return (
    <article>
      <HeroSection />
      <BenefitsBar />
      <GuideIntro />
      <WhatIsSection />
      <WhySpecialSection />
      <SafetySection />
      <PracticeSection />
      <ReadyToLearnCTA />
      <FAQSection />
    </article>
  )
}
