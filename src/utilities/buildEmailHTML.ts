/**
 * Build HTML email from Brevo template structured fields
 * Used by both the afterChange hook and preview endpoint
 */
export function buildEmailHTML(doc: any): string {
  const getImageUrl = (mediaDoc: any) => {
    if (!mediaDoc) return ''
    if (typeof mediaDoc === 'object' && 'url' in mediaDoc) {
      return mediaDoc.url
    }
    return mediaDoc as string
  }

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.subject || 'Email'}</title>
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${doc.headerBackgroundColor || '#1a1a1a'}; padding: 30px 20px; text-align: center; }
    .header img { max-width: 150px; height: auto; }
    .hero { text-align: center; padding: 40px 20px; background: #fafafa; }
    .hero img { max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 6px; }
    .hero h1 { font-size: 28px; margin-bottom: 12px; color: #1a1a1a; }
    .hero p { font-size: 16px; color: #595959; }
    .content { padding: 40px; }
    .content-block { margin-bottom: 30px; }
    .content-block img { max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 15px; }
    .cta-section { text-align: center; padding: 30px 20px; }
    .cta-button { display: inline-block; padding: 14px 40px; background: ${doc.ctaButton?.backgroundColor || '#e5b765'}; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; }
    .footer { background: #f5f5f5; padding: 30px 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .social-links { margin-top: 15px; }
    .social-links a { display: inline-block; margin: 0 10px; color: #999; text-decoration: none; }
    @media (max-width: 600px) {
      .content { padding: 20px; }
      .hero h1 { font-size: 20px; }
      .cta-button { display: block; }
    }
  </style>
</head>
<body>
  <div class="container">`

  // Header
  if (doc.headerImage) {
    const headerUrl = getImageUrl(doc.headerImage)
    if (headerUrl) {
      html += `<div class="header"><img src="${headerUrl}" alt="Logo" style="max-width: 150px;"></div>`
    }
  }

  // Hero
  if (doc.heroImage || doc.heroHeading || doc.heroSubheading) {
    html += `<div class="hero">`
    if (doc.heroImage) {
      const heroUrl = getImageUrl(doc.heroImage)
      if (heroUrl) {
        html += `<img src="${heroUrl}" alt="Hero">`
      }
    }
    if (doc.heroHeading) {
      html += `<h1>${doc.heroHeading}</h1>`
    }
    if (doc.heroSubheading) {
      html += `<p>${doc.heroSubheading}</p>`
    }
    html += `</div>`
  }

  // Content Blocks
  if (doc.contentBlocks && Array.isArray(doc.contentBlocks)) {
    html += `<div class="content">`
    for (const block of doc.contentBlocks) {
      html += buildContentBlock(block)
    }
    html += `</div>`
  }

  // CTA Button
  if (doc.ctaButton?.text && doc.ctaButton?.url) {
    html += `<div class="cta-section"><a href="${doc.ctaButton.url}" class="cta-button">${doc.ctaButton.text}</a></div>`
  }

  // Footer
  if (doc.footerText || (doc.footerSocialLinks && doc.footerSocialLinks.length > 0)) {
    html += `<div class="footer">`
    if (doc.footerText) {
      html += `<div>${doc.footerText}</div>`
    }
    if (doc.footerSocialLinks && doc.footerSocialLinks.length > 0) {
      html += `<div class="social-links">`
      for (const social of doc.footerSocialLinks) {
        const icons: Record<string, string> = {
          facebook: 'f',
          instagram: '@',
          linkedin: 'in',
          twitter: '𝕏',
        }
        html += `<a href="${social.url}">${icons[social.platform] || social.platform}</a>`
      }
      html += `</div>`
    }
    html += `</div>`
  }

  html += `</div>
</body>
</html>`

  return html
}

function buildContentBlock(block: any): string {
  if (block.blockType === 'text') {
    return `<div class="content-block">${block.text || ''}</div>`
  }
  if (block.blockType === 'image') {
    const imageUrl = getImageUrlSafe(block.image)
    if (!imageUrl) return ''
    return `<div class="content-block"><img src="${imageUrl}" alt="" style="max-width: 100%; height: auto;"></div>`
  }
  if (block.blockType === 'imageText') {
    const imageUrl = getImageUrlSafe(block.image)
    if (!imageUrl) return ''
    const textDiv = `<div style="flex: 1;">${block.text || ''}</div>`
    const imageDiv = `<div style="flex: 1;"><img src="${imageUrl}" alt="" style="max-width: 100%; height: auto;"></div>`
    const direction = block.imagePosition === 'left' ? 'row' : 'row-reverse'
    return `<div class="content-block" style="display: flex; gap: 20px; align-items: center; flex-direction: ${direction};">${block.imagePosition === 'left' ? imageDiv + textDiv : textDiv + imageDiv}</div>`
  }
  return ''
}

function getImageUrlSafe(mediaDoc: any): string {
  if (!mediaDoc) return ''
  if (typeof mediaDoc === 'string') return mediaDoc
  if (typeof mediaDoc === 'object' && mediaDoc.url) return mediaDoc.url
  return ''
}
