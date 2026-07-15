export type Owner = 'dev' | 'admin'
export type Category =
  | 'org'
  | 'bug'
  | 'content'
  | 'legal'
  | 'crm'
  | 'shop'
  | 'analytics'
  | 'performance'
  | 'seo'
  | 'design'
  | 'dashboard'
  | 'security'
  | 'feature'
  | 'future'
export type Priority = 'critical' | 'must' | 'should' | 'nice'
export type BusinessValue = 'critical' | 'high' | 'medium' | 'low'
export type Status = 'open' | 'partial' | 'their-action' | 'blocked' | 'done' | 'future'
export type Effort = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Unknown'
export type Board = 'roadmap' | 'backlog' | 'features'
export type BillingScope = 'included' | 'extra'

export type Todo = { id?: string; text: string; done: boolean }
export type ItemLink = { id?: string; label?: string; url: string }

export type DecisionOption = { label: string; desc: string; recommended?: boolean }
export type Decision = {
  question: string
  choice: string | null
  notes: string
  options: Record<string, DecisionOption>
}

export type BacklogItem = {
  id: string
  itemId: string
  board: Board
  title: string
  folderLabel?: string
  category: Category
  priority: Priority
  businessValue?: BusinessValue
  status: Status
  effort: Effort
  billingScope: BillingScope
  owners: Owner[]
  slug?: string
  related?: string
  parent?: string | null
  plannedFor?: string
  description?: string
  response?: string
  area?: string
  sourceContext?: string
  dependencies?: string
  nextActionText?: string
  notes?: string
  todos?: Todo[]
  links?: ItemLink[]
  decision?: Decision | null
}

export const PRI_ORDER: Record<Priority, number> = { critical: 0, must: 1, should: 2, nice: 3 }
export const EFF_ORDER: Record<Effort, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4, Unknown: 5 }

// ── Brand palette: black / gold / grey only. Gold is the single accent — used for
// critical priority, primary actions, active states, and "needs attention" markers.
// Everything else is differentiated by weight and fill, not hue. ──────────────────
export const ACCENT = '#E6BE68' // ff-gold
export const INK = '#1A1A1A' // ff-near-black
export const INK_SOFT = '#4B4B4B' // ff-charcoal
export const MUTED = '#767671' // muted grey text
export const BORDER = '#E3DFD4' // warm hairline border

export const PRI_COLORS: Record<Priority, string> = {
  critical: ACCENT,
  must: INK,
  should: INK_SOFT,
  nice: MUTED,
}
export const PRI_LABELS: Record<Priority, string> = {
  critical: 'Critical',
  must: 'Must-have',
  should: 'Should-have',
  nice: 'Nice to have',
}

export const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  partial: 'In Progress',
  'their-action': 'Need Decision',
  blocked: 'Parked',
  done: 'Done',
  future: 'Future',
}
// dot fill only — solid black (active), solid gold (needs attention), grey outline (settled)
export const STATUS_COLORS: Record<Status, string> = {
  open: INK,
  partial: INK_SOFT,
  'their-action': ACCENT,
  blocked: INK,
  done: MUTED,
  future: MUTED,
}

export const OWNER_LABELS: Record<Owner, string> = {
  dev: 'Dev',
  admin: 'Admin',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  org: 'Organization',
  bug: 'Bug Fix',
  content: 'Content',
  legal: 'Legal',
  crm: 'CRM / Brevo',
  shop: 'Shop',
  analytics: 'Analytics / Tracking',
  performance: 'Performance',
  seo: 'SEO',
  design: 'UX / Design',
  dashboard: 'Dashboard / CMS',
  security: 'Security',
  feature: 'Feature',
  future: 'Future Feature',
}

export const CATEGORY_OPTIONS: Category[] = [
  'org',
  'bug',
  'content',
  'legal',
  'crm',
  'shop',
  'analytics',
  'performance',
  'seo',
  'design',
  'dashboard',
  'security',
  'feature',
  'future',
]
export const BUSINESS_VALUE_LABELS: Record<BusinessValue, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}
export const BILLING_SCOPE_LABELS: Record<BillingScope, string> = {
  included: 'Included — retainer',
  extra: 'Extra — outside scope',
}
export const BILLING_SCOPE_OPTIONS: BillingScope[] = ['included', 'extra']

export const STATUS_OPTIONS: Status[] = ['open', 'partial', 'their-action', 'blocked', 'done', 'future']
export const PRIORITY_OPTIONS: Priority[] = ['critical', 'must', 'should', 'nice']
export const EFFORT_OPTIONS: Effort[] = ['XS', 'S', 'M', 'L', 'XL', 'Unknown']
export const OWNER_OPTIONS: Owner[] = ['dev', 'admin']

export const BOARD_LABELS: Record<Board, string> = {
  roadmap: 'Main Roadmap',
  backlog: 'Backlog',
  features: 'New Features',
}
export const BOARD_SUBTITLES: Record<Board, string> = {
  roadmap: 'Mirrors the Fermentfreude Website Roadmap & Operations spreadsheet — the single source of truth.',
  backlog: 'Bugs, small issues and maintenance — kept separate from big feature builds.',
  features: "New dashboard capabilities, expanded from David's operational use-case brief.",
}

export type FilterId =
  | 'all'
  | 'critical'
  | 'must'
  | 'should'
  | 'nice'
  | 'open'
  | 'partial'
  | 'their-action'
  | 'blocked'
  | 'done'
  | 'future'
  | 'decisions'

export const FNAV: { id: FilterId; label: string; dot?: string; sep?: boolean }[] = [
  { id: 'all', label: 'All items' },
  { id: 'all', label: '', sep: true },
  { id: 'critical', label: 'Critical', dot: ACCENT },
  { id: 'must', label: 'Must-have', dot: INK },
  { id: 'should', label: 'Should-have', dot: INK_SOFT },
  { id: 'nice', label: 'Nice to have', dot: MUTED },
  { id: 'all', label: '', sep: true },
  { id: 'open', label: 'Open', dot: INK },
  { id: 'partial', label: 'In Progress', dot: INK_SOFT },
  { id: 'their-action', label: 'Need Decision', dot: ACCENT },
  { id: 'done', label: 'Done', dot: MUTED },
  { id: 'future', label: 'Future', dot: MUTED },
  { id: 'all', label: '', sep: true },
  { id: 'decisions', label: 'Decisions', dot: ACCENT },
]

export function matchesFilter(item: BacklogItem, fid: FilterId): boolean {
  switch (fid) {
    case 'all':
      return true
    case 'critical':
      return (item.priority === 'critical' || item.businessValue === 'critical') && item.status !== 'done'
    case 'must':
      return item.priority === 'must'
    case 'should':
      return item.priority === 'should'
    case 'nice':
      return item.priority === 'nice'
    case 'open':
      return item.status === 'open'
    case 'partial':
      return item.status === 'partial'
    case 'their-action':
      return item.status === 'their-action'
    case 'blocked':
      return item.status === 'blocked'
    case 'done':
      return item.status === 'done'
    case 'future':
      return item.status === 'future'
    case 'decisions':
      return Boolean(item.decision)
    default:
      return true
  }
}
