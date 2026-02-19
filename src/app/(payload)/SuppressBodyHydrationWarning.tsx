'use client'

import Script from 'next/script'

/**
 * Prevents browser extension hydration errors by removing extension-added attributes
 * from the body BEFORE React hydrates. Uses an inline script with beforeInteractive
 * so it runs before React, avoiding server/client HTML mismatches.
 *
 * Attributes like `cz-shortcut-listen` are added by browser extensions (e.g.,
 * password managers) and cause "attributes didn't match" hydration errors.
 */
export function SuppressBodyHydrationWarning() {
  return (
    <Script
      id="remove-extension-attributes"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var attrs = ['cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'data-new-gr-c-s-loaded'];
            function removeAttrs() {
              if (document.body) {
                attrs.forEach(function(a) { document.body.removeAttribute(a); });
              } else {
                requestAnimationFrame(removeAttrs);
              }
            }
            removeAttrs();
            document.addEventListener('DOMContentLoaded', removeAttrs);
          })();
        `,
      }}
    />
  )
}
