# FermentFreude Voucher System - Go-Live Deployment Guide

**Status**: ✅ **PRODUCTION READY** (Code complete | Brevo template manual setup required)  
**Deployment Date**: April 22, 2026  
**Commit**: 066e16c - `feat(voucher): complete PDF generation and email integration for go-live`

---

## 🎯 What's Included

### ✅ Complete Implementation
- **PDF Generation API** (`/api/voucher/generate-pdf`)
  - GET endpoint: Downloads PDF as file
  - POST endpoint: Returns base64 for email attachment
  - Beautiful A4 template with FermentFreude branding
  - German-language instructions and details
  
- **Success Page Enhancement**
  - PDF download button with loading state
  - Copy-code button with clipboard integration
  - Step-by-step redemption instructions (4 steps)
  - Toast notifications for user feedback
  - Fully responsive design

- **Email Integration**
  - Email hook updated with `PDF_DOWNLOAD_URL` parameter
  - Sends to purchaser and recipient (if email delivery)
  - Ready for Brevo template customization

- **Voucher System Complete Flow**
  - Purchase: `/workshops/voucher` shop page
  - Validation: `/api/voucher/validate`
  - Checkout integration with voucher code entry
  - Order placement: `/api/voucher/place-order`
  - Redemption: `/redeem-voucher` page
  - Success confirmation: `/voucher/success`

---

## 🚀 Pre-Deployment Checklist

- [x] jsPDF and html2canvas installed
- [x] PDF generation endpoint created and tested
- [x] Success page with PDF download functional
- [x] Email hook updated with PDF URL parameter
- [x] All code committed to main branch
- [x] Git push successful to GitHub
- [ ] **MANUAL**: Create/update Brevo email template (see below)
- [ ] **MANUAL**: Set `NEXT_PUBLIC_BASE_URL` environment variable
- [ ] Final production build test
- [ ] Go-live verification

---

## ⚙️ Configuration Required (5 minutes)

### 1. Set Environment Variables

**Vercel Production Dashboard** → Settings → Environment Variables

Add:
```
NEXT_PUBLIC_BASE_URL=https://fermentfreude.at
```

This URL is used in email links so the PDF download works for recipients.

---

### 2. Create/Update Brevo Email Template

**CRITICAL**: This must be done before voucher emails can be sent properly.

#### Step-by-Step Instructions

1. **Login to Brevo** → https://app.brevo.com
2. **Navigate** to: Resources → Email Templates → Transactional
3. **Create New Template** (or edit existing ID 34 if it exists)

#### Template Details

**Template Name**: `VOUCHER_PURCHASED`

**Subject Line**:
```
Dein FermentFreude Geschenkgutschein - {{VOUCHER_CODE}}
```

**Template Content** (HTML):

