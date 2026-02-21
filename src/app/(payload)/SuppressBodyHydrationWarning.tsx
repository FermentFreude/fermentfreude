'use client'

import Script from 'next/script'

/**
 * Prevents browser extension hydration errors by removing extension-added attributes
 * from the body BEFORE React hydrates. Uses an inline script with beforeInteractive
 * so it runs before React, avoiding server/client HTML mismatches.
 *
 * Attributes like `cz-shortcut-listen` are added by browser extensions (e.g.,
 * ColorZilla, Grammarly, password managers) and cause "attributes didn't match" hydration errors.
 *
 * Runs removal aggressively (loop + MutationObserver) to catch extensions that inject late.
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
              }
            }
            removeAttrs();
            if (!document.body) {
              document.addEventListener('DOMContentLoaded', removeAttrs);
            }
            var count = 0;
            var raf = function() {
              removeAttrs();
              if (++count < 10) requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
            try {
              var observer = new MutationObserver(removeAttrs);
              if (document.body) {
                observer.observe(document.body, { attributes: true, attributeFilter: attrs });
              } else {
                document.addEventListener('DOMContentLoaded', function() {
                  if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: attrs });
                });
              }
              setTimeout(function() { observer.disconnect(); }, 2000);
            } catch (e) {}
          })();
        `,
      }}
    />
  )
}
