/**
 * Payload admin sets suppressHydrationWarning on <html> but not <body>.
 * Browser extensions (ColorZilla, Grammarly, etc.) inject attributes like
 * `cz-shortcut-listen` on <body>, causing React hydration warnings in /admin.
 *
 * Re-applied on postinstall because node_modules is not committed.
 */
import fs from 'fs'
import path from 'path'

const rootLayoutPath = path.join(
  process.cwd(),
  'node_modules/@payloadcms/next/dist/layouts/Root/index.js',
)

if (!fs.existsSync(rootLayoutPath)) {
  console.warn('[patch-payload-body-hydration] @payloadcms/next not found — skip')
  process.exit(0)
}

const marker = 'suppressHydrationWarning: config?.admin?.suppressHydrationWarning ?? false,\n      children: [/*#__PURE__*/_jsxs(RootProvider'

const headScriptMarker = 'id="payload-strip-extension-body-attrs"'

let content = fs.readFileSync(rootLayoutPath, 'utf8')

if (content.includes(marker) && content.includes(headScriptMarker)) {
  process.exit(0)
}

if (!content.includes(marker)) {
  const before = `_jsxs("body", {
      children: [/*#__PURE__*/_jsxs(RootProvider`

  const after = `_jsxs("body", {
      suppressHydrationWarning: config?.admin?.suppressHydrationWarning ?? false,
      children: [/*#__PURE__*/_jsxs(RootProvider`

  if (!content.includes(before)) {
    console.warn(
      '[patch-payload-body-hydration] Unexpected @payloadcms/next layout — manual check needed',
    )
    process.exit(0)
  }

  content = content.replace(before, after)
}

if (!content.includes(headScriptMarker)) {
  const headBefore = `children: [/*#__PURE__*/_jsx("head", {
      children: /*#__PURE__*/_jsx("style", {
        children: \`@layer payload-default, payload;\`
      })
    }), /*#__PURE__*/_jsxs("body", {`

  const headAfter = `children: [/*#__PURE__*/_jsxs("head", {
      children: [/*#__PURE__*/_jsx("style", {
        children: \`@layer payload-default, payload;\`
      }), /*#__PURE__*/_jsx("script", {
        id: "payload-strip-extension-body-attrs",
        dangerouslySetInnerHTML: {
          __html: "(function(){var a=['cz-shortcut-listen','data-new-gr-c-s-check-loaded','data-gr-ext-installed','data-new-gr-c-s-loaded'];function r(){if(document.body){a.forEach(function(k){document.body.removeAttribute(k);});}}r();document.addEventListener('DOMContentLoaded',r);})();"
        }
      })]
    }), /*#__PURE__*/_jsxs("body", {`

  if (!content.includes(headBefore)) {
    console.warn('[patch-payload-body-hydration] Could not inject head script — manual check needed')
  } else {
    content = content.replace(headBefore, headAfter)
  }
}

fs.writeFileSync(rootLayoutPath, content)
console.log('[patch-payload-body-hydration] Patched Payload admin hydration guards')
