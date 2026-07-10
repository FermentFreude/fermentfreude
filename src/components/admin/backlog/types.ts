export type Owner = 'dev' | 'alaa' | 'david' | 'marcel'
export type Category =
  | 'bug'
  | 'feature'
  | 'content'
  | 'legal'
  | 'org'
  | 'performance'
  | 'design'
  | 'decision'
export type Priority = 'critical' | 'must' | 'should' | 'nice'
export type Status = 'open' | 'partial' | 'their-action' | 'blocked' | 'done' | 'future'
export type Effort = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type Board = 'current' | 'new'

export type Todo = { id?: string; text: string; done: boolean }

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
  category: Category
  priority: Priority
  status: Status
  effort: Effort
  owners: Owner[]
  slug?: string
  related?: string
  description?: string
  response?: string
  notes?: string
  todos?: Todo[]
  decision?: Decision | null
}

export const PRI_ORDER: Record<Priority, number> = { critical: 0, must: 1, should: 2, nice: 3 }
export const EFF_ORDER: Record<Effort, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4 }

export const PRI_COLORS: Record<Priority, string> = {
  critical: '#B91C1C',
  must: '#B45309',
  should: '#1D4ED8',
  nice: '#9CA3AF',
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
  'their-action': 'Their Action',
  blocked: 'Blocked',
  done: 'Done',
  future: 'Parked',
}
export const STATUS_COLORS: Record<Status, string> = {
  open: '#3B82F6',
  partial: '#F59E0B',
  'their-action': '#8B5CF6',
  blocked: '#EF4444',
  done: '#22C55E',
  future: '#94A3B8',
}

export const OWNER_LABELS: Record<Owner, string> = {
  dev: 'Dev',
  alaa: "Ala'a",
  david: 'David',
  marcel: 'Marcel',
}

export const CATEGORY_COLORS: Record<Category, { bg: string; ink: string; br: string }> = {
  bug: { bg: '#FEF2F2', ink: '#991B1B', br: '#FECACA' },
  feature: { bg: '#EFF6FF', ink: '#1E40AF', br: '#BFDBFE' },
  content: { bg: '#F9FAFB', ink: '#374151', br: '#D1D5DB' },
  performance: { bg: '#FFF7ED', ink: '#C2410C', br: '#FED7AA' },
  design: { bg: '#FAF5FF', ink: '#7C3AED', br: '#DDD6FE' },
  org: { bg: '#F0F9FF', ink: '#075985', br: '#BAE6FD' },
  legal: { bg: '#FFF1F2', ink: '#881337', br: '#FECDD3' },
  decision: { bg: '#ECFEFF', ink: '#0E7490', br: '#A5F3FC' },
}

export const CATEGORY_OPTIONS: Category[] = [
  'bug',
  'feature',
  'content',
  'legal',
  'org',
  'performance',
  'design',
]
export const STATUS_OPTIONS: Status[] = ['open', 'partial', 'their-action', 'blocked', 'done', 'future']
export const PRIORITY_OPTIONS: Priority[] = ['critical', 'must', 'should', 'nice']
export const EFFORT_OPTIONS: Effort[] = ['XS', 'S', 'M', 'L', 'XL']
export const OWNER_OPTIONS: Owner[] = ['dev', 'alaa', 'david', 'marcel']

export const ACCENT = '#B91C1C'

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
  | 'dev'
  | 'founders'

export const FNAV: { id: FilterId; label: string; dot?: string; sep?: boolean }[] = [
  { id: 'all', label: 'All items' },
  { id: 'all', label: '', sep: true },
  { id: 'critical', label: '★ Critical', dot: '#B91C1C' },
  { id: 'must', label: 'Must-have', dot: '#B45309' },
  { id: 'should', label: 'Should-have', dot: '#1D4ED8' },
  { id: 'nice', label: 'Nice to have', dot: '#9CA3AF' },
  { id: 'all', label: '', sep: true },
  { id: 'open', label: 'Open', dot: '#3B82F6' },
  { id: 'partial', label: 'In Progress', dot: '#F59E0B' },
  { id: 'their-action', label: 'Their Action', dot: '#8B5CF6' },
  { id: 'done', label: 'Done', dot: '#22C55E' },
  { id: 'future', label: 'Parked', dot: '#94A3B8' },
  { id: 'all', label: '', sep: true },
  { id: 'decisions', label: '❖ Decisions', dot: '#0E7490' },
  { id: 'all', label: '', sep: true },
  { id: 'dev', label: 'Dev work' },
  { id: 'founders', label: "Founders' work" },
]

export function matchesFilter(item: BacklogItem, fid: FilterId): boolean {
  switch (fid) {
    case 'all':
      return true
    case 'critical':
      return item.priority === 'critical' && item.status !== 'done'
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
      return item.category === 'decision'
    case 'dev':
      return item.owners?.some((o) => o === 'dev' || o === 'alaa')
    case 'founders':
      return item.owners?.some((o) => o === 'david' || o === 'marcel')
    default:
      return true
  }
}
