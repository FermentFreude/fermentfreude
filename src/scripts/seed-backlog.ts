/**
 * Seed the internal team Backlog board (BacklogItems collection).
 *
 * Three tabs:
 *  - roadmap:  exact mirror of Fermentfreude_Website_Roadmap_Operations_v2.xlsx "Roadmap" tab (WEB-001..WEB-045)
 *  - features: new dashboard/architecture builds, expanded from David's operational use-case brief
 *  - backlog:  bugs, small fixes, maintenance — kept separate from the big feature builds
 *
 * Non-destructive by default — skips if items already exist.
 * Run: pnpm seed backlog          # skips if items already exist
 *      pnpm seed backlog --force  # deletes existing items and reseeds
 */
import type { BacklogItem } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type Board = BacklogItem['board']
type Category = BacklogItem['category']
type Priority = BacklogItem['priority']
type Status = BacklogItem['status']
type Effort = BacklogItem['effort']
type BusinessValue = NonNullable<BacklogItem['businessValue']>
type Owner = NonNullable<BacklogItem['owners']>[number]

type SeedItem = {
  id: string
  board: Board
  category: Category
  title: string
  folderLabel?: string // friendlier name shown when this item acts as a folder (2+ children) in the folder view
  description?: string
  priority: Priority
  businessValue?: BusinessValue
  effort: Effort
  owners: Owner[]
  status: Status
  area?: string
  sourceContext?: string
  dependencies?: string
  nextActionText?: string
  response?: string // spreadsheet "Notes" column, or architecture writeup for feature items
  related?: string // loose "see also" pointer — NOT auto-resolved into `parent` for roadmap->roadmap links, only for feature/backlog->roadmap links (see run())
  parentId?: string // explicit hierarchy override, used when a roadmap item's true parent is another roadmap item (e.g. WEB-035 under epic WEB-033)
  billingScope?: 'included' | 'extra'
  decision?: {
    question: string
    choice: string | null
    notes: string
    options: Record<string, { label: string; desc: string; recommended?: boolean }>
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN ROADMAP — verbatim from Fermentfreude_Website_Roadmap_Operations_v2.xlsx, "Roadmap" tab
// ─────────────────────────────────────────────────────────────────
const ROADMAP: SeedItem[] = [
  { id: 'WEB-001', board: 'roadmap', category: 'org', title: 'Transfer ownership of production systems to Fermentfreude', description: 'Move all production-critical systems from personal/developer ownership to Fermentfreude ownership while keeping Rafaela as developer/admin where needed.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'GitHub, Vercel, MongoDB, Cloudflare R2, Payload, Brevo', sourceContext: 'Business continuity issue after previous outage/no access period', dependencies: 'Account transfer process', nextActionText: 'List current owners and target owners', response: 'Owner should be company; admin rights can remain with Rafaela.' },
  { id: 'WEB-002', board: 'roadmap', category: 'org', title: 'Document system architecture', description: 'Create a simple overview of all systems and how they work together: Next.js, Payload, Vercel, MongoDB, R2, Stripe, Brevo, GA4/GTM.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['dev'], status: 'done', area: 'All systems', sourceContext: 'Operational handover', dependencies: 'Input from developer', nextActionText: 'Write non-technical documentation', response: 'Should be understandable for David and Marcel.' },
  { id: 'WEB-003', board: 'roadmap', category: 'org', title: 'Dashboard / CMS onboarding session', description: 'Walk David and Marcel through the CMS/dashboard: content edits, workshops, images, products, users, bookings, common mistakes.', priority: 'must', businessValue: 'high', effort: 'S', owners: ['dev', 'admin'], status: 'open', area: 'Payload CMS / Dashboard', sourceContext: 'Internal capability building', dependencies: 'Documentation', nextActionText: 'Schedule Google Meet', response: 'Record session if possible.' },
  { id: 'WEB-004', board: 'roadmap', category: 'bug', title: 'Full route QA and stability check', description: 'Check all public routes for maintenance screens, timeout states, 404s, broken redirects, wrong language or inconsistent page states.', priority: 'must', businessValue: 'critical', effort: 'Unknown', owners: ['dev'], status: 'open', area: 'Entire website', sourceContext: 'Website audit', dependencies: 'Access to logs / deployment', nextActionText: 'Run route QA list', response: 'Include Home, Workshops, Shop, Product pages, Voucher, Gastronomy, Contact, Help, Login/Register, legal pages.' },
  { id: 'WEB-005', board: 'roadmap', category: 'bug', title: 'Remove placeholder phone number', description: 'Replace placeholder phone number +43 664 1234567 with the correct Fermentfreude number everywhere.', priority: 'must', businessValue: 'high', effort: 'S', owners: ['admin', 'dev'], status: 'open', area: 'Contact, Gastronomy, Footer if present', sourceContext: 'Website audit', dependencies: 'Find all occurrences', nextActionText: 'Search CMS and code', response: 'Correct number from Impressum should be verified before editing.' },
  { id: 'WEB-006', board: 'roadmap', category: 'bug', title: "Remove public 'Edit page in Admin' text", description: 'Remove visible admin/template text from public pages.', priority: 'must', businessValue: 'high', effort: 'S', owners: ['dev'], status: 'open', area: 'Gastronomy / B2B page', sourceContext: 'Website audit', dependencies: 'Code/CMS check', nextActionText: 'Remove from frontend', response: 'Looks unfinished and unprofessional. NOTE: dev already shipped a fix for this exact issue on the gastronomy/fermentation pages — verify this is still open on other pages before re-doing the work.' },
  { id: 'WEB-007', board: 'roadmap', category: 'content', title: 'Clean up German / English language mix', description: 'Ensure German pages are fully German and English pages are fully English. Remove template fragments.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'Voucher FAQ, Account pages, Workshop pages, Footer', sourceContext: 'Website audit', dependencies: 'Translation mapping', nextActionText: 'Create language QA list', response: "Especially FAQ, voucher, create-account and workshop modules." },
  { id: 'WEB-008', board: 'roadmap', category: 'legal', title: 'Align cancellation and voucher terms', description: 'Workshop pages, FAQ, voucher page and AGB must use the same cancellation and voucher validity rules.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'AGB, FAQs, Workshop pages, Voucher page', sourceContext: 'Website audit', dependencies: 'Legal wording decision', nextActionText: 'Decide final rules, then update all pages', response: 'Current wording appears contradictory. See docs/FermentFreude_Refund_Cancellation_Plan.pdf for policy tier options (A/B/C) and legal baseline research.' },
  { id: 'WEB-009', board: 'roadmap', category: 'legal', title: 'Privacy policy and tracking setup audit', description: 'Check whether privacy policy, cookie consent and actual tracking tools match: GA4, GTM, Clarity, Meta Pixel if active.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'Datenschutz, GTM, GA4, Clarity', sourceContext: 'Website audit/current setup', dependencies: 'Tool list', nextActionText: 'Compare tool setup with legal text', response: 'Clarity must be included if used. Needs external legal review.' },
  { id: 'WEB-010', board: 'roadmap', category: 'legal', title: 'Review health claims and probiotic wording', description: 'Check all health-related statements around probiotic, microbiome, immune system, digestion, gut-brain axis and balance wording.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin'], status: 'open', area: 'Fermentation page, Workshop pages, Product pages', sourceContext: 'Food/health claims risk', dependencies: 'Scientific/legal review', nextActionText: 'Create safer wording', response: 'Important for food communication in EU context.' },
  { id: 'WEB-011', board: 'roadmap', category: 'crm', title: 'Fix newsletter block', description: 'Check whether the newsletter form is visible, understandable, connected to Brevo and Double-Opt-in works. Fix newsletter block and understand legal aspect of using email addresses / visible in Dashboard/Brevo.', priority: 'must', businessValue: 'high', effort: 'S', owners: ['dev', 'admin'], status: 'open', area: 'Footer / Newsletter block', sourceContext: 'Website audit', dependencies: 'Brevo access', nextActionText: 'Test signup flow', response: 'Also track newsletter signup event.' },
  { id: 'WEB-012', board: 'roadmap', category: 'shop', title: 'Fix shop template remnants', description: "Remove 'Payload Ecommerce Template' and other template/default remnants from shop titles, metadata and UI.", priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev'], status: 'open', area: 'Shop / Product pages', sourceContext: 'Website audit', dependencies: 'Code/CMS metadata', nextActionText: 'Search and replace template metadata', response: 'Important before pushing shop traffic. NOTE: dev already shipped a fix for this — verify if any remnants remain.' },
  { id: 'WEB-013', board: 'roadmap', category: 'shop', title: 'Review product page information', description: 'Check product page for consistent price formatting, shelf life, storage, quantity UI, product availability and mandatory food information.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'Product page: Käferbohnen-Tempeh', sourceContext: 'Website audit', dependencies: 'Final product facts', nextActionText: 'Prepare final product info', response: 'Food e-commerce information should be consistent and complete.' },
  { id: 'WEB-014', board: 'roadmap', category: 'content', title: 'Workshop page QA', description: 'Review all workshop pages for max participants, dates, FAQs, CTAs, pricing, cancellation text and language consistency.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'Lakto, Kombucha, Tempeh pages', sourceContext: 'Website audit', dependencies: 'Content review', nextActionText: 'Create page-by-page checklist', response: 'Small inconsistencies reduce booking trust.' },
  { id: 'WEB-015', board: 'roadmap', category: 'analytics', title: 'Analytics and conversion tracking audit', description: 'Verify GA4, GTM and Clarity setup; confirm events for booking, voucher purchase, shop order, newsletter signup and contact form.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'GA4, GTM, Clarity, Stripe checkout', sourceContext: 'Marketing foundation', dependencies: 'Access to tools', nextActionText: 'Define conversion events and test', response: 'Do before paid ads or serious marketing pushes.' },
  { id: 'WEB-016', board: 'roadmap', category: 'performance', title: 'Performance and speed audit', description: 'Check loading times, Lighthouse, image sizes, fonts, caching, unnecessary requests and mobile performance.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev'], status: 'open', area: 'Entire website', sourceContext: 'Launch QA', dependencies: 'Performance tools', nextActionText: 'Run Lighthouse + image audit', response: 'Important for UX, SEO and conversion.' },
  { id: 'WEB-017', board: 'roadmap', category: 'seo', title: 'SEO basics audit', description: 'Check titles, meta descriptions, H1s, canonicals, sitemap, robots.txt, OpenGraph, structured data and slugs.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'All indexable pages', sourceContext: 'Launch QA', dependencies: 'Search Console / site crawl', nextActionText: 'Create SEO issue list', response: 'Useful before Google indexes suboptimal pages.' },
  { id: 'WEB-018', board: 'roadmap', category: 'design', title: 'Mobile QA', description: 'Manually test every important page on mobile: layout, menus, CTAs, checkout, forms, text overflow and image cropping.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'Entire website', sourceContext: 'Launch QA', dependencies: 'Mobile devices', nextActionText: 'Run mobile test on real phones', response: 'Mobile likely matters most for customers.' },
  { id: 'WEB-019', board: 'roadmap', category: 'content', title: 'Fix online course communication', description: 'Clarify whether online courses are available or coming soon. Banner and menu must not contradict each other.', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', area: 'Home banner, Navigation, Online course section', sourceContext: 'Website audit', dependencies: 'Business decision', nextActionText: 'Choose final wording', response: 'Avoid promoting unavailable products as available.' },
  { id: 'WEB-020', board: 'roadmap', category: 'content', title: 'Finish or hide Help / FAQ page', description: 'The Help page should either contain useful answers or be removed from navigation/footer until ready.', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', area: 'Help page', sourceContext: 'Website audit', dependencies: 'Content draft', nextActionText: 'Decide: finish or hide', response: 'Empty help pages reduce trust.' },
  { id: 'WEB-021', board: 'roadmap', category: 'bug', title: 'Check footer and social links', description: 'Manually test Instagram, Facebook, LinkedIn and all footer links. Fix suspicious/wrong URLs.', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', area: 'Footer / Social links', sourceContext: 'Website audit', dependencies: 'Manual link test', nextActionText: 'Click all links', response: 'Check if Facebook link is correct.' },
  { id: 'WEB-022', board: 'roadmap', category: 'seo', title: 'Fix image alt text and names', description: 'Correct misspelled names or irrelevant alt text such as David Heider / Marcel Rauminger if present.', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', area: 'Home / Image assets', sourceContext: 'Website audit', dependencies: 'CMS access', nextActionText: 'Review image metadata', response: 'Relevant for accessibility and brand quality.' },
  { id: 'WEB-023', board: 'roadmap', category: 'dashboard', title: 'Self-service creation of new workshop types and special workshops', description: 'David/Marcel need to be able to create one-off partner workshops and new workshop types without code changes, including title, date, location, capacity, price, description, images, FAQ, booking/checkout and automated emails.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'Dashboard / Payload CMS / Workshop booking flow', sourceContext: 'Operational need: recurring special workshops with partners', dependencies: 'CMS model, Stripe/checkout logic, Brevo email triggers', nextActionText: 'Define minimum required fields and ask Rafaela for implementation estimate', response: 'One of the most important operational features. Superseded/expanded by WEB-039 (Flexible workshop/event creation workflow) — see that item for the full architecture writeup, including the still-missing dedicated public page template for special workshops.', related: 'WEB-039' },
  { id: 'WEB-024', board: 'roadmap', category: 'dashboard', title: 'Workshop booking overview in dashboard', description: 'Show bookings clearly in the dashboard: name, date, product/workshop, payment status, email status, notes.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev'], status: 'done', area: 'Dashboard', sourceContext: 'Operational workflow', dependencies: 'Booking data model', nextActionText: 'Define required fields', response: 'Important for day-to-day operations.' },
  { id: 'WEB-025', board: 'roadmap', category: 'dashboard', title: 'Individual voucher personalization', description: 'Allow customer name, recipient name, message or voucher design customization if feasible.', priority: 'should', businessValue: 'medium', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'Voucher checkout / PDF / email', sourceContext: 'Gift conversion', dependencies: 'Voucher logic', nextActionText: 'Clarify scope', response: 'Not urgent, but valuable before gift seasons.' },
  { id: 'WEB-026', board: 'roadmap', category: 'crm', title: 'Transactional email audit', description: 'Check all automated emails: booking confirmation, invoice, voucher delivery, reminder, cancellation/reschedule if needed.', priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'Brevo / Stripe / Website', sourceContext: 'Customer experience', dependencies: 'Brevo templates', nextActionText: 'Map all triggers and templates', response: 'Customer communication must be reliable.' },
  { id: 'WEB-027', board: 'roadmap', category: 'org', title: 'Backup strategy', description: 'Clarify automatic backups for MongoDB, R2 assets, code, CMS content and recovery process.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['dev'], status: 'open', area: 'MongoDB, R2, GitHub, Vercel', sourceContext: 'Business continuity', dependencies: 'System access', nextActionText: 'Document backup and restore process', response: 'Critical if data or content gets lost.' },
  { id: 'WEB-028', board: 'roadmap', category: 'org', title: 'Rollback / deployment recovery process', description: 'Document how to rollback if a deployment breaks the website.', priority: 'must', businessValue: 'critical', effort: 'S', owners: ['dev'], status: 'open', area: 'Vercel / GitHub', sourceContext: 'Business continuity', dependencies: 'Deployment access', nextActionText: 'Document rollback steps', response: 'Important for live operations.' },
  { id: 'WEB-029', board: 'roadmap', category: 'security', title: 'Access rights and 2FA audit', description: 'Check admin rights, least privilege, two-factor authentication and backup admins for all critical systems.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', area: 'All production systems', sourceContext: 'Security / operations', dependencies: 'All account access', nextActionText: 'Create access matrix', response: 'At least David and Marcel should not be locked out.' },
  { id: 'WEB-030', board: 'roadmap', category: 'future', title: 'Knowledge hub / blog roadmap', description: 'Plan future content structure for fermentation knowledge, recipes and SEO without overloading current launch phase.', priority: 'nice', businessValue: 'medium', effort: 'M', owners: ['admin'], status: 'future', area: 'Future content section', sourceContext: 'Content strategy', dependencies: 'Stable website foundation', nextActionText: 'Define content pillars later', response: 'Strong SEO potential, but not urgent.' },
  { id: 'WEB-031', board: 'roadmap', category: 'future', title: 'Online course platform', description: 'Online courses directly on the website.', priority: 'nice', businessValue: 'high', effort: 'L', owners: ['admin', 'dev'], status: 'future', area: 'Future online courses', sourceContext: 'Long-term product strategy', dependencies: 'Business model clarity', nextActionText: 'Park for later', response: 'Avoid building too early before product/content is ready.' },
  { id: 'WEB-032', board: 'roadmap', category: 'future', title: 'B2B order area', description: 'Long-term idea: gastronomy customers can order products directly via a B2B area.', priority: 'nice', businessValue: 'high', effort: 'L', owners: ['admin', 'dev'], status: 'future', area: 'Future B2B platform', sourceContext: 'B2B scale', dependencies: 'B2B demand', nextActionText: 'Park for later', response: 'Useful once recurring B2B sales grow.' },
  { id: 'WEB-033', board: 'roadmap', category: 'dashboard', title: 'Cancellation workshop / bookings', folderLabel: 'Refund & Cancellation Architecture', description: "It needs to be possible to cancel workshop and customers get an automated email e.g that workshop is cancelled due to certain reasons. We need to be able to cancel workshop bookings from customers.", priority: 'must', businessValue: 'critical', effort: 'M', owners: ['admin', 'dev'], status: 'open', response: 'Broken out into WEB-035 through WEB-038 (per-case detail) — see New Features tab.', related: 'WEB-035' },
  { id: 'WEB-034', board: 'roadmap', category: 'org', title: 'Password management', description: 'We need to centralize organizational passwords.', priority: 'must', businessValue: 'critical', effort: 'S', owners: ['admin'], status: 'open' },
  { id: 'WEB-035', board: 'roadmap', category: 'dashboard', title: 'Full workshop date cancellation and rebooking flow', description: 'Allow David/Marcel to cancel a full workshop date from the dashboard, notify all affected participants via Brevo and offer rebooking/credit/refund options without developer support.', priority: 'must', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'open', area: 'Workshop dashboard, bookings, Stripe, Brevo', sourceContext: 'Operational use case: Fermentfreude cancels full workshop date', dependencies: 'Booking model, Stripe payments, Brevo templates, cancellation policy', nextActionText: 'Discuss best architecture: rebooking code, internal credit, magic link or hybrid', response: 'See New Features tab for full case detail (Case 1) and the proposed unified flow.', related: 'WEB-037', parentId: 'WEB-033' },
  { id: 'WEB-036', board: 'roadmap', category: 'dashboard', title: 'Individual customer rebooking flow', description: 'Allow a single customer to move an already paid workshop booking to another available date, either by admin action or later through customer self-service.', priority: 'must', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'open', area: 'Workshop dashboard, user account, bookings', sourceContext: 'Operational use case: customer cannot attend booked date', dependencies: 'Booking model, user accounts, Brevo, capacity logic', nextActionText: 'Define MVP: admin rebooking first; assess self-service options', response: 'See New Features tab for full case detail (Case 2).', related: 'WEB-035', parentId: 'WEB-033' },
  { id: 'WEB-037', board: 'roadmap', category: 'dashboard', title: 'Customer cancellation with refund or credit', description: 'Allow David/Marcel to cancel an individual paid booking and handle the outcome as refund via Stripe, credit/voucher, rebooking or no refund according to our cancellation policy.', priority: 'must', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'open', area: 'Workshop dashboard, Stripe, Brevo, voucher/credit logic', sourceContext: 'Operational use case: customer cancels participation', dependencies: 'Stripe refund API, AGB/cancellation policy, Brevo templates', nextActionText: 'Discuss safest refund/credit workflow and admin confirmation process', response: 'David flagged this as one of the two most urgent new features (alongside WEB-039). See New Features tab for full case detail (Case 3) and docs/FermentFreude_Refund_Cancellation_Plan.pdf for the proposed mechanism.', related: 'WEB-035', parentId: 'WEB-033' },
  { id: 'WEB-038', board: 'roadmap', category: 'dashboard', title: 'Partial cancellation of multi-seat bookings', description: 'Support partial cancellation, refund, credit or rebooking when a customer booked multiple seats but only one or some participants cancel.', priority: 'must', businessValue: 'high', effort: 'L', owners: ['dev', 'admin'], status: 'open', area: 'Workshop bookings, capacity, Stripe, Brevo', sourceContext: 'Operational use case: multi-seat bookings with partial cancellation', dependencies: 'Booking data model, seat quantity/status logic, refund/credit handling', nextActionText: 'Assess whether booking model should be seat-based or quantity-based', response: 'See New Features tab for full case detail (Case 4).', related: 'WEB-037', parentId: 'WEB-033' },
  { id: 'WEB-039', board: 'roadmap', category: 'dashboard', title: 'Flexible workshop/event creation workflow', folderLabel: 'Special Workshop Template', description: 'Make the existing product + appointment workflow reliable and fully self-service so David/Marcel can create new workshop types, special events and partner workshops without code changes.', priority: 'must', businessValue: 'critical', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'Dashboard, workshop pages, booking system, Stripe, Brevo', sourceContext: 'Operational use case: create new partner/special workshop', dependencies: 'Current product + appointment model, website lists, Brevo, Stripe', nextActionText: 'Review existing workflow and identify what is missing for reliable self-service publishing', response: "David flagged this as one of the two most urgent new features (alongside WEB-037). Specifically needs: a dedicated public page template that automatically renders a newly created special/partner workshop product with the same UI/UX as the existing workshop pages (Lakto/Kombucha/Tempeh) — this is currently missing and is the main gap. See New Features tab for full architecture writeup.", related: 'WEB-023' },
  { id: 'WEB-040', board: 'roadmap', category: 'content', title: 'Press, media and awards section', description: 'Add a scalable Press & Media area for articles, TV appearances, awards, events and recognitions, ideally with CMS editing and a small homepage trust section.', priority: 'should', businessValue: 'high', effort: 'M', owners: ['dev', 'admin'], status: 'open', area: 'About page, homepage, footer, CMS', sourceContext: 'Fermentfreude increasingly appears in media and wins recognition', dependencies: 'CMS structure, navigation space, design', nextActionText: 'Decide location: About subpage, dedicated page, homepage teaser or combination', response: 'See New Features tab for placement options (A/B/C).' },
  { id: 'WEB-041', board: 'roadmap', category: 'dashboard', title: 'Dynamic voucher value on PDF vouchers', description: 'Show the actual voucher value on downloadable PDF vouchers, especially for custom value vouchers like €20 goodwill vouchers or partner vouchers.', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['dev', 'admin'], status: 'open', area: 'Voucher system, PDF voucher, Brevo', sourceContext: 'Voucher value currently appears in email but not on PDF', dependencies: 'Voucher value field, PDF template, Brevo variables', nextActionText: 'Check if PDF template can pull dynamic voucher value from voucher record', response: 'Confirmed bug: src/app/api/voucher/generate-pdf/route.ts only overlays the code onto a static template — the euro amount shown is baked into the template artwork, not read from the real voucher value. Contained fix.' },
  { id: 'WEB-042', board: 'roadmap', category: 'dashboard', title: 'Discount codes and special pricing', description: 'Support future pricing options for workshops such as early bird, student price, partner discount, promo codes or special campaigns.', priority: 'should', businessValue: 'high', effort: 'L', owners: ['dev', 'admin'], status: 'open', area: 'Workshop checkout, Stripe, dashboard, analytics', sourceContext: 'Future feature discussed during workshop/event architecture', dependencies: 'Stripe price logic, coupon logic, invoices, analytics', nextActionText: 'Keep in roadmap; define price use cases before implementation' },
  { id: 'WEB-043', board: 'roadmap', category: 'future', title: 'Multi-session workshop or course series', description: 'Support future course formats where one booking includes multiple dates, e.g. a 3-part fermentation course or structured workshop series.', priority: 'nice', businessValue: 'medium', effort: 'L', owners: ['dev', 'admin'], status: 'future', area: 'Workshop booking system, calendar, Brevo', sourceContext: 'Future workshop/course format', dependencies: 'Booking model, reminder emails, cancellation logic', nextActionText: 'Keep architecture flexible enough for multi-date bookings later' },
  { id: 'WEB-044', board: 'roadmap', category: 'future', title: 'Online workshop variant with Google Meet link', description: 'Allow online workshops to use the same core booking system, but with online location, Google Meet link and online-specific Brevo emails/reminders.', priority: 'should', businessValue: 'medium', effort: 'M', owners: ['dev', 'admin'], status: 'future', area: 'Workshop creation, Brevo, Google Meet', sourceContext: 'Future online workshop format', dependencies: 'Brevo dynamic fields, meeting link generation/manual field', nextActionText: 'Assess whether online workshops can be handled as a normal workshop type with an online location' },
  { id: 'WEB-045', board: 'roadmap', category: 'dashboard', title: 'Related booking exceptions to consider', description: 'Keep additional booking exceptions in mind when improving the booking architecture: payment successful but booking/email failed, wrong workshop/date booked, underbooked workshop cancellation, no-show status, refund status tracking, waitlist.', priority: 'should', businessValue: 'high', effort: 'Unknown', owners: ['dev', 'admin'], status: 'open', area: 'Booking dashboard, Stripe, Brevo, capacity logic', sourceContext: 'Architecture note from operational use case discussion', dependencies: 'Booking status model, payment/email error handling, waitlist logic', nextActionText: 'Do not build everything now, but avoid architecture that blocks these cases later' },
]

// ─────────────────────────────────────────────────────────────────
// NEW FEATURES — expanded from David's operational use-case brief (2026-07-09/11)
// ─────────────────────────────────────────────────────────────────
const FEATURES: SeedItem[] = [
  {
    id: 'FEAT-01', board: 'features', category: 'dashboard', related: 'WEB-035',
    title: 'Case 1: Full workshop date cancelled by Fermentfreude',
    priority: 'critical', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'open',
    description: 'A workshop date has confirmed paid bookings (e.g. 10 participants) but Fermentfreude cannot run it — illness, scheduling conflict, too few participants. Need to inform all affected customers automatically, keep their payment valid, and offer rebooking/credit/refund without manual handling. Default should encourage rebooking over refunds, but Fermentfreude must still be able to handle refunds manually.',
    response: 'Must-have regardless of approach: cancel date in dashboard with reason + internal note, identify all affected paid bookings, notify via Brevo, keep payments linked, show rebooking status, allow manual admin rebooking as fallback. Should-have: customer self-service rebooking via code, credit, magic link or account. See the decision below for which mechanism.',
    decision: {
      question: 'Cleanest architecture for a cancelled workshop date with paid participants: rebooking code, internal credit, magic link, manual admin flow, or a combination?',
      choice: null, notes: '',
      options: {
        'unified-credit-link': { label: 'One booking credit + magic link, admin fallback', recommended: true, desc: 'Reuse the existing gift-voucher system as the credit mechanism, wrapped in a personal magic link so customers don’t need to enter a code. Fastest to build well, most reuse of working code. Admin manual rebooking always available as fallback.' },
        'rebooking-code': { label: 'Rebooking code only', desc: 'Each affected customer gets an individual code to use instead of paying again. Works without an account, but code misuse/duplicate use must be prevented.' },
        'internal-credit-account': { label: 'Account-based internal credit only', desc: 'Cleaner long-term if customer accounts become central, but guest bookings (most of today’s volume) need careful handling.' },
        'admin-only': { label: 'Manual admin flow only (MVP)', desc: 'David/Marcel move affected customers manually. Safe fallback, but not scalable and doesn’t reduce support workload.' },
      },
    },
  },
  {
    id: 'FEAT-02', board: 'features', category: 'dashboard', related: 'WEB-036',
    title: 'Case 2: Individual customer rebooking',
    priority: 'critical', businessValue: 'critical', effort: 'M', owners: ['dev', 'admin'], status: 'open',
    description: 'The workshop still runs, but one customer can’t attend. Their paid booking needs to move to another available date — via admin action always, and ideally via customer self-service too (no account required for guest bookings).',
    response: 'Admin rebooking (open booking, pick new date, release old seat, reserve new seat, keep payment linked, add internal note, optional Brevo confirmation) should be built regardless of which self-service option is chosen. Suggested MVP rules: rebooking allowed only until a deadline before the workshop, only if seats available, same price only for self-service, one self-rebook per booking, admin override always possible.',
    decision: {
      question: 'Safest self-service rebooking mechanism: user account, magic link, rebooking code, or manual request only?',
      choice: null, notes: '',
      options: {
        'magic-link': { label: 'Magic rebooking link in confirmation email', recommended: true, desc: 'No account required, smooth UX, fewer support emails. Needs link security/expiry rules and handling for forwarded emails.' },
        'rebooking-code': { label: 'Rebooking code entered at checkout', desc: 'Similar to voucher/coupon logic, understandable fallback, but slightly more friction than a link.' },
        'account': { label: 'User-account based rebooking', desc: 'Clean long-term if most customers have accounts, but many bookings today are guest checkouts.' },
        'manual-request': { label: 'Manual request only (MVP)', desc: 'Customer emails, admin moves the booking. Easiest MVP, but doesn’t reduce support load as volume grows.' },
      },
    },
  },
  {
    id: 'FEAT-03', board: 'features', category: 'dashboard', related: 'WEB-037',
    title: 'Case 3: Customer cancellation with refund or credit',
    priority: 'critical', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'open',
    description: 'A customer wants to cancel entirely (workshop still happens for others). Depending on the cancellation policy, they may get a full refund, partial refund, credit, or nothing. Need a dashboard flow covering all outcomes, with Stripe/Brevo kept in sync and everything traceable.',
    response: 'David flagged this as one of the two most urgent new features right now. Dashboard must show: booking/payment/cancellation/refund status, refund amount, credit amount, who triggered it, when, and email notification status — regardless of automation level. See docs/FermentFreude_Refund_Cancellation_Plan.pdf for the full proposed mechanism and the A/B/C cancellation-policy tiers.',
    decision: {
      question: 'How automated should the refund be: full Stripe automation, semi-automated (system suggests, admin confirms), or fully manual?',
      choice: null, notes: '',
      options: {
        'semi-auto': { label: 'System suggests, admin confirms', recommended: true, desc: 'Dashboard calculates a suggested refund per policy (e.g. "cancelled 10 days out → suggested refund 50%"); nothing touches Stripe until David/Marcel confirm. Safer than full automation, still cuts manual work.' },
        'manual': { label: 'Fully manual (MVP)', desc: 'Dashboard just records the decision — refund, credit, or nothing — amount entered by hand each time. Lower risk of mistaken refunds, but doesn’t scale.' },
        'auto': { label: 'Fully automatic', desc: 'System applies the policy and fires the Stripe refund with no human in the loop. Fastest, but this would be the first-ever automated refund in the system — highest risk if the policy logic has an edge case.' },
      },
    },
  },
  {
    id: 'FEAT-04', board: 'features', category: 'dashboard', related: 'WEB-038',
    title: 'Case 4: Partial cancellation of multi-seat bookings',
    priority: 'must', businessValue: 'high', effort: 'L', owners: ['dev', 'admin'], status: 'open',
    description: 'Customers often book 2-3 seats for friends/family. If one person cancels, only that seat should be cancelled/refunded/credited/rebooked — the rest of the group should stay booked. Today a booking is one flat quantity with no per-seat status, so this isn’t possible without cancelling the whole thing.',
    response: 'Must-have regardless of approach: the remaining participants must stay booked, cancelled seats must be released or marked correctly, refund/credit/rebooking status must be traceable, Stripe and Brevo must stay consistent, admin override always possible.',
    decision: {
      question: 'Booking data model for partial cancellation: seat-based records, quantity-based adjustment, or admin-only MVP first?',
      choice: null, notes: '',
      options: {
        'seat-based': { label: 'Seat-based booking model', recommended: true, desc: 'Each seat gets its own status (active/cancelled/rebooked/credited/refunded/no-show). Most flexible, becomes the shared foundation for Cases 1-4, but is real schema work.' },
        'quantity-based': { label: 'Quantity-based adjustment', desc: 'Booking stays one record with a quantity field that can be reduced, logging refund/credit/rebooking actions separately. Simpler now, less flexible if per-participant history matters later.' },
        'admin-only-mvp': { label: 'Admin-only MVP first', desc: 'Only David/Marcel can perform partial cancellations from the dashboard at first; customers can’t self-serve yet. Pragmatic starting point regardless of which data model is chosen underneath.' },
      },
    },
  },
  {
    id: 'FEAT-05', board: 'features', category: 'dashboard', related: 'WEB-039',
    title: 'Case 5: Flexible workshop/event creation workflow',
    priority: 'critical', businessValue: 'critical', effort: 'L', owners: ['dev', 'admin'], status: 'partial',
    description: 'David/Marcel need to create new workshop types, partner workshops or one-off special events from the dashboard, with no code changes — and the workshop should automatically appear in the right website sections, be bookable, and connect to Stripe and Brevo like any regular workshop.',
    response: 'David flagged this as one of the two most urgent items right now — specifically the missing piece: a dedicated public page template that automatically renders a newly created special/partner workshop using the exact same UI/UX as the existing workshop pages (Lakto, Kombucha, Tempeh). The product + appointment creation flow already works (see WEB-023, done) — the gap is that a new workshop product doesn’t yet get its own public-facing page automatically. Needs a dynamic workshop detail route that pulls from the product/workshop record rather than hand-built pages per workshop, plus visibility states (draft/published/hidden/archived/sold out/cancelled) and clear documentation of what "product" vs "appointment" each control. This needs to be scoped and planned properly as its own piece of work — flagged as extra/critical, not a quick add-on. Code audit (2026-07-11) confirmed why this is real work, not a quick fix: workshops/[slug]/page.tsx already routes all three pages through one file, but internally it is three separate if(slug===...) branches, each rendering its own hand-built components (LaktoHero, TempehHero, KombuchaHero, etc.) — there is no shared, data-driven template today. The Product.workshopRef relationship field exists but is dead code (never read anywhere); the real Product-Workshop link is a fragile slug.startsWith("workshop-") string convention.',
    decision: {
      question: 'How should the special-workshop page actually get built: one real generic template, or another hardcoded branch?',
      choice: null,
      notes: '',
      options: {
        'generic-template': {
          label: 'Build one generic, data-driven template',
          recommended: true,
          desc: 'Replace the three if(slug===...) branches in workshops/[slug]/page.tsx with one template that Lakto/Kombucha/Tempeh and every future special workshop render through, driven by the existing workshopDetailFields content. More upfront work (touches all 3 live pages), but it\'s the only approach that actually removes the developer from publishing workshop #5, #6 — cloning a branch again just recreates today\'s problem one workshop later.',
        },
        'clone-branch': {
          label: 'Clone an existing branch for the first special workshop',
          desc: 'Hand-write a 4th if(slug===\'new-slug\') branch reusing e.g. Lakto\'s components. Ships the first special workshop faster, but every workshop after that still needs a developer — doesn\'t solve what Case 5 is actually asking for.',
        },
        'defer': {
          label: 'Defer for now',
          desc: 'Keep publishing new workshops through hand-written, ~25-30KB one-off seed scripts per workshop (current state) until this gets prioritized.',
        },
      },
    },
  },
  {
    id: 'FEAT-06', board: 'features', category: 'content', related: 'WEB-040',
    title: 'Case 6: Press, Media & Awards section',
    priority: 'should', businessValue: 'high', effort: 'M', owners: ['dev', 'admin'], status: 'open',
    description: 'Fermentfreude increasingly appears in media, events and awards. Needs a CMS-based Press/Media section David/Marcel can manage themselves — articles, TV appearances, awards, links — to build trust and credibility with customers, B2B partners and journalists.',
    response: 'Recommended placement: subpage under About ("About → Press & Media") plus a small homepage trust-strip teaser ("As seen in") linking to the full page. Clean, additive CMS work, no conflicts with the rest of the system.',
  },
  {
    id: 'FEAT-07', board: 'features', category: 'dashboard', related: 'WEB-041',
    title: 'Mini-Case 7: Dynamic voucher value on PDF vouchers',
    priority: 'should', businessValue: 'medium', effort: 'S', owners: ['dev'], status: 'open',
    description: "Vouchers can be issued for any value (€20, €50, €99...) and the email shows it correctly, but the PDF always shows a fixed placeholder amount regardless of the real value purchased.",
    response: 'Confirmed, contained bug — see WEB-041 on the Main Roadmap tab. The PDF generator only stamps the code onto a static template; the euro amount is baked into the template artwork, not read from the voucher record.',
  },
  {
    id: 'FEAT-08', board: 'features', category: 'future', related: 'WEB-042',
    title: 'Future Case 8: Discounts & special pricing',
    priority: 'nice', businessValue: 'high', effort: 'L', owners: ['dev', 'admin'], status: 'future',
    description: 'Early bird, student, partner or promo-code pricing for workshops. Not urgent, but checkout/pricing should be built so this doesn’t require a rebuild later.',
    response: 'Parked. Price is calculated in one place at booking time today — a future discount layer should plug into that single spot rather than scattering pricing logic. Revisit when there’s an actual campaign to run.',
  },
  {
    id: 'FEAT-09', board: 'features', category: 'future', related: 'WEB-043',
    title: 'Future Case 9: Multi-session workshops / course series',
    priority: 'nice', businessValue: 'medium', effort: 'L', owners: ['dev', 'admin'], status: 'future',
    description: 'A course where one booking covers multiple dates (e.g. a 3-part fermentation course), instead of today’s one-booking-per-date model.',
    response: 'Parked. Being kept in mind while doing the Case 1-4 foundation work so the booking model doesn’t get hard-coded any deeper into "one booking = one date" than it already is.',
  },
  {
    id: 'FEAT-10', board: 'features', category: 'future', related: 'WEB-044',
    title: 'Online workshop variant with Google Meet link',
    priority: 'should', businessValue: 'medium', effort: 'M', owners: ['dev', 'admin'], status: 'future',
    description: 'Online workshops using the same core booking system, but with an online location, Google Meet link, and online-specific Brevo emails/reminders.',
    response: 'Likely handleable as a normal workshop type with an "online" location value — main new pieces are the Meet link field and reminder email variant. Assess once Case 5 (flexible workshop creation) is further along.',
  },
  {
    id: 'FEAT-11', board: 'features', category: 'dashboard', related: 'WEB-045',
    title: 'Booking edge cases to keep in mind',
    priority: 'should', businessValue: 'high', effort: 'Unknown', owners: ['dev'], status: 'future',
    description: 'Payment succeeds but booking/email fails, customer booked the wrong date, no-shows, refund status tracking (initiated/pending/failed/completed), waitlists when a sold-out workshop frees up a seat.',
    response: 'None of these need a full feature now. Flagged so the Case 1-4 foundation work doesn’t accidentally block building them later.',
  },
  {
    id: 'FEAT-12', board: 'features', category: 'dashboard', related: 'WEB-025',
    title: 'Individual voucher personalization',
    priority: 'should', businessValue: 'medium', effort: 'M', owners: ['dev', 'admin'], status: 'open',
    description: 'Allow customer name, recipient name, message or voucher design customization if feasible.',
    response: 'Not urgent, but valuable before gift seasons (Christmas, Valentine’s).',
  },
  {
    id: 'FEAT-13', board: 'features', category: 'future', related: 'WEB-030',
    title: 'Knowledge hub / blog',
    priority: 'nice', businessValue: 'medium', effort: 'M', owners: ['admin'], status: 'future',
    description: 'Fermentation knowledge, recipes and SEO content — strong long-term SEO potential.',
    response: 'Parked. Define content pillars once the rest of the site is stable.',
  },
  {
    id: 'FEAT-14', board: 'features', category: 'future', related: 'WEB-032',
    title: 'B2B order area',
    priority: 'nice', businessValue: 'high', effort: 'L', owners: ['admin', 'dev'], status: 'future',
    description: 'Gastronomy customers order products directly via a dedicated B2B area.',
    response: 'Parked. Useful once recurring B2B sales grow to real volume.',
  },
]

// ─────────────────────────────────────────────────────────────────
// BACKLOG — bugs, small fixes, maintenance (kept separate from big feature builds)
// ─────────────────────────────────────────────────────────────────
const BACKLOG: SeedItem[] = [
  { id: 'WEB-004-B', board: 'backlog', category: 'bug', related: 'WEB-004', title: 'Full route QA and stability check', priority: 'must', businessValue: 'critical', effort: 'Unknown', owners: ['dev'], status: 'open', description: '404s, broken redirects, wrong language, maintenance screens across the whole site — see WEB-004 on Main Roadmap for full context.' },
  { id: 'WEB-005-B', board: 'backlog', category: 'bug', related: 'WEB-005', title: 'Remove placeholder phone number', priority: 'must', businessValue: 'high', effort: 'S', owners: ['admin', 'dev'], status: 'open', description: 'Replace +43 664 1234567 with the real Fermentfreude number everywhere.' },
  { id: 'WEB-006-B', board: 'backlog', category: 'bug', related: 'WEB-006', title: "Verify 'Edit page in Admin' text is gone everywhere", priority: 'should', businessValue: 'high', effort: 'S', owners: ['dev'], status: 'partial', description: 'Already fixed on gastronomy/fermentation pages — sweep the rest of the site to confirm no other page still shows this.' },
  { id: 'WEB-011-B', board: 'backlog', category: 'bug', related: 'WEB-011', title: 'Fix newsletter signup block', priority: 'must', businessValue: 'high', effort: 'S', owners: ['dev', 'admin'], status: 'open', description: 'Confirm the form is visible, connected to Brevo, double opt-in works, and signup event is tracked.' },
  { id: 'WEB-012-B', board: 'backlog', category: 'bug', related: 'WEB-012', title: 'Sweep for remaining shop template remnants', priority: 'should', businessValue: 'high', effort: 'S', owners: ['dev'], status: 'partial', description: '"Payload Ecommerce Template" text already fixed in metadata — check for any remaining template defaults in shop/product UI.' },
  { id: 'WEB-021-B', board: 'backlog', category: 'bug', related: 'WEB-021', title: 'Check footer and social links', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', description: 'Click-test Instagram, Facebook, LinkedIn and all footer links; fix wrong URLs (Facebook link especially).' },
  { id: 'WEB-022-B', board: 'backlog', category: 'bug', related: 'WEB-022', title: 'Fix image alt text and names', priority: 'should', businessValue: 'medium', effort: 'S', owners: ['admin', 'dev'], status: 'open', description: 'Correct misspelled names / irrelevant alt text on homepage and other image assets.' },
  { id: 'WEB-034-B', board: 'backlog', category: 'org', related: 'WEB-034', title: 'Centralize organizational passwords', priority: 'must', businessValue: 'critical', effort: 'S', owners: ['admin'], status: 'open', description: 'Set up a shared password manager for the team instead of scattered/personal storage.' },
  { id: 'DEV-01', board: 'backlog', category: 'bug', title: 'Partial voucher redemption has no working payment path', priority: 'must', businessValue: 'high', effort: 'M', owners: ['dev'], status: 'open', description: "When a voucher only partially covers the cart, checkout has no working path today — the intended flow (apply partial discount, then normal Stripe payment for the remainder) isn't fully wired up. Found during code audit, not yet on the official roadmap sheet.", area: 'src/app/api/voucher/redeem, checkout flow', response: 'See docs/FermentFreude_UserFlow_Diagrams.pdf, Flow 3, for the full diagram of what exists vs. what’s missing.' },
]

const ALL: SeedItem[] = [...ROADMAP, ...FEATURES, ...BACKLOG]

async function run() {
  const force = process.argv.includes('--force')
  const payload = await getPayload({ config })
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  const existing = await payload.find({ collection: 'backlog-items', limit: 1, depth: 0 })
  if (existing.totalDocs > 0 && !force) {
    console.log(`⏭️  Backlog already has ${existing.totalDocs}+ item(s). Skipping. Use --force to overwrite.`)
    return
  }

  if (force && existing.totalDocs > 0) {
    console.log('🔄 --force: deleting existing backlog items')
    const all = await payload.find({ collection: 'backlog-items', limit: 500, depth: 0 })
    for (const doc of all.docs) {
      await payload.delete({ collection: 'backlog-items', id: doc.id, context: ctx })
    }
  }

  // ROADMAP is seeded before FEATURES/BACKLOG (see ALL above), so by the time a
  // FEAT-* or WEB-0xx-B item is created, its roadmap counterpart's real doc id is
  // already known — `related` (e.g. 'WEB-035') resolves into a genuine `parent`
  // relationship instead of staying a free-text-only pointer.
  const docIdByItemId: Record<string, string> = {}
  for (const item of ALL) {
    const { id: itemId, ...rest } = item
    const billingScope = item.billingScope || 'included'
    // Explicit parentId always wins. Otherwise, only feature/backlog items auto-resolve
    // `related` into a real parent — a roadmap item's `related` to another roadmap item
    // is a peer cross-reference (e.g. "superseded by"), not hierarchy.
    const parentKey = item.parentId || (item.board !== 'roadmap' ? item.related : undefined)
    const parent = parentKey && docIdByItemId[parentKey] ? docIdByItemId[parentKey] : undefined
    const created = await payload.create({
      collection: 'backlog-items',
      data: { itemId, notes: '', ...rest, billingScope, ...(parent ? { parent } : {}) },
      context: ctx,
    })
    docIdByItemId[itemId] = created.id
    console.log(`✓ ${itemId} — ${item.title}${parent ? ` (child of ${parentKey})` : ''}`)
  }

  console.log(`\n✅ Seeded ${ALL.length} backlog items (${ROADMAP.length} roadmap, ${FEATURES.length} features, ${BACKLOG.length} backlog).`)
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
