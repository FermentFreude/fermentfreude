/**
 * Seed data builder for the TeamPreview block.
 */

export interface TeamPreviewImages {
  davidPhotoId: string
  marcelPhotoId: string
}

export function buildTeamPreview(imgs: TeamPreviewImages) {
  const de = {
    blockType: 'teamPreview' as const,
    eyebrow: 'Unser Team',
    heading: 'Nur die besten Instruktoren',
    description:
      'Unsere Gründer David und Marcel bringen jahrelange Erfahrung in Fermentation, Lebensmittelwissenschaft und kulinarischer Ausbildung mit. Jeder Workshop wird persönlich von ihnen geleitet.',
    buttonLabel: 'Über uns',
    buttonLink: '/about',
    members: [
      { name: 'David Heider', role: 'Gründer & Instruktor', image: imgs.davidPhotoId },
      { name: 'Marcel Rauminger', role: 'Gründer & Instruktor', image: imgs.marcelPhotoId },
    ],
  }

  const en = {
    blockType: 'teamPreview' as const,
    eyebrow: 'Our Team',
    heading: 'Only The Best Instructors',
    description:
      'Our founders David and Marcel bring years of experience in fermentation, food science, and culinary education. Every workshop is personally led by them.',
    buttonLabel: 'About us',
    buttonLink: '/about',
    members: [
      { name: 'David Heider', role: 'Founder & Instructor', image: imgs.davidPhotoId },
      { name: 'Marcel Rauminger', role: 'Founder & Instructor', image: imgs.marcelPhotoId },
    ],
  }

  return { de, en }
}

type TeamPreviewBlock = {
  id?: string
  members?: { id?: string }[]
}

export function mergeTeamPreviewEN(
  en: ReturnType<typeof buildTeamPreview>['en'],
  fresh: TeamPreviewBlock,
) {
  return {
    ...en,
    id: fresh.id,
    members: en.members.map((m, i) => ({ ...m, id: fresh.members?.[i]?.id })),
  }
}
