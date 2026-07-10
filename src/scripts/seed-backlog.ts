/**
 * Seed the internal team Backlog board (BacklogItems collection).
 *
 * Non-destructive by default — skips if items already exist.
 * Run: pnpm seed backlog          # skips if items already exist
 *      pnpm seed backlog --force  # deletes existing items and reseeds
 */
import type { BacklogItem } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type SeedItem = {
  id: string
  title: string
  category: BacklogItem['category']
  priority: BacklogItem['priority']
  status: BacklogItem['status']
  effort: BacklogItem['effort']
  owners: NonNullable<BacklogItem['owners']>
  slug?: string
  related?: string
  description?: string
  response?: string
  notes?: string
  decision?: {
    question: string
    choice: string | null
    notes: string
    options: Record<string, { label: string; desc: string; recommended?: boolean }>
  }
}

const SEED: SeedItem[] = [
  { id: 'WEB-001', title: 'Transfer ownership of production systems to FermentFreude', category: 'org', priority: 'critical', status: 'open', effort: 'M', owners: ['dev', 'david'], description: "Move MongoDB Atlas and Cloudflare R2 from Rafaela's personal account to FermentFreude ownership. Stripe, Brevo, domain, and Vercel are already correctly set up.", response: "Almost everything was set up under FermentFreude from day one. Stripe, Brevo, and the domain are already theirs. Two things need a quick account transfer: MongoDB Atlas and Cloudflare R2 are on Rafaela's personal account. Sorting this in the Wednesday morning meeting — about 10 minutes each." },
  { id: 'WEB-002', title: 'Document system architecture', category: 'org', priority: 'critical', status: 'done', effort: 'M', owners: ['dev'], description: 'Create a simple overview of all systems and how they work together: Next.js, Payload, Vercel, MongoDB, R2, Stripe, Brevo, GA4/GTM.', response: 'Done. 30+ documentation files exist covering every system. SYSTEM_OVERVIEW.html shows all systems, who owns what, and how a customer booking flows end to end. Ready to share.' },
  { id: 'WEB-003', title: 'Dashboard / CMS onboarding session for founders', category: 'org', priority: 'must', status: 'partial', effort: 'S', owners: ['dev', 'david', 'marcel'], description: 'Walk David and Marcel through the CMS: content edits, workshops, images, products, users, bookings, common mistakes to avoid.', response: 'Written guides already exist (booking system guide, Brevo operations guide, workshop setup guide, dashboard quick reference). The live walkthrough still needs to be scheduled. A recorded Google Meet session would be most useful so they can refer back to it.' },
  { id: 'WEB-004', title: 'Full route QA and stability check', category: 'bug', priority: 'critical', status: 'partial', effort: 'M', owners: ['dev', 'david', 'marcel'], description: 'Check all public routes for maintenance screens, timeout states, 404s, broken redirects, wrong language or inconsistent page states.', response: "Not yet done as a formal pass. Most useful when done together — David and Marcel know which routes matter most to customers and can flag language issues along the way. Developer checks for broken redirects, 404s, and maintenance screens in parallel." },
  { id: 'WEB-005', title: 'Remove placeholder phone number', category: 'content', priority: 'must', status: 'their-action', effort: 'XS', owners: ['david'], description: 'Replace placeholder phone number +43 664 1234567 with the correct Fermentfreude number everywhere on the site.', response: 'David can fix this directly in the admin — no developer needed. Go to /admin → Globals → Business Info → Phone. Update the number and save. Done.' },
  { id: 'WEB-006', title: 'Remove public "Edit page in Admin" button', category: 'bug', priority: 'must', status: 'done', effort: 'XS', owners: ['dev'], slug: 'gastronomy', description: 'The floating "Edit in Admin" button was showing for all public visitors on the Gastronomy and Fermentation pages.', response: '✓ Fixed and deployed. Removed EditPageLink from gastronomy/page.tsx and fermentation/page.tsx. Deployed to production via feature → staging → main.' },
  { id: 'WEB-007', title: 'Clean up German / English language mix', category: 'content', priority: 'must', status: 'partial', effort: 'M', owners: ['dev', 'david', 'alaa'], description: 'Ensure German pages are fully German and English pages are fully English. Remove template fragments — especially FAQ, voucher, create-account and workshop modules.', response: "Some mixing is in the CMS — David can fix directly in /admin by switching the language toggle. Some is in code. Most useful step: David and Ala'a go through the site on /de and /en and create a specific list of pages and sentences that are wrong. That list tells us exactly what to fix." },
  { id: 'WEB-008', title: 'Align cancellation and voucher terms', category: 'legal', priority: 'critical', status: 'their-action', effort: 'M', owners: ['david', 'dev'], description: 'Workshop pages, FAQ, voucher page and AGB must use the same cancellation and voucher validity rules. Current wording appears contradictory.', response: 'Business and legal decision, not technical. David needs to decide: what are the actual cancellation rules? What is the voucher validity period? Once the rules are written down clearly, Rafaela updates the text across AGB, FAQ, workshop pages, and voucher page.' },
  { id: 'WEB-009', title: 'Privacy policy and tracking setup audit', category: 'legal', priority: 'critical', status: 'their-action', effort: 'M', owners: ['david'], description: 'Check whether privacy policy, cookie consent and actual tracking tools match: GA4, GTM, Clarity, Meta Pixel if active.', response: 'GTM is integrated in code. All GA4 e-commerce events are implemented. The privacy policy text and which tools are declared in it is a legal question — needs external legal review by someone familiar with Austrian/EU data law. What tools David wants active (Clarity, Meta Pixel) is also David\'s decision.' },
  { id: 'WEB-010', title: 'Review health claims and probiotic wording', category: 'legal', priority: 'critical', status: 'their-action', effort: 'M', owners: ['david'], description: 'Check all health-related statements around probiotic, microbiome, immune system, digestion, gut-brain axis and balance wording.', response: 'Content and legal decision. EU food law restricts what can be claimed about health benefits of fermented foods. David should review with a food or legal expert. Once safe wording is agreed and written, Rafaela updates the text.' },
  { id: 'WEB-011', title: 'Newsletter form connected to Brevo', category: 'feature', priority: 'must', status: 'done', effort: 'S', owners: ['dev', 'david'], description: 'Check whether the newsletter form is visible, understandable, connected to Brevo and Double-Opt-in works. Legal aspect of using email addresses.', response: 'Done. The newsletter form is connected to Brevo via a dedicated API route. Signups go into Brevo automatically. Double-opt-in and list management are handled inside the Brevo dashboard. All newsletter subscribers visible in Brevo contacts list.' },
  { id: 'WEB-012', title: 'Fix shop template remnants ("Payload Ecommerce Template")', category: 'bug', priority: 'must', status: 'done', effort: 'XS', owners: ['dev'], slug: 'shop', description: 'Remove "Payload Ecommerce Template" and other template/default remnants from shop titles, metadata and UI.', response: '✓ Fixed and deployed. "Payload Ecommerce Template" was appearing in shop page titles and browser tabs. Replaced with "FermentFreude" across all shop and product page metadata.' },
  { id: 'WEB-013', title: 'Review product page information', category: 'content', priority: 'critical', status: 'their-action', effort: 'M', owners: ['david', 'dev'], slug: 'shop', description: 'Check product pages for consistent price formatting, shelf life, storage, quantity UI, product availability and mandatory food information.', response: 'Content review — David needs to verify that shelf life, storage instructions, quantity, and food labelling info are correct and complete for each product. All managed in the CMS under Products. David can update directly in /admin — no code change needed.' },
  { id: 'WEB-014', title: 'Workshop page QA', category: 'content', priority: 'must', status: 'partial', effort: 'M', owners: ['dev', 'david', 'alaa'], slug: 'workshops', description: 'Review all workshop pages for max participants, dates, FAQs, CTAs, pricing, cancellation text and language consistency.', response: "David and Ala'a go through each workshop page (Lakto, Kombucha, Tempeh, Basics) and check: correct dates, FAQs, pricing, cancellation text, language. Most content is in the CMS — David can fix directly. Code-level issues get flagged to Rafaela." },
  { id: 'WEB-015', title: 'Analytics and conversion tracking audit', category: 'performance', priority: 'critical', status: 'partial', effort: 'M', owners: ['david', 'dev'], description: 'Verify GA4, GTM and Clarity setup; confirm events for booking, voucher purchase, shop order, newsletter signup and contact form.', response: "Code side: done. GTM is integrated, all key GA4 e-commerce events are implemented — view item, add to cart, begin checkout, purchase, remove from cart. What lives inside the GTM container (GA4 tag, Clarity, Meta Pixel configuration) is David's responsibility via the GTM dashboard." },
  { id: 'WEB-016', title: 'Performance and speed audit', category: 'performance', priority: 'must', status: 'partial', effort: 'M', owners: ['dev', 'alaa'], description: 'Check loading times, Lighthouse, image sizes, fonts, caching, unnecessary requests and mobile performance.', response: 'Images are optimised through the CMS pipeline (WebP, resized on upload). A formal Lighthouse pass makes sense once the main content QA items are resolved — no point benchmarking a page that still has placeholder content or language issues.' },
  { id: 'WEB-017', title: 'SEO basics audit', category: 'content', priority: 'must', status: 'done', effort: 'M', owners: ['david', 'dev'], description: 'Check titles, meta descriptions, H1s, canonicals, sitemap, robots.txt, OpenGraph, structured data and slugs.', response: 'Infrastructure done: dynamic sitemap, robots.txt, OpenGraph meta tags, canonical URLs, Payload SEO plugin for per-page titles and descriptions. /admin and /api blocked from crawlers. Content-level SEO (writing good titles and descriptions) is done by David directly in /admin.' },
  { id: 'WEB-018', title: 'Mobile QA — test on real devices', category: 'design', priority: 'must', status: 'partial', effort: 'M', owners: ['alaa', 'david', 'dev'], description: 'Manually test every important page on mobile: layout, menus, CTAs, checkout, forms, text overflow and image cropping.', response: "Not done as a formal pass. Ala'a and David should test on real phones — both Android and iPhone. Browser emulation misses things real devices surface. Flag specific pages and issues; Rafaela fixes the code ones." },
  { id: 'WEB-019', title: 'Fix online course communication', category: 'content', priority: 'should', status: 'their-action', effort: 'XS', owners: ['david', 'dev'], description: 'Clarify whether online courses are available or coming soon. Banner and menu must not contradict each other.', response: "Business decision. Are online courses available now, or coming soon? Once David decides the message, the banner text and navigation get updated — most of this is in the CMS. If something is in code, it's a quick fix." },
  { id: 'WEB-020', title: 'Finish or hide Help / FAQ page', category: 'content', priority: 'should', status: 'their-action', effort: 'XS', owners: ['david', 'dev'], slug: 'faq', description: 'The Help page should either contain useful answers or be removed from navigation/footer until ready.', response: "Content decision. If the page isn't ready, hide it from navigation and footer until it has real answers — an empty help page reduces trust. David decides: finish the content now, or hide the link. Either option is a 5-minute change." },
  { id: 'WEB-021', title: 'Check footer and social links', category: 'bug', priority: 'should', status: 'their-action', effort: 'XS', owners: ['david', 'alaa'], description: 'Manually test Instagram, Facebook, LinkedIn and all footer links. Fix suspicious/wrong URLs.', response: 'Manual click test — David or Ala\'a goes through every footer link and social icon. Social URLs are managed in the CMS (Footer global in /admin), so any wrong link David can fix himself immediately. Only needs a developer if a link is hardcoded in the code.' },
  { id: 'WEB-022', title: 'Fix image alt text and names', category: 'content', priority: 'should', status: 'their-action', effort: 'XS', owners: ['david', 'dev'], description: 'Correct misspelled names or irrelevant alt text such as David Heider / Marcel Rauminger if present.', response: 'Alt text is set when images are uploaded in the CMS. David can update alt text directly in /admin → Media for any image. Developer only needed if something is hardcoded in the code.' },
  { id: 'WEB-023', title: 'Self-service creation of new workshop types', category: 'feature', priority: 'critical', status: 'done', effort: 'M', owners: ['dev', 'david'], slug: 'admin', description: 'David/Marcel must be able to create one-off partner workshops and new workshop types without code changes — including title, date, location, capacity, price, description, images, FAQ, booking and automated emails.', response: 'Done. David and Marcel can already create new workshop appointment slots, set dates, times, locations, and available spots directly in /admin → Workshop Appointments. Changes go live immediately. A full founders guide exists. No developer needed for day-to-day workshop management.' },
  { id: 'WEB-024', title: 'Workshop booking overview in dashboard', category: 'feature', priority: 'must', status: 'done', effort: 'M', owners: ['dev'], slug: 'admin', description: 'Show bookings clearly in the dashboard: name, date, product/workshop, payment status, email status, notes.', response: "Done. Bookings and workshop appointments are visible in the Payload admin. If specific columns or views need to be adjusted — for example a cleaner summary view — that's a quick improvement. Flag what's missing and it gets added." },
  { id: 'WEB-025', title: 'Individual voucher personalization', category: 'feature', priority: 'should', status: 'future', effort: 'M', owners: ['dev', 'david'], slug: 'voucher', description: 'Allow customer name, recipient name, message or voucher design customization if feasible.', response: "Future feature. Custom names, messages, or designs on vouchers requires additional development. Scope and quote when the time comes — good to do before a gift season (Christmas, Valentine's)." },
  { id: 'WEB-026', title: 'Transactional email audit', category: 'feature', priority: 'must', status: 'done', effort: 'M', owners: ['dev', 'david'], description: 'Check all automated emails: booking confirmation, invoice, voucher delivery, reminder, cancellation/reschedule if needed.', response: 'Done. All automated emails are set up in Brevo: booking confirmation, invoice, voucher delivery, welcome email, password reset. Triggers come from Stripe webhooks and Payload hooks. Cancellation email listed separately as WEB-033.' },
  { id: 'WEB-027', title: 'Backup strategy', category: 'org', priority: 'critical', status: 'done', effort: 'M', owners: ['dev'], description: 'Clarify automatic backups for MongoDB, R2 assets, code, CMS content and recovery process.', response: 'Mostly covered. Code: backed up on GitHub with full history. Deployment: Vercel keeps all snapshots — instant rollback. Database: MongoDB Atlas includes automatic daily backups. Media (Cloudflare R2): no automatic backup — this is the one gap. A manual backup schedule should be agreed and documented.' },
  { id: 'WEB-028', title: 'Rollback / deployment recovery process', category: 'org', priority: 'critical', status: 'done', effort: 'XS', owners: ['dev'], description: 'Document how to rollback if a deployment breaks the website.', response: 'Built into Vercel. Every deployment is saved and can be instantly re-activated with one click from the Vercel dashboard — no terminal or code needed. Rollback takes under 60 seconds. A one-page guide for David showing exactly where to click is worth adding.' },
  { id: 'WEB-029', title: 'Access rights and 2FA audit', category: 'org', priority: 'critical', status: 'their-action', effort: 'M', owners: ['david', 'marcel', 'dev'], description: 'Check admin rights, least privilege, two-factor authentication and backup admins for all critical systems.', response: "Each person reviews and secures their own accounts — nobody can manage another person's account security. David and Marcel should enable 2FA on Stripe, Brevo, Google (GTM/GA4), and EasyName. Rafaela handles Vercel, GitHub, MongoDB, and Cloudflare R2." },
  { id: 'WEB-030', title: 'Knowledge hub / blog roadmap', category: 'feature', priority: 'nice', status: 'future', effort: 'M', owners: ['david'], description: 'Plan future content structure for fermentation knowledge, recipes and SEO without overloading current launch phase.', response: "Parked. Strong SEO potential but not the right time to build it. The CMS is already capable of supporting a blog when the decision is made — additive feature, not a rebuild. Define content pillars when the rest of the site is stable." },
  { id: 'WEB-031', title: 'Online course platform', category: 'feature', priority: 'nice', status: 'future', effort: 'XL', owners: ['david', 'dev'], description: 'Online courses directly on the website.', response: 'Parked. Needs a business model decision before any development. Specialist course platforms (Teachable, Kajabi) vs. building inside this system are very different paths with very different costs. Scope properly when the product is ready.' },
  { id: 'WEB-032', title: 'B2B order area', category: 'feature', priority: 'nice', status: 'future', effort: 'XL', owners: ['david', 'marcel', 'dev'], description: 'Long-term idea: gastronomy customers can order products directly via a B2B area.', response: 'Parked. A full B2B ordering system is a significant build. Makes sense when recurring B2B sales are happening at volume and the manual process becomes a real bottleneck.' },
  { id: 'WEB-033', title: 'Cancellation of workshops and individual bookings', category: 'feature', priority: 'critical', status: 'open', effort: 'XL', owners: ['dev', 'david'], slug: 'workshops', description: 'Cancel a workshop and have all customers get an automated email. Also cancel individual customer bookings from the dashboard with Stripe refunds.', response: 'Valid and important — not yet built. Two separate things: (1) David cancels entire workshop session, all attendees automatically get a cancellation email; (2) David cancels individual customer booking, that specific customer gets an email. Both require new admin logic, Brevo cancellation email template, and Stripe refund handling. Needs scope + quote as paid development work.' },
]

