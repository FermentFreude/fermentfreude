import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { autoTranslateGlobal } from '@/hooks/autoTranslateGlobal'
import { revalidateGlobal } from './hooks/revalidateGlobal'

/**
 * Chat assistant ("Frag uns" bubble in the bottom corner of every page).
 *
 * The assistant answers visitor questions with Claude, using live data from
 * Workshops, Workshop dates, Products, Online Courses, the Help & FAQ page and
 * Business Info. Everything here is optional: empty fields fall back to the
 * built-in defaults in `src/components/ChatAssistant/defaults.ts`.
 *
 * The bubble only appears when "Enabled" is ticked AND the server has an
 * ANTHROPIC_API_KEY environment variable.
 */
export const ChatAssistantGlobal: GlobalConfig = {
  slug: 'chat-assistant-global',
  label: 'Chat Assistant',
  admin: {
    group: 'Website',
    description:
      'Der Chat-Assistent unten rechts auf jeder Seite. Er beantwortet Fragen zu Workshops, Terminen, Produkten und FAQ automatisch anhand der Inhalte im Admin. / The chat bubble in the bottom corner. It answers questions about workshops, dates, products and FAQ using the content in this admin.',
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateGlobal, autoTranslateGlobal],
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enabled',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Chat-Blase auf der Website anzeigen. / Show the chat bubble on the website. (Also needs the ANTHROPIC_API_KEY env var on Vercel.)',
      },
    },
    {
      type: 'collapsible',
      label: 'Texts in the chat window',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'launcherLabel',
          type: 'text',
          localized: true,
          label: 'Bubble label',
          admin: {
            description: 'Text on the round chat button (e.g. "Fragen?"). Leave empty for the default.',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: 'Window title',
          admin: { description: 'Heading at the top of the chat window (e.g. "FermentFreude Assistent").' },
        },
        {
          name: 'greeting',
          type: 'textarea',
          localized: true,
          label: 'Greeting',
          admin: { description: 'First message visitors see when they open the chat.' },
        },
        {
          name: 'inputPlaceholder',
          type: 'text',
          localized: true,
          label: 'Input placeholder',
          admin: { description: 'Grey hint text in the message box (e.g. "Deine Frage…").' },
        },
        {
          name: 'suggestedQuestions',
          type: 'array',
          label: 'Suggested questions',
          labels: { singular: 'Question', plural: 'Questions' },
          maxRows: 4,
          admin: {
            description:
              'Up to 4 quick-start buttons shown under the greeting (e.g. "Wann ist der nächste Kombucha-Workshop?").',
          },
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
              localized: true,
              label: 'Question',
            },
          ],
        },
        {
          name: 'privacyNote',
          type: 'textarea',
          localized: true,
          label: 'Privacy note',
          admin: {
            description:
              'Small note under the message box. Should mention that messages are processed by an AI service and link to the privacy policy.',
          },
        },
      ],
    },
    {
      name: 'extraKnowledge',
      type: 'textarea',
      localized: true,
      label: 'Extra knowledge for the assistant',
      admin: {
        description:
          'Alles, was der Assistent zusätzlich wissen soll und nicht schon auf der Website steht (z.B. Parken, Barrierefreiheit, Gruppenanfragen, Firmen-Events). Klartext, je ein Punkt pro Zeile. / Anything else the assistant should know that is not already on the site. Plain text, one point per line.',
        rows: 10,
      },
    },
  ],
}
