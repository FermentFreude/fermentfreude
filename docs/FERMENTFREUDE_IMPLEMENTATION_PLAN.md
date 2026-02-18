# Fermentfreude Implementation Plan
*Using existing Next.js + Payload CMS E-commerce Template*

## 🎯 Project Overview

**Client:** Fermentfreude OG (Austrian food-tech startup)  
**Stack:** Next.js 13.5 + Payload CMS 2.0 + Stripe  
**Starting Point:** Existing e-commerce template (excellent foundation)  
**Timeline:** 8-12 weeks  
**Deliverable:** Full digital ecosystem with admin dashboard

---

## ✅ What's Already Built (Template Provides)

### Core Infrastructure
- ✅ **Payload CMS Admin Dashboard** - `/admin` route with full content management
- ✅ **Authentication System** - User registration, login, password recovery
- ✅ **E-commerce Engine** - Products, cart, checkout, orders
- ✅ **Stripe Integration** - Payment processing ready
- ✅ **Media Management** - Image/video upload and optimization
- ✅ **SEO Plugin** - Meta tags, Open Graph, sitemap generation
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **TypeScript** - Full type safety
- ✅ **Database** - MongoDB with Mongoose
- ✅ **Hosting Ready** - Configured for Vercel deployment

### Existing Collections (Payload Admin)
1. **Products** - Can be used for physical products & vouchers
2. **Categories** - Nested category structure
3. **Pages** - Dynamic CMS pages
4. **Media** - Asset library
5. **Orders** - Order management
6. **Users** - Customer accounts

### Existing Globals (Site-wide Settings)
1. **Header** - Navigation configuration
2. **Footer** - Footer content
3. **Settings** - General site settings

---

## 🔧 Customization Roadmap

### Phase 1: Setup & Configuration (Week 1)
**Goal:** Get the project running and understand the structure

#### 1.1 Initial Setup
```bash
cd ecommerce-main
npm install
# or
yarn install

# Create .env file with:
# DATABASE_URI=your_mongodb_connection_string
# PAYLOAD_SECRET=random_string_here
# NEXT_PUBLIC_SERVER_URL=http://localhost:3000
# STRIPE_SECRET_KEY=your_stripe_key
```

#### 1.2 Run Development Server
```bash
npm run dev
# or  
yarn dev
```

- Visit `http://localhost:3000` - Frontend
- Visit `http://localhost:3000/admin` - Payload Admin Dashboard

#### 1.3 Create First Admin User
- Go to `/admin/create-first-user`
- Set up admin credentials
- **This is what the client will use to manage content**

---

### Phase 2: Collections Customization (Week 2-3)

#### 2.1 Create Workshops Collection
**Location:** `src/payload/collections/Workshops.ts`

**Fields needed:**
- Title
- Slug (auto-generated)
- Description (rich text)
- Workshop type (Tempeh, Kimchi, Kombucha, etc.)
- Date & time
- Duration
- Location (Graz address or online)
- Max participants
- Price
- Current bookings count
- Status (upcoming, full, completed)
- Featured image
- Gallery images
- What participants will learn (list)
- What's included (list)
- Requirements
- Instructor info
- SEO fields (meta title, description)

**Similar to:** Products collection - copy and modify

#### 2.2 Create Press Collection
**Location:** `src/payload/collections/Press.ts`

**Fields needed:**
- Company name
- Logo (high-res)
- Press photos (multiple)
- Company description (short & long)
- Fact sheet (PDF upload)
- Press contact email
- Press releases (array of items with date, title, PDF)
- Downloadable assets (zip files)

#### 2.3 Extend Products Collection
**Add fields for:**
- Product type (physical product, voucher, workshop booking)
- Workshop reference (if voucher is for workshop)
- Voucher code system
- B2B pricing (optional)
- Minimum order quantity (for B2B)

#### 2.4 Create Recipes Collection
**Location:** `src/payload/collections/Recipes.ts`

