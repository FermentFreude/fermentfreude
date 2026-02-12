# Accessibility Standards - Fermentfreude

## ♿ WCAG 2.1 AACompliance Guide

This document ensures Fermentfreude meets **WCAG 2.1 Level AA** accessibility standards, making the website usable for everyone.

---

## 📋 Table of Contents

1. [Accessibility Principles](#accessibility-principles)
2. [Semantic HTML](#semantic-html)
3. [ARIA Implementation](#aria-implementation)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Screen Reader Support](#screen-reader-support)
6. [Color & Contrast](#color--contrast)
7. [Forms & Inputs](#forms--inputs)
8. [Images & Media](#images--media)
9. [Responsive Design](#responsive-design)
10. [Testing Tools](#testing-tools)

---

## 🎯 Accessibility Principles

### POUR Framework

1. **Perceivable** - Information presented in multiple ways
2. **Operable** - Navigation works with keyboard/mouse/touch
3. **Understandable** - Content is clear and predictable
4. **Robust** - Works across browsers and assistive technologies

### Target Standards

- **WCAG 2.1 Level AA** (required)
- **Keyboard accessible** (all interactions)
- **Screen reader friendly** (JAWS, NVDA, VoiceOver)
- **Mobile accessible** (touch targets ≥ 44x44px)

---

## 🏗️ Semantic HTML

### Use Proper HTML5 Elements

```tsx
// ✅ GOOD - Semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/products">Products</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Workshop Title</h1>
    <p>Description...</p>
  </article>
</main>

<footer>
  <p>&copy; 2026 Fermentfreude</p>
</footer>

// ❌ BAD - Div soup
<div class="header">
  <div class="nav">
    <div class="link">Products</div>
  </div>
</div>
```

### Heading Hierarchy

```tsx
// ✅ CORRECT - Logical h1 → h2 → h3
<h1>Fermentation Workshops</h1>
  <h2>Upcoming Workshops</h2>
    <h3>Tempeh Making</h3>
    <h3>Kimchi Mastery</h3>
  <h2>Past Workshops</h2>

// ❌ WRONG - Skipping levels
<h1>Workshops</h1>
<h4>Tempeh</h4> // Skipped h2 and h3!
```

### Landmarks

```tsx
<header role="banner">        // Site header
<nav role="navigation">       // Navigation
<main role="main">            // Main content
<aside role="complementary">  // Sidebar
<footer role="contentinfo">   // Site footer
<section aria-labelledby="section-title"> // Labeled sections
```

---

## 🎭 ARIA Implementation

### ARIA Labels

```tsx
// Navigation
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<nav aria-label="Social media links">
  <a href="#" aria-label="Follow us on Instagram">
    <InstagramIcon />
  </a>
</nav>

// Buttons with icons only
<button aria-label="Add to cart">
  <CartIcon />
</button>

// Search
<form role="search">
  <input 
    type="search" 
    aria-label="Search products and workshops"
  />
  <button aria-label="Submit search">
    <SearchIcon />
  </button>
</form>
```

### ARIA Live Regions

```tsx
// Cart updates
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  Item added to cart
</div>

// Form errors
<div 
  role="alert" 
  aria-live="assertive"
>
  Please enter a valid email address
</div>

// Loading states
<div 
  role="status" 
  aria-live="polite"
>
  Loading workshops...
</div>
```

### ARIA States

```tsx
// Expandable sections
<button 
  aria-expanded={isOpen}
  aria-controls="workshop-details"
>
  {isOpen ? 'Hide' : 'Show'} Details
</button>

<div id="workshop-details" aria-hidden={!isOpen}>
  Workshop information...
</div>

// Disabled buttons
<button 
  disabled 
  aria-disabled="true"
>
  Out of Stock
</button>

// Current page
<nav>
  <a href="/home">Home</a>
  <a href="/workshops" aria-current="page">Workshops</a>
</nav>
```

### ARIA Properties

```tsx
// Required fields
<input 
  type="email"
  aria-required="true"
  required
/>

// Input descriptions
<label htmlFor="email">Email</label>
<input 
  id="email"
  type="email"
  aria-describedby="email-help"
/>
<span id="email-help">
  We'll never share your email
</span>

// Invalid inputs
<input 
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Invalid email address
  </span>
)}
```

---

## ⌨️ Keyboard Navigation

### Focus Management

```tsx
// Custom focus styles (never remove outline!)
.button:focus,
.link:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

// Or custom visible focus
.button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);
  outline: none;
}
```

### Tab Order

```tsx
// Natural DOM order (best)
<form>
  <input tabIndex={0} /> // Default, follows DOM
  <button>Submit</button>
</form>

// Skip to main content
<a 
  href="#main-content" 
  className="skip-link"
>
  Skip to main content
</a>

<main id="main-content">
  ...
</main>

// Style skip link
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Interactive Elements

```tsx
// Modal/Dialog focus trap
import { useEffect, useRef } from 'react'

export const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    // Focus first focusable element
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
    
    // Trap focus inside modal
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
    
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

### Keyboard Shortcuts

```tsx
// ESC to close modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
  }
  
  return () => document.removeEventListener('keydown', handleEscape)
}, [isOpen, onClose])

// Enter/Space for custom buttons
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Custom Button
</div>
```

---

## 🔊 Screen Reader Support

### Descriptive Link Text

```tsx
// ❌ BAD - Generic text
<a href="/workshops">Click here</a>
<a href="/products">Read more</a>

// ✅ GOOD - Descriptive text
<a href="/workshops">View all fermentation workshops</a>
<a href="/products">Browse our tempeh products</a>

// ✅ GOOD - With context
<article>
  <h3>Tempeh Making Workshop</h3>
  <p>Learn to make tempeh...</p>
  <a href="/workshops/tempeh">
    Learn more about Tempeh Making Workshop
  </a>
</article>
```

### Hidden Content

```tsx
// Visually hidden but screen reader accessible
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Usage
<button>
  <CartIcon />
  <span className="visually-hidden">Add to cart</span>
</button>

// Hidden from everyone (including screen readers)
<div aria-hidden="true">
  Decorative element
</div>
```

### Announcements

```tsx
// Status messages
export const Announcement = ({ message, type = 'polite' }) => {
  return (
    <div
      role={type === 'assertive' ? 'alert' : 'status'}
      aria-live={type}
      aria-atomic="true"
      className="visually-hidden"
    >
      {message}
    </div>
  )
}

// Usage
<Announcement 
  message="Product added to cart" 
  type="polite" 
/>

<Announcement 
  message="Error: Please fill all required fields" 
  type="assertive" 
/>
```

---

## 🎨 Color & Contrast

### WCAG Contrast Requirements

**Level AA (Required):**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Color Palette

```scss
// src/app/_css/colors.scss

// Primary colors (ensure 4.5:1 on white)
$primary-green: #2D5016;      // ✅ 7.8:1 on white
$primary-brown: #8B4513;      // ✅ 5.2:1 on white

// Text colors
$text-dark: #1A1A1A;          // ✅ 16.0:1 on white
$text-medium: #4A4A4A;        // ✅ 9.7:1 on white
$text-light: #767676;         // ✅ 4.6:1 on white

// Check contrast: https://contrast-ratio.com
```

### Never Rely on Color Alone

```tsx
// ❌ BAD - Color only
<span style={{ color: 'red' }}>Required</span>

// ✅ GOOD - Color + text + icon
<span className="required">
  <IconRequired aria-hidden="true" />
  Required
</span>

// ❌ BAD - Color-coded status
<div style={{ backgroundColor: isAvailable ? 'green' : 'red' }} />

// ✅ GOOD - Text + icon + color
<div className={isAvailable ? 'available' : 'sold-out'}>
  {isAvailable ? (
    <>
      <CheckIcon aria-hidden="true" /> Available
    </>
  ) : (
    <>
      <XIcon aria-hidden="true" /> Sold Out
    </>
  )}
</div>
```

### Dark Mode Considerations

```scss
// Maintain contrast in dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #E0E0E0;      // ✅ 12.6:1 on #1A1A1A
    --bg-color: #1A1A1A;
    --link-color: #66B3FF;      // ✅ 5.2:1 on #1A1A1A
  }
}
```

---

## 📝 Forms & Inputs

### Form Structure

```tsx
// ✅ Accessible form
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Personal Information</legend>
    
    <div className="form-group">
      <label htmlFor="name">
        Full Name
        <span aria-label="required">*</span>
      </label>
      <input
        id="name"
        type="text"
        required
        aria-required="true"
        aria-describedby="name-help"
        aria-invalid={errors.name ? "true" : "false"}
      />
      <span id="name-help" className="help-text">
        First and last name
      </span>
      {errors.name && (
        <span id="name-error" role="alert" className="error">
          {errors.name}
        </span>
      )}
    </div>
  </fieldset>
  
  <button type="submit">
    Submit Registration
  </button>
</form>
```

### Input Types

```tsx
// Use appropriate input types
<input type="email" />        // Email keyboard on mobile
<input type="tel" />          // Phone keyboard
<input type="number" />       // Number keyboard
<input type="date" />         // Date picker
<input type="search" />       // Search with clear button
```

### Error Handling

```tsx
// ✅ Accessible error messages
export const FormField = ({ 
  label, 
  id, 
  error, 
  required,
  ...props 
}) => {
  const errorId = `${id}-error`
  
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <input
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      
      {error && (
        <span 
          id={errorId}
          role="alert"
          className="error-message"
        >
          {error}
        </span>
      )}
    </div>
  )
}
```

---

## 🖼️ Images & Media

### Alt Text

```tsx
// ✅ Descriptive alt text
<img 
  src="/tempeh.jpg" 
  alt="Golden brown tempeh slices arranged on wooden cutting board with fresh herbs"
/>

// ✅ Decorative images
<img 
  src="/pattern.svg" 
  alt="" 
  role="presentation"
/>

// ✅ Complex images with long description
<figure>
  <img 
    src="/fermentation-chart.jpg" 
    alt="Fermentation timeline chart"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    A detailed chart showing the fermentation process...
  </figcaption>
</figure>

// Next.js Image component
<Image
  src="/workshop.jpg"
  alt="Instructor demonstrating tempeh making technique to workshop participants"
  width={800}
  height={600}
/>
```

### Videos

```tsx
// ✅ Accessible video
<video 
  controls
  aria-label="Tempeh making tutorial"
>
  <source src="/video.mp4" type="video/mp4" />
  <track 
    kind="captions" 
    src="/captions-en.vtt" 
    srcLang="en" 
    label="English"
    default
  />
  <track 
    kind="captions" 
    src="/captions-de.vtt" 
    srcLang="de" 
    label="Deutsch"
  />
  Your browser doesn't support video.
</video>
```

### Icons

```tsx
// Decorative icons
<span aria-hidden="true">
  <Icon />
</span>

// Meaningful icons
<button>
  <Icon aria-label="Delete item" />
</button>

// Icon with text
<button>
  <Icon aria-hidden="true" />
  <span>Delete</span>
</button>
```

---

## 📱 Responsive Design

### Touch Targets

```scss
// Minimum 44x44px touch targets
button, 
a, 
input[type="checkbox"],
input[type="radio"] {
  min-width: 44px;
  min-height: 44px;
  
  // Or add padding
  padding: 12px 16px;
}
```

### Viewport

```tsx
// In layout.tsx
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Responsive Text

```scss
// Don't disable zoom
html {
  // ❌ BAD
  // user-scalable: no;
  
  // ✅ GOOD - Allow zoom
  -webkit-text-size-adjust: 100%;
}

// Use relative units
body {
  font-size: 16px;  // Base
}

h1 {
  font-size: 2rem;  // Scales with viewport
}
```

---

## 🧪 Testing Tools

### Automated Testing

```bash
# Install axe DevTools
# Chrome extension: axe DevTools

# Or use Lighthouse in Chrome DevTools
# Run audit → Accessibility category
```

### Manual Testing

**Keyboard only:**
1. Tab through entire site
2. Shift+Tab backwards
3. Enter/Space to activate
4. ESC to close modals
5. Arrow keys in custom widgets

**Screen reader:**
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free) or JAWS
- **Mobile:** TalkBack (Android) or VoiceOver (iOS)

### Testing Checklist

- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] All forms keyboard accessible
- [ ] All buttons have accessible names
- [ ] Color contrast ≥ 4.5:1
- [ ] No color-only information
- [ ] Focus indicators visible
- [ ] Skip to main content link
- [ ] ARIA labels on icon buttons
- [ ] Form errors announced
- [ ] Modal focus trapped
- [ ] Responsive zoom enabled
- [ ] Touch targets ≥ 44x44px

### Browser Testing

Test in:
- Chrome + VoiceOver (macOS)
- Firefox + NVDA (Windows)
- Safari + VoiceOver (macOS/iOS)
- Edge + JAWS (Windows)

---

## 📚 Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/
- **Contrast Checker:** https://contrast-ratio.com/
- **axe DevTools:** https://www.deque.com/axe/devtools/

---

**Last Updated:** February 12, 2026  
**Compliance Level:** WCAG 2.1 Level AA