const NEW_CASES: SeedItem[] = [
  { id: 'CASE-01', title: 'Case 1: Cancel a full workshop date', category: 'feature', priority: 'critical', status: 'open', effort: 'L', owners: ['dev', 'david'], slug: 'workshops', related: 'WEB-033', description: "A workshop date has paid bookings but can't run (illness, too few sign-ups, scheduling conflict). Need to cancel the date, notify everyone automatically, and offer a way to move to another date without losing their payment.", response: 'Depends on Decision 1 (how customers reclaim their booking). Once decided: David marks the appointment cancelled with a reason, every affected booking gets emailed automatically via Brevo, and gets a way to rebook. Admin can still move anyone manually as a fallback.' },
  { id: 'CASE-02', title: 'Case 2: Individual customer rebooking', category: 'feature', priority: 'critical', status: 'open', effort: 'M', owners: ['dev', 'david'], slug: 'workshops', related: 'WEB-033', description: "The workshop still happens, but one customer can't make it and wants to move their paid booking to a different date instead of cancelling.", response: 'Two parts: (1) an admin "move this booking" action in the dashboard — build regardless of other decisions. (2) customer self-service, which depends on Decision 1.' },
  { id: 'CASE-03', title: 'Case 3: Customer cancellation — refund or credit', category: 'feature', priority: 'critical', status: 'open', effort: 'L', owners: ['dev', 'david'], slug: 'workshops', related: 'WEB-033', description: 'A customer wants to cancel entirely. Need a dashboard flow to cancel the booking, decide refund vs. credit vs. nothing per our cancellation terms, and trigger the right Stripe/Brevo actions.', response: "Also the first time the system would ever trigger a real Stripe refund itself — today that only happens by hand in the Stripe dashboard. Depends on Decision 1 (credit mechanism) and Decision 3 (how automated the refund should be)." },
  { id: 'CASE-04', title: 'Case 4: Partial cancellation of multi-seat bookings', category: 'feature', priority: 'must', status: 'open', effort: 'M', owners: ['dev', 'david'], slug: 'workshops', related: 'WEB-033', description: "When one seat out of a 2-3 seat booking cancels, the other seats should stay booked. Today a booking has a flat headcount with no per-seat status, so this isn't possible without cancelling the whole thing.", response: 'Depends on Decision 2 (giving each seat its own status). Once done, this becomes the same "cancel" operation as the other cases, just scoped to one seat.' },
  { id: 'CASE-05', title: 'Case 5: Flexible workshop/event creation workflow', category: 'feature', priority: 'must', status: 'partial', effort: 'M', owners: ['dev', 'david'], slug: 'admin', description: 'Creating a new workshop type or one-off partner event should work reliably end to end — website visibility, booking, Stripe, Brevo — without a developer, with the Product vs. Workshop vs. Appointment distinction documented clearly.', response: "Mostly hardening + documentation, not a rebuild — the product/workshop/appointment model already supports this (see WEB-023, done). Main gaps: the Product → Workshop link exists in the schema but isn't actually used by the booking code yet (it matches by slug text instead), and there's no \"duplicate workshop\" shortcut." },
  { id: 'CASE-06', title: 'Case 6: Press, Media & Awards section', category: 'content', priority: 'should', status: 'open', effort: 'M', owners: ['dev', 'david'], slug: 'press', description: 'Fermentfreude is getting media coverage, awards and features. Needs a CMS section David/Marcel can manage themselves — articles, TV, awards, links — without a developer.', response: 'Recommend a page under About (About → Press & Media) plus a small "As seen in" teaser on the homepage linking to the full page. Clean, additive CMS work — no conflicts with the rest of the system.' },
  { id: 'CASE-07', title: "Mini-Case 7: PDF voucher doesn't show the real value", category: 'bug', priority: 'must', status: 'open', effort: 'S', owners: ['dev'], slug: 'voucher', description: 'Vouchers can be issued for any value (€20, €50, €99...), and the email shows it correctly, but the downloadable PDF always shows the same fixed amount regardless of what was actually purchased.', response: "Confirmed bug. The PDF generator only stamps the voucher code onto a static template — the euro amount visible is baked into the template artwork, not read from the voucher record. Fix: look up the voucher's real value and draw it dynamically, same way the code already gets drawn. Small, contained fix." },
  { id: 'CASE-08', title: 'Future Case 8: Discounts & special pricing', category: 'feature', priority: 'nice', status: 'future', effort: 'L', owners: ['dev', 'david'], description: "Early bird, student, partner or promo-code pricing for workshops. Not urgent, but checkout/pricing should be built so this doesn't require a rebuild later.", response: "Parked. Price is already calculated in one place at booking time — a future discount layer plugs into that single spot rather than scattering pricing logic. Revisit when there's an actual campaign to run." },
  { id: 'CASE-09', title: 'Future Case 9: Multi-session workshops / course series', category: 'feature', priority: 'nice', status: 'future', effort: 'XL', owners: ['dev', 'david'], description: "A course where one booking covers multiple dates (e.g. a 3-part fermentation course), instead of today's one-booking-per-date model.", response: "Parked. Being kept in mind while doing the Stage 1 foundation work (Decisions 1 & 2) so the booking model doesn't get hard-coded any deeper into \"one booking = one date\" than it already is." },
  { id: 'CASE-10', title: 'Booking edge cases to keep in mind', category: 'feature', priority: 'nice', status: 'future', effort: 'M', owners: ['dev'], description: 'Payment succeeds but booking/email fails, wrong date booked, no-shows, refund status tracking, waitlists when a sold-out workshop frees up a seat.', response: "None of these need a full feature now. Flagged so the Stage 1 foundation (booking credit, seat status, refund action) doesn't accidentally block building them later." },
  {
    id: 'DEC-01', title: 'Decision 1: How should customers reclaim money from a cancelled/changed booking?', category: 'decision', priority: 'critical', status: 'open', effort: 'S', owners: ['david', 'marcel'], related: 'WEB-033',
    description: 'Covers Case 1 (we cancel a date), Case 2 (customer wants a new date) and Case 3 (customer cancels). Underneath rebooking code, magic link and internal credit is the same idea: a credit tied to the original payment. Pick the approach before this gets built.',
    response: 'Your call — see the options below, pick one and add notes if useful.',
    decision: {
      question: 'How should a customer reclaim money from a cancelled or changed booking?', choice: null, notes: '',
      options: {
        unified: { label: 'One booking credit, two doors in', recommended: true, desc: 'Reuse the existing gift-voucher system as a single credit mechanism — customers redeem it with a code or a personal link. Fastest to build well, most reuse of existing working code.' },
        'three-systems': { label: 'Three separate systems', desc: 'Build rebooking code, magic link and account-based credit as genuinely distinct features. More flexible in theory, three times the work to build and maintain.' },
        'admin-only': { label: 'Admin-only for now', desc: "Skip customer self-service entirely. David/Marcel move bookings manually; doesn't reduce support workload." },
      },
    },
  },
  {
    id: 'DEC-02', title: 'Decision 2: Should each seat in a group booking get its own status now?', category: 'decision', priority: 'critical', status: 'open', effort: 'S', owners: ['david', 'marcel'], related: 'WEB-033',
    description: 'Covers Case 4 — one of three friends cancels, the rest stay booked.',
    response: 'Your call — see the options below, pick one and add notes if useful.',
    decision: {
      question: 'Should we track each seat in a group booking individually, starting now?', choice: null, notes: '',
      options: {
        'upgrade-now': { label: 'Give every seat its own status now', recommended: true, desc: 'Real but contained schema work now. Becomes the shared foundation Cases 1–4 all sit on.' },
        defer: { label: 'Keep it simple, handle by hand for now', desc: 'No new schema work now, but partial cancellations stay a manual, error-prone workaround indefinitely.' },
      },
    },
  },
  {
    id: 'DEC-03', title: 'Decision 3: How automated should the Case 3 refund be?', category: 'decision', priority: 'critical', status: 'open', effort: 'S', owners: ['david', 'marcel'], related: 'WEB-033',
    description: 'This is the first time the system would ever trigger a real Stripe refund itself — today that only happens by hand in the Stripe dashboard.',
    response: 'Your call — see the options below, pick one and add notes if useful.',
    decision: {
      question: 'How much should a cancellation refund happen on its own, versus wait for a human?', choice: null, notes: '',
      options: {
        'semi-auto': { label: 'System suggests, you confirm', recommended: true, desc: "Dashboard calculates a suggested refund per your cancellation policy; nothing happens to the customer's money until David or Marcel confirms." },
        manual: { label: 'Fully manual', desc: 'Dashboard just records the decision — refund, credit, or nothing — amount typed in by hand each time.' },
        auto: { label: 'Fully automatic', desc: 'System applies the policy and issues the refund/credit with no human in the loop.' },
      },
    },
  },
]

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

  const combined = [
    ...SEED.map((i) => ({ ...i, board: 'current' as const })),
    ...NEW_CASES.map((i) => ({ ...i, board: 'new' as const })),
  ]

  for (const item of combined) {
    const { id: itemId, ...rest } = item
    await payload.create({
      collection: 'backlog-items',
      data: { itemId, notes: '', ...rest },
      context: ctx,
    })
    console.log(`✓ ${itemId} — ${item.title}`)
  }

  console.log(`\n✅ Seeded ${combined.length} backlog items.`)
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