**Fields needed:**
- Title
- Slug
- Featured image
- Category (fermented foods, tempeh recipes, kimchi recipes, etc.)
- Prep time
- Fermentation time
- Total time
- Difficulty level
- Servings
- Ingredients (array)
- Instructions (steps array with rich text)
- Nutrition facts (optional)
- Tips & tricks
- Related products
- Author (staff member)
- Published date

#### 2.5 Create B2B Inquiries Collection
**No public interface - admin only**

**Fields:**
- Business name
- Contact person
- Email
- Phone
- Business type (restaurant, hotel, catering, retail)
- Inquiry type (product supply, workshop, partnership)
- Message
- Status (new, in-progress, converted, declined)
- Follow-up notes (admin only)

---

### Phase 3: Frontend Pages (Week 3-4)

#### 3.1 Homepage
**Path:** `src/app/page.tsx`

**Sections needed:**
- Hero (hero video or images from Figma)
- What is fermentation? (intro section)
- Featured workshops (carousel)
- Featured products (grid)
- Latest recipes (3-4 cards)
- Newsletter signup
- Social proof / testimonials

#### 3.2 Workshops Pages
**Routes to create:**

```
/workshops - Overview page (list all workshops)
/workshops/[slug] - Individual workshop detail page
```

**Workshop detail page includes:**
- Hero image
- Workshop info (date, time, location, price)
- Description
- What you'll learn
- What's included
- Booking button (external booking widget)
- FAQ section
- Related workshops

#### 3.3 About Us Page
**Path:** `src/app/(pages)/about/page.tsx`

**Content:**
- Company story
- Mission & values
- Team members (founders)
- Science-backed approach
- Sustainability commitment

#### 3.4 B2B Pages
**Routes:**

```
/b2b - B2B overview
/b2b/gastronomy - For restaurants & hotels
/b2b/events - For event organizers
/b2b/cooperations - Partnership opportunities
/b2b/retail - For retail partners
```

**Each page needs:**
- Target audience description
- Benefits
- Sample products/services
- Pricing tiers (if applicable)
- Contact form (saves to B2B Inquiries collection)

#### 3.5 Recipe/Blog Pages
**Use existing Pages collection or create dedicated recipe pages**

```
/recipes - All recipes (filterable by category)
/recipes/[slug] - Individual recipe
/blog - Tutorials, science articles
/blog/[slug] - Individual article
```

#### 3.6 Press/Media Kit Page
**Path:** `src/app/(pages)/press/page.tsx`

**Content:**
- Company overview
- High-res logos (download buttons)
- Press photos (gallery with download)
- Fact sheet (PDF download)
- Press releases
- Press contact

#### 3.7 Existing Pages to Keep
- `/products` - Product catalog ✓
- `/products/[slug]` - Product detail ✓
- `/cart` - Shopping cart ✓
- `/checkout` - Checkout ✓
- `/account` - User account ✓
- `/orders` - Order history ✓

---

### Phase 4: Integrations (Week 4-5)

#### 4.1 Workshop Booking System

**Option 1: Embed Solution (Recommended for MVP)**
- Use SimplyBook.me or Calendly
- Embed iframe in workshop detail pages
- Client manages bookings in external tool
- Cost: €0-15/month

**Option 2: Custom Integration**
- Use booking tool API
- Save bookings to Workshops collection
- More control, more development time

**Implementation:**
```typescript
// Component: src/app/_components/BookingWidget/index.tsx
// Embed booking tool iframe or integrate API
```

#### 4.2 Brevo CRM Integration

**Newsletter Signup Form**
**Location:** `src/app/_components/NewsletterSignup/index.tsx`

**Features:**
- Email capture
- Name (optional)
- Interests checkboxes (workshops, recipes, products)
- Double opt-in flow
- Send to Brevo via API

**Implementation:**
```typescript
// API route: src/app/api/newsletter/route.ts
// Calls Brevo API to add subscriber
```

