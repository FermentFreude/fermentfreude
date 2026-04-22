# Email Templates Setup Complete ✅

## What Changed

Your 19 email templates from `/public/email-templates` are now fully editable in the Payload CMS admin panel with live preview and Brevo sync.

## How It Works

### 1. **Admin Panel Access**
- Go to: `/admin` → **Brevo Templates**
- All 19 templates are listed with names in German (DE)
- Edit any template directly in the admin

### 2. **Live Preview**
- Click the **Preview** button while editing any template
- See what the email looks like with sample data
- Switch language with the locale dropdown (DE/EN)
- All Brevo variables like `{{ FIRST_NAME }}`, `{{ ORDER_NUMBER }}` are replaced with mock data

### 3. **Auto Sync to Brevo**
- When you click **Save** in the admin panel
- Changes automatically sync to Brevo via API
- Next time that email is sent, it uses your updated template
- All 19 emails are still 100% sent by Brevo (no custom rendering)

### 4. **Edit What You Want**
- ✏️ Change email subject line
- ✏️ Change HTML content (including images, colors, text)
- ✏️ Keep Brevo variables intact: `{{ FIRST_NAME }}`, `{{ WORKSHOP_DATE }}`, etc.
- ✏️ Add new images directly in the HTML

## 19 Templates Available

| ID | Template | Purpose |
|---|---|---|
| 27 | Konto erstellt | Welcome email when account created |
| 28 | Passwort zurücksetzen | Password reset link |
| 29 | Email bestätigen | Email verification link |
| 30 | Login-Benachrichtigung | Login notification |
| 31 | Workshop Bestätigung | Workshop booking confirmation |
| 32 | 7-Tage Reminder | Workshop reminder 7 days before |
| 33 | 1-Tag Reminder | Workshop reminder 1 day before |
| 34 | Workshop Follow-up | Follow-up after workshop ends |
| 35 | Feedback Anfrage | Request feedback after workshop |
| 36 | Bestellbestätigung | Order confirmation with items & total |
| 37 | Versandbenachrichtigung | Shipping/pickup notification |
| 38 | Review Anfrage | Request review after 14 days |
| 39 | Gutschein gekauft | Voucher purchase confirmation |
| 40 | Newsletter Willkommen | Newsletter signup welcome |
| 41 | Rückgewinnung | Re-engagement for inactive users |
| 42 | Warenkorb Erinnerung | Abandoned cart reminder |
| 43 | Kurs Anmeldung | Course enrollment confirmation |
| 44 | Referral Programm | Referral program notification |
| 45 | B2B Anfrage | B2B inquiry response |

## Brevo Variables Used

Each template can use these dynamic variables that Brevo replaces:

```
{{ FIRST_NAME }}              → Customer first name
{{ ORDER_NUMBER }}            → Order ID
{{ ITEMS }}                   → Product/workshop list
{{ TOTAL }}                   → Total price (€X,XX format)
{{ WORKSHOP_DATE }}           → Workshop date
{{ WORKSHOP_NAME }}           → Workshop title
{{ TRACKING_NUMBER }}         → Shipping tracking
{{ CARRIER }}                 → Carrier name (DHL, FedEx, UPS)
{{ ESTIMATED_DELIVERY }}      → Delivery time estimate
... and more
```

## Next Steps

1. **Edit a template**: Go to `/admin` → Brevo Templates
2. **Test preview**: Click "Preview" to see how it looks
3. **Make changes**: Edit HTML, change images, update text
4. **Save**: Click "Save" and changes sync to Brevo automatically
5. **Send test email**: Go to Brevo dashboard to test (or trigger real workflow)

## Architecture

```
Your HTML Files           Admin Panel              Brevo API
/public/email-templates → Payload CMS DB → Auto-sync → Send Emails
└─ 19 .html files       └─ Editable UI    (afterChange hook)
```

- **Source of truth**: Brevo (we sync TO Brevo, not FROM)
- **Edit location**: Payload CMS admin panel (like pages)
- **Sending**: 100% by Brevo (no custom rendering)
- **Images**: Reference them by URL in HTML (already set to https://pub-*.r2.dev/...)

## Important Notes

- **Do NOT change `{{ VARIABLE_NAMES }}`** - these must match what Brevo expects
- **Keep template ID the same** - don't edit brevoTemplateId field (it's readonly)
- **HTML must be valid email HTML** - test in preview before saving
- **Changes are live** - next email sent will use your updated template
- **Bilingual**: Currently seeded in DE, you can add EN translations via admin locale selector

## Troubleshooting

**Q: Template not showing in admin?**
- Make sure you're viewing `/admin/brevo-templates`
- Check that you're logged in as admin
- Refresh the page

**Q: Preview showing placeholder values?**
- That's expected! Preview uses mock data like "Max Mustermann" to visualize
- Real emails will have actual customer data

**Q: Changes not syncing to Brevo?**
- Check admin console for error messages
- Verify `BREVO_API_KEY` environment variable is set
- Check Brevo dashboard to see if template was updated

**Q: Want to edit images?**
- Currently images are embedded as URL references in the HTML
- To change an image: find the `<img src="..." />` tag and update the URL
- Or upload new image to R2 and update the URL
- Use Cloudflare R2 public URLs: https://pub-*.r2.dev/...
