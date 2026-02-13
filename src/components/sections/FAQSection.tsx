import { ContentSection } from '@/components/ui/ContentSection'
import { FAQCard } from '@/components/ui/FAQCard'

const faqs = [
  {
    question: 'Does fermentation kill bacteria?',
    answer:
      'No, fermentation promotes beneficial bacteria growth. However, the acids produced prevent harmful bacteria from surviving, making fermented foods safe.',
  },
  {
    question: 'Can I ferment at room temperature?',
    answer:
      'Yes! Most fermentation happens at 65-75°F (18-24°C). Warmer speeds up fermentation, cooler slows it down. Avoid direct sunlight and extreme temperatures.',
  },
  {
    question: 'How long does fermentation take?',
    answer:
      'It varies widely: 3-7 days for sauerkraut, 24 hours for yogurt, several months for miso. Taste test to find your preferred level of tanginess.',
  },
  {
    question: 'Is fermentation the same as pickling?',
    answer:
      'Not exactly. Fermentation uses salt and time (lacto-fermentation), while pickling uses vinegar. Fermented pickles are probiotic; vinegar pickles are not.',
  },
  {
    question: 'Can I eat fermented foods every day?',
    answer:
      'Yes! Start with small amounts to let your gut adjust, then gradually increase. 1-2 tablespoons of fermented vegetables daily is a great goal.',
  },
  {
    question: 'Do fermented foods go bad?',
    answer:
      "They're already preserved, but they can over-ferment or spoil if contaminated. Store in the fridge after desired fermentation level to slow the process.",
  },
]

/**
 * FAQ section with 2×3 grid of FAQ cards + "Ready to Start Fermenting?" CTA bar.
 */
export function FAQSection() {
  return (
    <ContentSection bg="none" padding="lg">
      <div className="mx-auto max-w-6xl rounded-[51px] border border-ff-border-light bg-ff-cream p-8 md:p-16 lg:p-20">
        {/* Heading */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold text-ff-gray-text md:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-ff-gray-text md:text-2xl">
            Common questions about fermentation answered
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {faqs.map((faq) => (
            <FAQCard answer={faq.answer} key={faq.question} question={faq.question} />
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-12 rounded-full bg-[#d7d6d5] px-8 py-8 text-center md:mt-16 md:px-16">
          <p className="text-lg font-bold text-ff-charcoal">Ready to Start Fermenting?</p>
          <p className="mt-2 text-base text-ff-near-black">
            Begin with simple vegetables like cabbage or cucumbers, use the proper salt ratio (2-3%
            by weight), and trust the process!
          </p>
        </div>
      </div>
    </ContentSection>
  )
}
