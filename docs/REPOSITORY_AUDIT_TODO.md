# Repository Audit TODO

Created: 2026-03-13
Scope: `src/` follow-ups from latest implementation analysis.

## Priority 1 — Fix rule drift

- [ ] Replace direct `<img>` usage with `<Media resource={...} />` in [src/blocks/VoucherCta/Component.tsx](../src/blocks/VoucherCta/Component.tsx).
  - [ ] Gallery image currently uses direct `<img>`.
  - [ ] Background visual uses direct `<img>` and should be migrated to Media/managed asset pattern.

- [ ] Fix `seed-all` target mismatch in [src/scripts/seed-all.ts](../src/scripts/seed-all.ts).
  - [ ] `allOrder` includes `kombucha-phases`.
  - [ ] `scripts` map currently has no `kombucha-phases` entry.
  - [ ] Decide: add missing map entry or remove from `allOrder`.

## Priority 2 — Architecture alignment

- [ ] Review route strategy against project rule “dynamic `[slug]/page.tsx` for CMS pages”.
  - [ ] Assess dedicated route [src/app/(app)/gastronomy/page.tsx](../src/app/(app)/gastronomy/page.tsx).
  - [ ] Assess dedicated route [src/app/(app)/shop/page.tsx](../src/app/(app)/shop/page.tsx).
  - [ ] Confirm intentional exception vs. migrate to CMS-driven dynamic route.

## Priority 3 — Seed safety consistency

- [ ] Review remaining scripts that still call `payload.delete(...)` and classify safe vs risky use.
  - [ ] [src/scripts/seed-voucher-bg.ts](../src/scripts/seed-voucher-bg.ts)
  - [ ] [src/scripts/seed-placeholder-products.ts](../src/scripts/seed-placeholder-products.ts)
  - [ ] [src/scripts/seed-real-workshop-dates.ts](../src/scripts/seed-real-workshop-dates.ts)
  - [ ] [src/scripts/add-real-dates.ts](../src/scripts/add-real-dates.ts)
  - [ ] [src/scripts/patch-workshop-voucher-images.ts](../src/scripts/patch-workshop-voucher-images.ts)
  - [ ] [src/scripts/clean-old-carts.ts](../src/scripts/clean-old-carts.ts) (maintenance script; verify expected behavior)

- [ ] Remove/replace mutation-adjacent `Promise.all` usage in seed flows where possible.
  - [ ] Check [src/scripts/seed-kombucha.ts](../src/scripts/seed-kombucha.ts) and keep writes strictly sequential.

## Priority 4 — Validation pass after fixes

- [ ] Run: `pnpm generate:types`
- [ ] Run: `pnpm generate:importmap` (if component/schema touched)
- [ ] Run: `npx tsc --noEmit`
- [ ] Run targeted seeds (with/without `--force`) to verify non-destructive behavior.

## Notes

- Current touched files compile clean (no diagnostics in sampled edited files).
- Local command `timeout 90 ...` fails on macOS (`timeout` not installed by default); use plain command or `gtimeout` if needed.