**Contact Forms → Brevo**
- General contact form
- B2B inquiry form
- Workshop inquiry form

All submit to Brevo as contacts with appropriate tags.

**Brevo Automations:**
- Welcome email series
- Workshop reminder (24h before)
- Post-purchase follow-up
- Recipe newsletter (weekly/monthly)

#### 4.3 Analytics Setup

**Google Analytics 4:**
```typescript
// Add to src/app/layout.tsx
// GA4 tracking script
```

**Google Tag Manager:**
- Container setup
- Event tracking (add to cart, checkout, workshop view)

**Meta Pixel:**
- Add to layout
- Track conversions

**Implementation file:** `src/app/_utilities/analytics.ts`

---

### Phase 5: Styling & Branding (Week 5-6)

#### 5.1 Design System Setup
**Location:** `src/app/_css/`

**Update:**
- `colors.scss` - Fermentfreude brand colors
- `type.scss` - Typography (fonts from Figma)
- `theme.scss` - Component styles
- `app.scss` - Global styles

#### 5.2 Component Styling
**Existing components to restyle:**
- Header/Navigation
- Footer
- Buttons
- Cards
- Forms
- Hero sections

**Use Figma wireframes as reference**

#### 5.3 Custom Components
**Create brand-specific components:**
- Workshop card
- Recipe card
- Testimonial component
- Workshop booking widget wrapper
- Newsletter signup (styled)

---

### Phase 6: E-commerce Customization (Week 6-7)

#### 6.1 Product Types
**Extend existing Products collection to support:**
1. Physical products (tempeh, etc.)
2. Digital vouchers
3. Workshop bookings (as products)

#### 6.2 Voucher System
**Two approaches:**

**Option 1: Use Stripe Coupons**
- Create coupon codes in Stripe
- Apply at checkout
- Built-in functionality

**Option 2: Custom Voucher Products**
- Sell vouchers as products
- Generate unique codes
- Validate on checkout

#### 6.3 B2B Pricing
**Add wholesale pricing tier:**
- Minimum order quantities
- Volume discounts
- Separate B2B customer group

---

### Phase 7: Content Migration & Setup (Week 7-8)

#### 7.1 Populate Collections via Admin

**Client will do this via `/admin` dashboard:**

1. **Media Library**
   - Upload all product photos
   - Workshop images
   - Team photos
   - Press kit assets

2. **Products**
   - Create each product
   - Add descriptions, prices, images
   - Set inventory levels

3. **Workshops**
   - Create workshop entries
   - Set dates, prices
   - Add descriptions

4. **Pages**
   - About Us content
   - FAQ
   - Terms & Conditions
   - Privacy Policy
   - Shipping & Returns

5. **Recipes**
   - Import existing recipes
   - Format with proper fields

6. **Press Kit**
   - Upload logos
   - Add fact sheet
   - Press photos

7. **Global Settings**
   - Configure header navigation
   - Footer content
   - Site settings

#### 7.2 SEO Setup
- Meta descriptions for all pages
- Open Graph images
- Sitemap generation (automatic)
- Schema.org markup for products/recipes

---

### Phase 8: Testing & Optimization (Week 8-9)

#### 8.1 Functionality Testing
- [ ] Admin dashboard - create/edit all content types
- [ ] Product purchase flow
- [ ] Voucher redemption
- [ ] Workshop booking
- [ ] Newsletter signup
- [ ] Contact forms
- [ ] User registration & login
- [ ] Password recovery
- [ ] Order management

#### 8.2 Payment Testing
- [ ] Stripe test mode
- [ ] Successful payment
- [ ] Failed payment handling
- [ ] Refunds
- [ ] Webhook processing

#### 8.3 Email Testing
- [ ] Order confirmation
- [ ] Shipping notification (if applicable)
- [ ] Newsletter confirmation (Brevo)
- [ ] Contact form submissions
- [ ] Workshop reminders

