#!/usr/bin/env node
/**
 * Render local previews of V2 templates with mock data substituted.
 * Output: /tmp/preview-{id}.html — open in browser to inspect.
 *
 * Uses a minimal Liquid renderer (handles {{ params.X | default: "Y" }} and
 * {% if params.X and params.X != "" %} ... {% else %} ... {% endif %}).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'email-templates', 'v2')

// Reuse MOCK from push script
const PUSH = readFileSync(path.join(__dirname, 'push-brevo-templates.mjs'), 'utf8')
const MOCK_MATCH = PUSH.match(/const MOCK = (\{[\s\S]+?\n\})\n\n/)
if (!MOCK_MATCH) throw new Error('Could not extract MOCK')
// eslint-disable-next-line no-eval
const MOCK = eval('(' + MOCK_MATCH[1] + ')')

function render(html, params) {
  let out = html

  // Handle {% if params.X and params.X != "" %} ... {% else %} ... {% endif %}
  out = out.replace(
    /\{%\s*if\s+params\.(\w+)\s+and\s+params\.\1\s*!=\s*""\s*%\}([\s\S]*?)(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/g,
    (_m, key, ifBlock, elseBlock = '') => {
      const v = params[key]
      return v && v !== '' ? ifBlock : elseBlock
    },
  )

  // Handle {{ params.X | default: "Y" }}
  out = out.replace(
    /\{\{\s*params\.(\w+)\s*(?:\|\s*default:\s*"([^"]*)")?\s*\}\}/g,
    (_m, key, fallback = '') => {
      const v = params[key]
      return v != null && v !== '' ? String(v) : fallback
    },
  )

  return out
}

const files = readdirSync(TEMPLATES_DIR)
  .filter((f) => f.endsWith('.html'))
  .sort()

for (const file of files) {
  const id = Number(file.split('-')[0])
  const params = MOCK[id]
  if (!params) {
    console.warn(`  ⚠️  no MOCK for ${file}, rendering with empty params`)
  }
  const html = readFileSync(path.join(TEMPLATES_DIR, file), 'utf8')
  const rendered = render(html, params || {})
  const out = `/tmp/preview-${id}.html`
  writeFileSync(out, rendered, 'utf8')
  console.log(`  ✓ ${out}  (${file})`)
}
console.log(`\nOpen any file with:  open /tmp/preview-65.html`)
