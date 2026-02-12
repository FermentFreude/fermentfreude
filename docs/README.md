# Fermentfreude Documentation

Complete documentation for the Fermentfreude digital ecosystem project.

---

## 📚 Documentation Index

### For Developers

1. **[DEVELOPMENT.md](./DEVELOPMENT.md)**  
   Complete development guide including:
   - Environment setup
   - Development workflow
   - Project structure overview
   - Available commands
   - Working with Payload CMS
   - Database management
   - Git workflow
   - Troubleshooting

2. **[SECURITY.md](./SECURITY.md)**  
   Security best practices and requirements:
   - Environment security
   - Authentication & authorization
   - API security
   - Payment security (Stripe)
   - GDPR compliance
   - Security headers
   - Incident response

3. **[ACCESSIBILITY.md](./ACCESSIBILITY.md)**  
   WCAG 2.1 Level AA compliance guide:
   - Semantic HTML
   - ARIA implementation
   - Keyboard navigation
   - Screen reader support
   - Color & contrast requirements
   - Accessible forms
   - Testing tools

4. **[PERFORMANCE.md](./PERFORMANCE.md)**  
   Performance optimization guide:
   - Performance targets (Lighthouse 90+)
   - Core Web Vitals
   - Next.js optimization
   - Image optimization
   - Code splitting
   - Caching strategies
   - Monitoring & analytics

---

## 🤖 For AI Assistants (Claude)

**[CLAUDE_INSTRUCTIONS.md](../CLAUDE_INSTRUCTIONS.md)** (in root)  
Comprehensive instructions for AI assistants including:
- Operating principles
- Code organization rules
- Next.js best practices
- Payload CMS patterns
- Change delivery format
- **Always reference this before making changes**

### How to use with Claude

When working with Claude on this project, include these instructions in your prompt:

```
Please read and follow the guidelines in CLAUDE_INSTRUCTIONS.md 
located in the project root before implementing any changes.
```

Or copy the relevant sections directly into your prompt.

---

## 📋 Quick Reference

### Project Info
- **Tech Stack:** Next.js 13.5 + Payload CMS 2.0 + Stripe + MongoDB
- **Target:** Production-ready e-commerce platform
- **Standards:** WCAG 2.1 AA, Lighthouse 90+, GDPR compliant

### Essential Links
- **Main README:** [../README.md](../README.md)
- **Implementation Plan:** [../../FERMENTFREUDE_IMPLEMENTATION_PLAN.md](../../FERMENTFREUDE_IMPLEMENTATION_PLAN.md)

### Get Started
1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for setup
2. Check [SECURITY.md](./SECURITY.md) before deploying
3. Reference [ACCESSIBILITY.md](./ACCESSIBILITY.md) when building UI
4. Review [PERFORMANCE.md](./PERFORMANCE.md) for optimization

---

## 🏗️ Documentation Structure

```
ecommerce-main/
├── README.md                           # Project overview
├── CLAUDE_INSTRUCTIONS.md              # AI assistant guidelines
└── docs/                               # Detailed documentation
    ├── README.md                       # This file
    ├── DEVELOPMENT.md                  # Development guide
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
*Last Updated: February 12, 2026*
