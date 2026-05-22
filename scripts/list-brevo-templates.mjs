#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = path.join(process.cwd())

function parseEnvFileValue(content, key) {
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*=\\s*(.*)$`)
    const m = t.match(re)
    if (!m) continue
    let val = m[1].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    return val || undefined
  }
  return undefined
}

function getBrevoApiKey() {
  if (process.env.BREVO_API_KEY) return process.env.BREVO_API_KEY
  for (const name of ['.env', '.env.local']) {
    try {
      const content = fs.readFileSync(path.join(root, name), 'utf8')
      const val = parseEnvFileValue(content, 'BREVO_API_KEY') || parseEnvFileValue(content, 'SENDINBLUE_API_KEY')
      if (val) return val
    } catch (e) {
      // ignore
    }
  }
  return undefined
}

async function fetchTemplates(apiKey) {
  const limit = 50
  let offset = 0
  let all = []
  while (true) {
    const url = `https://api.brevo.com/v3/smtp/templates?limit=${limit}&offset=${offset}`
    const res = await fetch(url, { headers: { accept: 'application/json', 'api-key': apiKey } })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Brevo API ${res.status}: ${txt}`)
    }
    const data = await res.json()
    const page = Array.isArray(data) ? data : (Array.isArray(data.templates) ? data.templates : (Array.isArray(data.data) ? data.data : []))
    if (!Array.isArray(page)) throw new Error('Unexpected Brevo response structure')
    all = all.concat(page)
    if (page.length < limit) break
    offset += limit
  }
  return all
}

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/\bv2\b/g, '').replace(/\bcopy\b/g, '').replace(/\bdraft\b/g, '').replace(/[^\w]+/g, ' ').trim()
}

;(async function main() {
  try {
    const args = process.argv.slice(2)
    const apply = args.includes('--apply')
    const confirm = args.includes('--yes') || args.includes('--confirm')

    const apiKey = getBrevoApiKey()
    if (!apiKey) {
      console.error('BREVO_API_KEY not found in .env or environment')
      process.exit(1)
    }

    console.log('Fetching templates from Brevo...')
    const templates = await fetchTemplates(apiKey)
    console.log(`Found ${templates.length} templates.`)

    const groups = {}
    for (const t of templates) {
      const name = t.templateName || t.name || t.subject || 'unnamed'
      const key = normalizeName(name)
      groups[key] = groups[key] || { displayName: name, templates: [] }
      groups[key].templates.push({
        id: t.id,
        name: name,
        subject: t.subject,
        isActive: t.isActive,
        tag: t.tag,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })
    }

    const canonicalV2 = [65,66,68,69,70,71,72,73,93]
    const proposals = []
    for (const [k, g] of Object.entries(groups)) {
      if (g.templates.length < 2) continue
      let keep = g.templates.find(x => canonicalV2.includes(x.id))
      if (!keep) keep = g.templates.find(x => x.isActive) || g.templates[0]
      const toDeactivate = g.templates.filter(x => x.id !== keep.id)
      proposals.push({ group: g.displayName, keep, toDeactivate })
    }

    if (proposals.length === 0) {
      console.log('No duplicate groups found.')
      process.exit(0)
    }

    console.log(JSON.stringify({ proposals }, null, 2))
    console.log('\n=== Human-friendly summary ===\n')
    for (const p of proposals) {
      console.log(`Group: ${p.group}`)
      console.log(`  Keep: #${p.keep.id} — ${p.keep.name} — active: ${p.keep.isActive}`)
      console.log('  Candidates to deactivate:')
      for (const d of p.toDeactivate) {
        console.log(`    - #${d.id} — ${d.name} — active: ${d.isActive}  tag: ${d.tag}`)
      }
      console.log('')
    }

    console.log('Proposal: For each group, keep the single template above and deactivate the others. No templates will be deleted; deactivated templates remain in your Brevo account as inactive copies.')

    if (!apply) {
      console.log('\nTo apply these changes: re-run with `--apply --yes`')
      process.exit(0)
    }

    if (!confirm) {
      console.log('\nSafety: confirm by adding `--yes` to the command (e.g. `--apply --yes`)')
      process.exit(1)
    }

    console.log('\nApplying deactivations now (this will NOT delete templates)\n')
    const failures = []
    for (const p of proposals) {
      for (const d of p.toDeactivate) {
        if (!d.isActive) {
          console.log(`#${d.id} already inactive — skipping`)
          continue
        }
        try {
          const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${d.id}`, {
            method: 'PUT',
            headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
            body: JSON.stringify({ isActive: false }),
          })
          if (!res.ok) {
            const txt = await res.text()
            console.error(`Failed to deactivate #${d.id}: ${res.status} ${txt}`)
            failures.push({ id: d.id, error: txt })
          } else {
            console.log(`Deactivated #${d.id} — ${d.name}`)
          }
        } catch (err) {
          console.error(`Error deactivating #${d.id}:`, err.message || err)
          failures.push({ id: d.id, error: String(err) })
        }
        // small delay to be gentle with the API
        await new Promise((r) => setTimeout(r, 250))
      }
    }

    console.log('\nDeactivation run complete.')
    if (failures.length) {
      console.log(`Failures: ${failures.length}`)
      console.log(JSON.stringify(failures, null, 2))
      process.exit(1)
    }

    process.exit(0)
  } catch (err) {
    console.error('ERROR:', err.message || err)
    process.exit(1)
  }
})()

