# Brevo Email Templates - Admin Guide

## Overview

FermentFreude now has a unified email template editing system. All 19 Brevo email templates can be edited directly in the Payload CMS admin dashboard, just like editing pages.

- ✅ **19 templates** all managed in `/admin`
- ✅ **Live sync to Brevo** - changes go directly to Brevo's servers
- ✅ **100% sent by Brevo** - no custom rendering, all emails sent via Brevo API
- ✅ **Bilingual** - edit German (DE) and English (EN) versions separately
- ✅ **Status tracking** - see if templates are synced, pending, or have errors

## How to Edit a Template

### Step 1: Access Templates in Admin
1. Go to `https://fermentfreude.vercel.app/admin` (or staging/local)
2. In the left sidebar, click **Brevo Templates**
3. You'll see a list of all email templates by category

### Step 2: Select a Template
Click on any template to edit it. You'll see these fields:

| Field | Purpose | Example |
|-------|---------|---------|
| **Template Name** | Display name in admin | "Order Confirmation" |
| **Trigger Description** | When is this email sent? | "Sent immediately after order placed" |
| **Subject** | Email subject line | `Order #{{ ORDER_NUMBER }} confirmed` |
| **HTML Content** | Full email HTML body | `<h1>Hello {{ FIRST_NAME }}</h1>...` |
| **Is Active** | Enable/disable in Brevo | Checked (enabled) |

### Step 3: Use Brevo Variables
In the **Subject** and **HTML Content** fields, use dynamic variables like:

```
{{ FIRST_NAME }}              # Customer first name
{{ ORDER_NUMBER }}            # Order ID
{{ TOTAL }}                   # Total price (formatted)
{{ SHIPPING_ADDRESS }}        # Full shipping address
{{ WORKSHOP_NAME }}           # Workshop title
{{ WORKSHOP_DATE }}           # Workshop date
{{ WORKSHOP_TIME }}           # Workshop time
```

These are **replaced by Brevo** when the email is sent, not by the CMS.

### Step 4: Save Changes
1. Edit the subject or HTML content
2. Click **Save**
3. Changes are **instantly synced to Brevo** (you'll see the sync status update)

### Sync Status

After you click Save, the template's sync status will update:

| Status | Meaning | Action |
|--------|---------|--------|
| **In Sync** | Template updated successfully in Brevo | ✅ Your changes are live |
| **Pending Sync** | Waiting to sync to Brevo | ⏳ Usually fast (< 5 seconds) |
| **Error** | Sync failed - check the sync error message | ❌ Fix and try again |

If you see an error, the reason will be shown in the **Sync Error** field. Common errors:
- **Invalid HTML** - Your HTML has syntax errors
- **API limit exceeded** - Brevo rate limit (wait a minute, try again)
- **Missing required field** - Subject is empty

## Example: Editing Order Confirmation

**Current:**
```html
Subject: Bestellung #{{ ORDER_NUMBER }} bestätigt

Body:
<h2>Hallo {{ FIRST_NAME }},</h2>
<p>Danke für deine Bestellung!</p>
<p>Gesamtbetrag: {{ TOTAL }}</p>
```

**Want to change it to:**
```html
Subject: Danke! Bestellung #{{ ORDER_NUMBER }} erhalten ✓

Body:
<h2>Hallo {{ FIRST_NAME }},</h2>
<p>Wir haben deine Bestellung erhalten! 🎉</p>
<p>Vielen Dank für deinen Einkauf.</p>
<p><strong>Gesamtbetrag: {{ TOTAL }}</strong></p>
<p>Du erhältst bald eine Versandbenachrichtigung.</p>
```

**Steps:**
1. Go to `/admin` → Brevo Templates → Order Confirmation (DE)
2. Edit the Subject field
3. Edit the HTML Content field
4. Click Save
5. Wait for "In Sync" status (~ 2-3 seconds)
6. Done! Next customer order will use the new template

## Template Categories

### 1. **Account Management** (4 templates)
- Account Creation Email
- Password Reset
- Email Verification
- Account Updated

### 2. **Workshop Emails** (5 templates)
- Workshop Confirmation
- 7-Day Reminder
- 1-Day Reminder
- Post-Workshop Follow-up
- Feedback Request

### 3. **E-commerce Emails** (4 templates)
- Order Confirmation
- Shipping Notification
- Delivery Confirmation
- Return/Refund

### 4. **Marketing Emails** (5 templates)
- Newsletter Signup Confirmation
- Review Request
- Upsell / Abandoned Cart
- Loyalty Program
- Special Offers

### 5. **Custom** (1 template)
- Contact Form Response

## Bilingual Templates

Each template has **German (DE)** and **English (EN)** versions.

- **German** = Default version, sent to customers in DE region
- **English** = Sent to EN region customers

Edit both versions separately:
1. Click the template (defaults to DE)
2. Make changes to German version
3. Click the language selector at top → **English**
4. Make equivalent changes to English version
5. Both are synced together

## Important Notes

### ⚠️ Do NOT:
- Delete templates (if deleted, you must recreate them in Brevo)
- Change the Brevo Template ID (it links to Brevo's system)
- Use variables that don't exist (Brevo won't replace them)
- Use HTML tags that break email clients (test before saving)

### ✅ Do:
- Keep subject lines short (< 70 characters for best display)
- Use customer-friendly language
- Test complex HTML in email client before saving
- Preview templates in Brevo dashboard if unsure
- Ask David or Marcel before major changes

## Troubleshooting

### "Sync Error: Invalid HTML"
Your HTML has syntax errors. Common issues:
- Unclosed tags: `<p>` without `</p>`
- Invalid characters: `&` instead of `&amp;`
- Missing quotes: `<a href=url>` should be `<a href="url">`

**Fix:** Copy/paste the old HTML back, make smaller changes, test again.

### "Sync Status: Pending" (stuck for > 30 seconds)
The sync is taking longer than usual. Possible causes:
- Network connectivity issue
- Brevo API is slow
- Payload CMS is processing

**Fix:** Wait 1 minute, refresh the page. If still stuck, contact David.

### "Sync Status: Error" (keeps failing)
Brevo API rejected the changes. Possible causes:
- Subject line is empty
- HTML uses Brevo variables incorrectly
- Brevo account issue (contact Brevo support)

**Fix:** Check the error message, correct the issue, save again.

## FAQ

**Q: Do I need to know HTML to edit templates?**
A: Not really. You can make simple changes (text, links, colors) without HTML knowledge. For complex changes, ask your developer.

**Q: When do changes go live?**
A: Instantly after you click Save (usually < 5 seconds). New emails sent after the sync will use the updated template.

**Q: Can I preview the email before saving?**
A: Not in the Payload admin yet. You can preview in Brevo dashboard directly.

**Q: What if I make a mistake?**
A: You can always revert the change by copying the old text back. Changes are instant, so there's no "undo" — only manual revert.

**Q: Can I add new templates?**
A: No, templates are created in Brevo and then registered in the admin. To add a new template, contact David.

**Q: Do these templates work in multiple languages?**
A: Yes! German (DE) and English (EN) templates are separate. Brevo sends the correct language based on customer locale.

---

**Questions?** Contact David or Marcel. They're the owners! 🚀
