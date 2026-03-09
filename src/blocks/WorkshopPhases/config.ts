import type { Block } from 'payload'

export const WorkshopPhases: Block = {
  slug: 'workshopPhases',
  interfaceName: 'WorkshopPhasesBlock',
  labels: {
    singular: 'Workshop Phases',
    plural: 'Workshop Phases Blocks',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: 'Eyebrow / Section Label',
      admin: {
        description:
          'Small accent text above the heading (e.g. "WAS DICH ERWARTET" / "WHAT TO EXPECT").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Heading',
      admin: {
        description:
          'Main heading for the phases section (e.g. "Dein Workshop-Erlebnis" / "Your Workshop Experience").',
      },
    },
    {
      name: 'phases',
      type: 'array',
      label: 'Workshop Phases',
      minRows: 1,
      maxRows: 6,
      admin: {
        description:
          'Each phase represents a part of the workshop experience (e.g., Theory → Practice → Flavor).',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Phase Label',
          admin: {
            description:
              'Short label for this phase (e.g. "THEORIE" / "THEORY", "PRAXIS" / "PRACTICE").',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Phase Title',
          admin: {
            description: 'Main title for this phase (e.g. "Kombucha-Mikrobiologie").',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Phase Description',
          admin: {
            description: 'Detailed description of what happens in this phase.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Phase Image',
          admin: {
            description:
              'Visual for this phase. Recommended: square or landscape image (800x600px or larger).',
          },
        },
      ],
    },
  ],
}
