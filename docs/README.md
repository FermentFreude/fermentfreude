# Fermentfreude Documentation

Complete documentation for the Fermentfreude digital ecosystem project.

---

## 📚 Documentation Index

### For Developers

1. **[SETUP.md](./SETUP.md)**  
   Complete technical reference including:
   - Architecture overview & provider stack
   - Theme / dark mode system
   - Locale / i18n system
   - Tailwind CSS configuration & brand tokens
   - Typography system
   - Payload CMS configuration & REST API
   - Authentication API
   - Access control & roles
   - Ecommerce & Stripe
   - Middleware & coming-soon gate
   - Auto-translation (DeepL)
   - Environment variables
   - Seed scripts & common commands

2. **[DEVELOPMENT.md](./DEVELOPMENT.md)**  
   Development workflow guide including:
   - Environment setup
   - Project structure overview
   - Available commands
   - Working with Payload CMS
   - Database management
   - Git workflow
   - Troubleshooting

3. **[TRANSLATION.md](./TRANSLATION.md)**  
   Localization & auto-translation guide:
   - Payload CMS localization config (DE/EN)
   - DeepL auto-translate hooks
   - Manual translation workflow
   - Locale provider usage

4. **[SECURITY.md](./SECURITY.md)**  
   Security best practices and requirements:
   - Environment security
   - Authentication & authorization
   - API security
   - Payment security (Stripe)
   - GDPR compliance
   - Security headers
   - Incident response

5. **[ACCESSIBILITY.md](./ACCESSIBILITY.md)**  
   WCAG 2.1 Level AA compliance guide:
   - Semantic HTML
   - ARIA implementation
   - Keyboard navigation
   - Screen reader support
   - Color & contrast requirements
   - Accessible forms
   - Testing tools

6. **[PERFORMANCE.md](./PERFORMANCE.md)**  
   Performance optimization guide:
   - Performance targets (Lighthouse 90+)
   - Core Web Vitals
   - Next.js optimization
   - Image optimization
   - Code splitting
   - Caching strategies
   - Monitoring & analytics

---

## 🤖 For AI Assistants

**[AGENTS.md](../AGENTS.md)** (in root)  
Payload CMS development rules including:
- TypeScript-first patterns
- Security-critical access control
- Hook patterns & transaction safety
- Component architecture (Server vs Client)
- Field types & queries

---

## 📋 Quick Reference

### Project Info
- **Tech Stack:** Next.js 15.4 + Payload CMS 3.76 + Stripe + MongoDB
- **Fonts:** Neue Haas Grotesk (Adobe Fonts / Typekit)
- **Locales:** German (default) + English with DeepL auto-translate
- **Theme:** Light / Dark mode with FOUC prevention
- **Target:** Production-ready e-commerce platform
- **Standards:** WCAG 2.1 AA, Lighthouse 90+, GDPR compliant

### Essential Links
- **Main README:** [../README.md](../README.md)
- **Implementation Plan:** [../FERMENTFREUDE_IMPLEMENTATION_PLAN.md](../FERMENTFREUDE_IMPLEMENTATION_PLAN.md)

### Get Started
1. Read [SETUP.md](./SETUP.md) for the full technical reference
2. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for dev workflow
3. Check [SECURITY.md](./SECURITY.md) before deploying
4. Reference [ACCESSIBILITY.md](./ACCESSIBILITY.md) when building UI
5. Review [PERFORMANCE.md](./PERFORMANCE.md) for optimization

---

## 🏗️ Documentation Structure

```
FermentFreude/
├── README.md                           # Project overview
├── AGENTS.md                           # AI assistant / Payload CMS rules
└── docs/                               # Detailed documentation
    ├── README.md                       # This file (index)
    ├── SETUP.md                        # Full technical reference
    ├── DEVELOPMENT.md                  # Development workflow
    ├── TRANSLATION.md                  # Localization & auto-translate
    ├── SECURITY.md                     # Security best practices
    ├── ACCESSIBILITY.md                # Accessibility standards
    └── PERFORMANCE.md                  # Performance optimization
```

---

## 🔄 Keeping Documentation Updated

When making significant changes to the project:

1. **Update** relevant documentation files
2. **Add** new sections if introducing new patterns
3. **Update** `CLAUDE_INSTRUCTIONS.md` if project structure changes
4. **Review** at least quarterly

---

## 📞 Questions?

- **For development questions:** Check DEVELOPMENT.md
- **For security concerns:** Check SECURITY.md
- **For accessibility questions:** Check ACCESSIBILITY.md
- **For performance issues:** Check PERFORMANCE.md

If you can't find what you need, ask your team lead or create an issue in the repository.

---

*Documentation maintained by the Fermentfreude development team*  
*Last Updated: February 13, 2026*