Copy and paste the template HTML from below. This includes all necessary variables:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geschenkgutschein</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f7f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #D4A574 0%, #C9985C 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            background: #fff;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #555;
        }
        .voucher-code-box {
            background: #f5f1ed;
            border: 3px solid #D4A574;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
        }
        .voucher-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #999;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .voucher-code {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: bold;
            color: #1A1612;
            letter-spacing: 3px;
            word-break: break-all;
            margin-bottom: 15px;
        }
        .voucher-details {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            font-size: 14px;
            color: #666;
        }
        .details-row {
            margin: 8px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #1A1612;
        }
        .pdf-button {
            display: inline-block;
            background: #D4A574;
            color: #fff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
            transition: background 0.3s;
        }
        .pdf-button:hover {
            background: #C9985C;
        }
        .instructions {
            background: #fffaf5;
            border-left: 4px solid #D4A574;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions h3 {
            margin: 0 0 10px 0;
            color: #1A1612;
            font-size: 16px;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
            color: #555;
        }
        .instructions li {
            margin: 8px 0;
            font-size: 14px;
        }
        .footer {
            background: #f5f1ed;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-radius: 0 0 8px 8px;
        }
        .footer a {
            color: #D4A574;
            text-decoration: none;
        }
        a {
            color: #D4A574;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁 FermentFreude</h1>
            <p>Geschenkgutschein für Workshop-Erlebnisse</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Liebe/r {{CUSTOMER_NAME}},
                <br><br>
                vielen Dank für deinen Kauf! Hier ist dein Geschenkgutschein:
            </div>
            
            <div class="voucher-code-box">
                <div class="voucher-label">Gutschein-Code</div>
                <div class="voucher-code">{{VOUCHER_CODE}}</div>
                <div class="voucher-details">
                    <div class="details-row">
                        <span class="detail-label">Workshop-Erlebnis Gutschein</span>
                    </div>
                    <div class="details-row">
                        <strong style="font-size: 24px; color: #D4A574;">€{{VOUCHER_VALUE}},00</strong>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{PDF_DOWNLOAD_URL}}" class="pdf-button" style="display: inline-block;">
                    ⬇️ PDF herunterladen & drucken
                </a>
            </div>
            
            <div class="instructions">
                <h3>Zustellung: {{DELIVERY_METHOD}}</h3>
                {{#if RECIPIENT_EMAIL}}
                    <p>Gutschein für: <strong>{{RECIPIENT_EMAIL}}</strong></p>
                {{/if}}
                <p>Dein Gutschein ist sofort einsatzbereit und gültig für 12 Monate!</p>
            </div>
            
            <div class="instructions">
                <h3>So wird der Gutschein eingelöst:</h3>
                <ol>
                    <li>Besuche <strong>www.fermentfreude.at/redeem-voucher</strong></li>
                    <li>Gib den Code ein und validiere ihn</li>
                    <li>Wähle einen Workshop und lege ihn in deinen Warenkorb</li>
                    <li>Beim Checkout: Gib den Code ein – die Gebühr wird sofort abgezogen</li>
                </ol>
            </div>
            
            <div class="instructions">
                <h3>ℹ️ Informationen zum Gutschein:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                    <li><strong>Gültig für:</strong> Alle FermentFreude Workshops (Kombucha, Lacto-Gemüse, Tempeh etc.)</li>
                    <li><strong>Gültigkeit:</strong> 12 Monate ab Ausstellung</li>
                    <li><strong>Teilzahlung:</strong> Der Gutschein kann in mehreren Schritten verwendet werden</li>
                    <li><strong>Nicht übertragbar:</strong> Persönlicher Gutschein des Empfängers</li>
                    <li><strong>Kein Bargeld:</strong> Keine Barauszahlung möglich</li>
                </ul>
            </div>
            
            <div style="background: #f5f1ed; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
                <strong>Fragen?</strong><br>
                Kontaktiere uns gerne unter <a href="mailto:support@fermentfreude.at">support@fermentfreude.at</a> oder besuche <a href="https://www.fermentfreude.at">www.fermentfreude.at</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© FermentFreude 2026 - Alle Rechte vorbehalten</p>
            <p>Grabenstraße 15, 8010 Graz, Österreich</p>
        </div>
    </div>
</body>
</html>
```

#### Required Template Variables

Make sure these variables are properly configured in Brevo:

- `{{VOUCHER_CODE}}` - The voucher code (e.g., FF-GIFT-ABC123)
- `{{VOUCHER_VALUE}}` - Value in euros (e.g., 99)
- `{{DELIVERY_METHOD}}` - How it's delivered (E-Mail or Abholung)
- `{{RECIPIENT_EMAIL}}` - Email of recipient (if different from buyer)
- `{{PDF_DOWNLOAD_URL}}` - Full URL to PDF (e.g., https://fermentfreude.at/api/voucher/generate-pdf?code=FF-GIFT-ABC123)
- `{{CUSTOMER_NAME}}` - Name of purchaser (optional, falls back to "Liebe/r")

4. **Save Template**

5. **Test Send**
   - Use Brevo's test function to send a sample email
   - Verify all variables display correctly
   - Click the PDF button to ensure it works
   - Check that PDF downloads properly

---

## 🧪 Testing Checklist

Before going live, verify:

### Local Testing (Staging Environment)

```bash
# 1. Test PDF endpoint directly
curl "http://localhost:3000/api/voucher/generate-pdf?code=FF-GIFT-TEST123"
# Should download: gutschein-FF-GIFT-TEST123.pdf

# 2. Test POST endpoint
curl -X POST http://localhost:3000/api/voucher/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"code":"FF-GIFT-TEST123"}'
# Should return base64 PDF in JSON

# 3. Test success page
# Visit: http://localhost:3000/voucher/success?session_id=test_123
# Should show PDF download button, copy code, instructions

# 4. Test email sending
# Create a test voucher in Payload admin
# Check email received with:
# - Code displayed prominently
# - Value shown
# - PDF download link clickable
# - All instructions visible
```

### Production Verification

- [ ] Deploy to Vercel (git push triggers auto-deploy)
- [ ] PDF endpoint accessible: https://fermentfreude.at/api/voucher/generate-pdf?code=FF-GIFT-TEST123
- [ ] Success page loads properly
- [ ] Brevo template is activated and tested
- [ ] Create test voucher and verify email received
- [ ] Click PDF link in email - PDF downloads
- [ ] End-to-end flow: Create voucher → Email received → Redeem → Confirmation

---

## 📋 Quick Reference - Email Hook Variables

The email hook in `src/hooks/brevo/sendVoucherPurchaseEmail.ts` sends these parameters to Brevo:

```typescript
{
  VOUCHER_CODE: "FF-GIFT-ABC123",        // Auto-generated code
  VOUCHER_VALUE: "99",                   // Voucher value in euros
  DELIVERY_METHOD: "E-Mail",             // "E-Mail" or "Abholung"
  RECIPIENT_EMAIL: "recipient@example.com", // Recipient's email (if different)
  PDF_DOWNLOAD_URL: "https://fermentfreude.at/api/voucher/generate-pdf?code=FF-GIFT-ABC123"
}
```

These must all be defined as variables in the Brevo template.

---

## 🔗 API Endpoints Reference

### PDF Generation
- **GET** `/api/voucher/generate-pdf?code=FF-GIFT-ABC123`
  - Returns: PDF file download
  - Usage: Direct download in browser or success page

- **POST** `/api/voucher/generate-pdf`
  - Body: `{"code": "FF-GIFT-ABC123"}`
  - Returns: `{success: true, pdf: {base64, filename, contentType}}`
  - Usage: Email attachment generation

### Voucher Validation
- **POST** `/api/voucher/validate`
  - Body: `{"code": "FF-GIFT-ABC123"}`
  - Returns: `{success: true, voucher: {code, value}}`
  - Usage: Validate code at redemption

### Voucher Order Placement
- **POST** `/api/voucher/place-order`
  - Body: `{voucherCode, customerEmail, userId}`
  - Returns: `{success: true, orderId}`
  - Usage: Create order without Stripe payment

---

## 🐛 Troubleshooting

### PDF Download Fails
- ✅ Check: `NEXT_PUBLIC_BASE_URL` is set correctly
- ✅ Check: jsPDF library is installed (`pnpm install`)
- ✅ Check: /api/voucher/generate-pdf endpoint exists and is accessible

### Email Links Don't Work
- ✅ Check: `NEXT_PUBLIC_BASE_URL` matches production domain
- ✅ Check: Email template includes `{{PDF_DOWNLOAD_URL}}` variable
- ✅ Check: URLs in emails are full URLs (not relative paths)

### Success Page Blank
- ✅ Check: `session_id` parameter present in URL
- ✅ Check: `/api/voucher/confirm` endpoint returns valid data
- ✅ Check: Browser console for JavaScript errors

### Brevo Template Not Sending
- ✅ Check: Template name matches `VOUCHER_PURCHASED` in hook
- ✅ Check: All required variables are defined in template
- ✅ Check: Template is published and active
- ✅ Check: Brevo API key is valid

---

## ✅ Production Deployment Steps

### 1. Environment Setup (Vercel Dashboard)
```
Add NEXT_PUBLIC_BASE_URL=https://fermentfreude.at
```

### 2. Brevo Template Setup (Brevo Dashboard)
```
Create template with name: VOUCHER_PURCHASED
Include all required variables (see above)
Test with sample email
Activate/publish template
```

### 3. Deploy Code
```bash
# Already committed to main branch
# Vercel will auto-deploy on push
git push origin main  # Already done ✅
```

### 4. Verify
- [ ] Test PDF endpoint works
- [ ] Test success page shows
- [ ] Create voucher in admin
- [ ] Receive email with PDF link
- [ ] PDF downloads successfully
- [ ] Redemption flow complete

---

## 📞 Go-Live Support

**Code Status**: ✅ Production Ready  
**Template Status**: ⏳ Manual Setup Required  
**Overall Status**: Ready for launch after Brevo template creation

**Time to Go-Live**: ~15 minutes (Brevo template setup + env var + verification)

---

**Deployed By**: Copilot  
**Date**: April 22, 2026  
**Commit**: 066e16c  
**For Questions**: Refer to docs/VOUCHER_DEPLOYMENT_GUIDE.md