#### 8.4 Performance Optimization
- [ ] Image optimization (Next.js Image component)
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Lighthouse score > 90

#### 8.5 Mobile Testing
- [ ] All pages responsive
- [ ] Touch targets appropriate size
- [ ] Forms work on mobile
- [ ] Checkout flow smooth

#### 8.6 SEO Audit
- [ ] Meta tags on all pages
- [ ] Alt text on images
- [ ] Proper heading hierarchy
- [ ] Internal linking
- [ ] Sitemap submitted to Google

---

### Phase 9: Deployment (Week 9-10)

#### 9.1 Environment Setup

**Database:**
- MongoDB Atlas (free tier 500MB)
- Create production cluster
- Save connection string

**Hosting:**
- Vercel (free tier)
- Connect GitHub repo
- Set environment variables

**Stripe:**
- Switch from test to live keys
- Configure webhooks for production URL

**Brevo:**
- Set up production account
- Configure API keys

#### 9.2 Deploy to Vercel
```bash
# Build locally first
npm run build

# Deploy via Vercel CLI or GitHub integration
vercel --prod
```

#### 9.3 Domain Configuration
- Point Fermentfreude domain to Vercel
- SSL certificate (automatic via Vercel)
- WWW redirect (if needed)

#### 9.4 Post-Deployment
- [ ] Verify all integrations work
- [ ] Test payment flow
- [ ] Test booking system
- [ ] Check emails send correctly
- [ ] Verify analytics tracking
- [ ] Test on multiple devices

---

### Phase 10: Training & Handover (Week 10-11)

#### 10.1 Client Training Session

**Admin Dashboard Walkthrough:**
1. **Login & Dashboard Overview**
   - How to access `/admin`
   - Dashboard navigation

2. **Content Management**
   - Creating/editing products
   - Managing workshops
   - Publishing recipes
   - Updating pages

3. **Media Library**
   - Uploading images
   - Organizing assets
   - Image optimization tips

4. **Order Management**
   - Viewing orders
   - Processing orders
   - Marking as shipped
   - Handling refunds

5. **User Management**
   - Viewing customers
   - Customer support access

6. **Global Settings**
   - Updating header/footer
   - Site settings

#### 10.2 Documentation Creation

**Create guides for:**
- How to add a product
- How to create a workshop
- How to publish a recipe
- How to update site content
- How to process orders
- How to run promotions
- How to generate reports

#### 10.3 External Tools Training
- Brevo dashboard (email management)
- Stripe dashboard (payments)
- Booking tool (if external)
- Google Analytics (basic reporting)

---

## 🎨 Design Implementation (From Figma)

### Approach:
1. **Review Figma wireframes** section by section
2. **Identify reusable components** (buttons, cards, forms)
3. **Build component library** first
4. **Assemble pages** using components
5. **Apply responsive rules** from Figma

### Key Components to Build:
- Navigation (desktop + mobile menu)
- Hero sections (multiple variants)
- Product card
- Workshop card
- Recipe card
- Newsletter form
- Contact form
- Footer
- Button variants
- Input fields
- Testimonial component

---

## 📊 Admin Dashboard Overview (What Client Sees)

### Payload Admin Features (Already Built):

**Collections Management:**
- Visual interface to create/edit content
- Rich text editor (similar to WordPress)
- Image upload with drag & drop
- Relationship fields (link products to categories)
- Draft/publish workflow
- Revision history
- Bulk actions

**No Code Required:**
- All editing done through forms
- WYSIWYG editor for content
- Point-and-click interface
- Create button → fill form → save
- That's it!

**Example: Adding a Workshop**
1. Go to Collections → Workshops
2. Click "Create New"
3. Fill in fields:
   - Workshop Title: "Introduction to Tempeh Making"
   - Date: [date picker]
   - Time: [time picker]
   - Price: €75
   - Max Participants: 12
   - Description: [rich text editor]
   - Upload image
