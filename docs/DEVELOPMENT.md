# Development Guide - Fermentfreude

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Development Workflow](#development-workflow)
3. [Project Structure](#project-structure)
4. [Available Commands](#available-commands)
5. [Working with Payload CMS](#working-with-payload-cms)
6. [Database Management](#database-management)
7. [Testing](#testing)
8. [Git Workflow](#git-workflow)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/FermentFreude/fermentfreude.git
cd fermentfreude/ecommerce-main
```

### 2. Install Dependencies

```bash
# Using npm (recommended for this project)
npm install --legacy-peer-deps

# Or using yarn
yarn install
```

**Note:** Use `--legacy-peer-deps` due to Payload CMS plugin version compatibility.

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Database
DATABASE_URI=mongodb://localhost:27017/fermentfreude
# Or MongoDB Atlas:
# DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/fermentfreude

# Payload CMS
PAYLOAD_SECRET=your-random-secret-key-min-32-characters
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_your_webhook_secret
PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY=true

# Brevo (optional for development)
BREVO_API_KEY=your_brevo_api_key

# Google Analytics (optional for development)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas** (recommended)
- Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Get connection string
- Add to `.env`

### 5. Seed Database (Optional)

```bash
# Populate with demo data
npm run seed
```

⚠️ **Warning:** This will drop the existing database!

### 6. Start Development Server

```bash
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin
- API: http://localhost:3000/api

---

## 🔄 Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

4. **Make changes** and test

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add workshop booking widget"
git commit -m "fix: resolve cart calculation error"
git commit -m "docs: update API documentation"
```

---

## 📁 Project Structure

```
ecommerce-main/
├── src/
│   ├── app/                      # Next.js 13 App Router
│   │   ├── (pages)/             # Route groups
│   │   │   ├── [slug]/          # Dynamic pages
│   │   │   ├── account/         # User account
│   │   │   ├── cart/            # Shopping cart
│   │   │   ├── checkout/        # Checkout flow
│   │   │   ├── products/        # Product pages
│   │   │   └── workshops/       # Workshop pages (to create)
│   │   ├── _api/                # API utilities
│   │   ├── _blocks/             # Content blocks
│   │   ├── _components/         # React components
│   │   ├── _css/                # SCSS stylesheets
│   │   ├── _graphql/            # GraphQL queries
│   │   ├── _heros/              # Hero components
│   │   ├── _providers/          # Context providers
│   │   ├── _utilities/          # Helper functions
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage
│   │
│   └── payload/                  # Payload CMS Backend
│       ├── collections/          # Content types
│       │   ├── Categories.ts
│       │   ├── Media.ts
│       │   ├── Orders/
│       │   ├── Pages/
│       │   ├── Products/
│       │   ├── Users/
│       │   └── Workshops.ts      # To create
│       ├── globals/              # Global settings
│       │   ├── Footer.ts
│       │   ├── Header.ts
│       │   └── Settings.ts
│       ├── access/               # Permission rules
│       ├── blocks/               # Block schemas
│       ├── endpoints/            # Custom endpoints
│       ├── fields/               # Reusable fields
│       ├── hooks/                # Lifecycle hooks
│       └── payload.config.ts     # Main config
│
├── public/                       # Static assets
│   ├── assets/
│   └── admin ui/
│
├── .env                          # Environment variables (never commit!)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## ⚡ Available Commands

### Development

```bash
# Start dev server (hot reload)
npm run dev

# Start dev server with Stripe webhooks
npm run stripe:webhooks
```

### Building

```bash
# Build for production
npm run build

# Build only Payload (faster for CMS changes)
npm run build:payload

# Build only server
npm run build:server

# Build only Next.js
npm run build:next
```

### Production

```bash
# Serve production build
npm run serve
```

### Database

```bash
# Seed database with demo data (⚠️ drops existing data)
npm run seed

# Generate TypeScript types from Payload collections
npm run generate:types

# Generate GraphQL schema
npm run generate:graphQLSchema
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Payload CMS

```bash
# Access Payload CLI
npm run payload

# Example: Create admin user via CLI
npm run payload -- users:create
```

---

## 🎨 Working with Payload CMS

### Accessing Admin Dashboard

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/admin
3. Create first admin user if prompted

### Creating Collections

Collections are content types (Products, Workshops, Recipes, etc.)

**Location:** `src/payload/collections/`

**Example: Create Workshops Collection**

```typescript
// src/payload/collections/Workshops.ts
import { CollectionConfig } from 'payload/types'

const Workshops: CollectionConfig = {
  slug: 'workshops',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Public
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'maxParticipants',
      type: 'number',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

export default Workshops
```

**Register in payload.config.ts:**

```typescript
import Workshops from './collections/Workshops'

collections: [Pages, Products, Orders, Media, Categories, Users, Workshops],
```

**Generate types:**

```bash
npm run generate:types
```

### Creating Global Settings

Globals are single-instance settings (Header, Footer, Site Settings)

**Location:** `src/payload/globals/`

### Access Control

Define who can read/write content:

```typescript
access: {
  read: () => true,                    // Public
  create: ({ req: { user } }) => !!user, // Logged in users
  update: ({ req: { user } }) => !!user,
  delete: ({ req: { user } }) => user?.role === 'admin', // Admins only
},
```

---

## 🗄️ Database Management

### MongoDB Local

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Access MongoDB shell
mongosh

# List databases
show dbs

# Use fermentfreude database
use fermentfreude

# List collections
show collections

# Query workshops
db.workshops.find()
```

### MongoDB Atlas

- Dashboard: https://cloud.mongodb.com
- Monitor: Collections → Browse Collections
- Backup: Automated daily backups included in free tier

### Backup & Restore

```bash
# Export database
mongodump --uri="mongodb://localhost:27017/fermentfreude" --out=./backup

# Import database
mongorestore --uri="mongodb://localhost:27017/fermentfreude" ./backup/fermentfreude
```

---

## 🧪 Testing

### Manual Testing Checklist

**Frontend:**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Product listing displays
- [ ] Cart functionality
- [ ] Checkout process
- [ ] User registration/login
- [ ] Mobile responsive

**Admin Dashboard:**
- [ ] Can login to /admin
- [ ] Create/edit products
- [ ] Create/edit workshops
- [ ] Upload media
- [ ] Manage orders
- [ ] Update global settings

**Payments:**
- [ ] Add to cart
- [ ] Stripe checkout
- [ ] Order confirmation
- [ ] Webhook processing

### Test Stripe Checkout

Use test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3DS: `4000 0025 0000 3155`

Expiry: Any future date  
CVC: Any 3 digits  
ZIP: Any 5 digits

---

## 🌿 Git Workflow

**Branch from `staging`.** Merge back via **Pull Request** so staging stays consistent (direct merges have caused missing assets; PRs allow review and safe conflict resolution).

### Branch strategy

- `main` — production
- `staging` — integration and testing (deploy preview)
- Feature branches — created **from `staging`**, e.g. `retouchcontact`, `retouchhero`, `changes1`, `changes2`, or `feature/your-feature`

### Step-by-step (create branch → rebase → PR)

1. **Create branch from staging**
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b retouchcontact   # or retouchhero, changes1, etc.
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```

3. **Rebase with staging (keep branch up to date)**
   ```bash
   git fetch origin
   git rebase origin/staging
   ```

4. **Push and open Pull Request**
   ```bash
   git push origin retouchcontact
   ```
   - On GitHub: New Pull Request **into `staging`** (not main).
   - Add description, then merge after review.

5. **Before merging: check errors and test build**
   - Run `pnpm lint` and `npx tsc --noEmit`.
   - Confirm staging deploy/build succeeds after merge.

### Syncing your branch with staging

```bash
git checkout your-branch
git fetch origin
git rebase origin/staging
# fix any conflicts, then:
git push origin your-branch   # use --force-with-lease if you already pushed
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check connection string in .env
# Make sure IP is whitelisted in Atlas
```

### Payload Admin Not Loading

```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Rebuild Payload
npm run build:payload
```

### Dependency Conflicts

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### TypeScript Errors

```bash
# Regenerate types
npm run generate:types

# If persists, restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Stripe Webhook Not Working

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Copy webhook signing secret to .env
```

---

## 📚 Additional Resources

- **Payload CMS Docs:** https://payloadcms.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs
- **MongoDB Docs:** https://www.mongodb.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

---

## 🆘 Getting Help

- **Team Chat:** [Your team communication channel]
- **Issues:** https://github.com/FermentFreude/fermentfreude/issues
- **Documentation:** Check other `.md` files in this directory

---

**Last Updated:** February 12, 2026