4. Click "Save" or "Save & Publish"

**Done!** The workshop appears on the website automatically.

---

## 🔄 Maintenance Plan (After Launch)

### What Client Can Do:
✅ Add/edit/delete products
✅ Create workshops
✅ Publish recipes
✅ Update pages
✅ Process orders  
✅ Upload media
✅ Update settings
✅ View analytics

### What Requires Developer:
❌ Add new features
❌ Change site structure
❌ Modify checkout flow
❌ Add new integrations
❌ Framework updates
❌ Security patches

### Maintenance Schedule:
- **Months 1-3:** Monitor, fix small bugs (included in project)
- **Quarterly:** Framework updates (2-4 hours, optional)
- **As needed:** Feature additions (quoted separately)

---

## 💰 Cost Tracking (First Year)

### Development: €0
(Internship project)

### Infrastructure: €0
- Vercel: Free tier
- MongoDB Atlas: Free tier (500MB)
- Payload CMS: Free (open source)
- Brevo: Free tier (300 emails/day)

### Optional Paid Add-ons:
- SimplyBook.me: €15/month (if chosen) = €180/year
- Or build custom booking: €0

### Transaction Fees:
- Stripe: ~2% + €0.25 per transaction
  - Example: €10,000 sales = ~€200 in fees

### Total Year 1: €0 - €180
(vs. Webflow: €1,248 + transaction fees)

---

## 🚀 Quick Start Commands

```bash
# Development
cd ecommerce-main
npm install
npm run dev

# Access admin
# http://localhost:3000/admin

# Build for production
npm run build
npm run serve

# Database seeding (demo data)
npm run seed

# Generate TypeScript types (after schema changes)
npm run generate:types
```

---

## 📝 Environment Variables Needed

Create `.env` file:

```bash
# Database
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/fermentfreude

# Payload
PAYLOAD_SECRET=your-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...
PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY=true

# Brevo (add later)
BREVO_API_KEY=your-brevo-api-key

# Google Analytics (add later)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## ✨ Key Advantages of This Approach

1. **Admin Dashboard Ready** - Client can manage everything without touching code
2. **Proven Template** - Battle-tested e-commerce foundation
3. **Type-Safe** - TypeScript prevents bugs
4. **Scalable** - Can grow with business
5. **Modern Stack** - Latest Next.js features
6. **SEO-Ready** - Built-in optimization
7. **Cost-Effective** - Zero mandatory subscriptions
8. **Flexible** - Easy to customize
9. **Well-Documented** - Large community support
10. **Future-Proof** - Own the code, no vendor lock-in

---

## 🎯 Success Criteria

By end of internship:

- [ ] Website live at fermentfreude.com
- [ ] Admin dashboard accessible
- [ ] All workshops created and bookable
- [ ] Products available for purchase
- [ ] Recipe/blog content published
- [ ] Newsletter signup working
- [ ] B2B inquiry forms functional
- [ ] Press kit accessible
- [ ] Payment processing working
- [ ] Client trained on admin dashboard
- [ ] Analytics tracking
- [ ] Mobile-responsive
- [ ] GDPR compliant
- [ ] Performance optimized (Lighthouse > 90)
- [ ] Documentation complete

---

## 📞 Next Steps

1. **Review this plan** - Discuss any questions
2. **Set up development environment** - Install dependencies
3. **Create admin user** - Access Payload dashboard
4. **Review Figma** - Align on design details
5. **Start Phase 1** - Begin customization
6. **Weekly check-ins** - Track progress

**This template gives you an 80% head start. The remaining 20% is customization for Fermentfreude's specific needs.**

---

## Additional Resources

- **Payload CMS Docs:** https://payloadcms.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs
- **Brevo API:** https://developers.brevo.com/
- **Vercel Deployment:** https://vercel.com/docs

---

*Last Updated: February 12, 2026*
