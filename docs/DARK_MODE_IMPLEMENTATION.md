# Dark Mode Implementation Plan — FermentFreude

## Scope

Complete dark mode pass across all pages and components. Dark mode is triggered by `data-theme="dark"` on `<html>` (set by `ThemeProvider`). Tailwind's `dark:` variant maps to `@custom-variant dark (&:is([data-theme='dark'] *))`.

**Rules:**
- White text on black background in dark mode
- Gold/yellow titles (`#e6be68`) work as-is in both modes
- NEVER change light mode — only add `dark:` variants
- WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text/UI
- No layout changes whatsoever

---

## Color Palette

| Light value | Dark replacement | Tailwind class |
|---|---|---|
| `#ffffff` / `bg-white` | `#111111` | `dark:bg-[#111111]` |
| `#f9f0dc` / `#F6F0E8` (ivory/cream) | `#111111` | `dark:bg-[#111111]` |
| `#ece5de` (warm-gray) | `#1a1a1a` | `dark:bg-[#1a1a1a]` |
| `#f2ebe2` (legal bg) | `#0d0d0d` | CSS override |
| `#fffdfb` (legal card bg) | `#1a1a1a` | CSS override |
| `#1d1d1d` / `#1a1a1a` / black (text) | `#ffffff` | `dark:text-white` |
| `#595959` / `#6b6b6b` (muted text) | `rgba(255,255,255,0.6)` | `dark:text-white/60` |
| `#7a6651` / `#7a6753` (warm-tan text) | `rgba(255,255,255,0.4)` | `dark:text-white/40` |
| `#e8dfd3` / `#e8e4d9` (border) | `rgba(255,255,255,0.1)` | `dark:border-white/10` |
| `#e6be68` (gold) | `#e6be68` (unchanged) | — |
| Cards on light bg | `#1e1e1e` | `dark:bg-[#1e1e1e]` |
| Input fields | `#1a1a1a` border `white/20` | `dark:bg-[#1a1a1a] dark:border-white/20` |
| Links (blue `#1a3f8a`) | `#93b4ff` | CSS override |

---

## File-by-File Checklist

### Phase 1: CSS tokens + base
- [ ] `src/app/(app)/globals.css` — Add brand token dark overrides in `[data-theme='dark']`; fix `.page-legal` / `.legal-richtext`

### Phase 2: Footer + Header
- [ ] `src/components/Footer/index.tsx`
- [ ] `src/components/Footer/FooterBrand.tsx`
- [ ] `src/components/Header/index.client.tsx`
- [ ] `src/components/Header/MobileMenu.tsx`
- [ ] `src/components/Header/AnnouncementBar.tsx`
- [ ] `src/components/Header/NavDropdown.tsx`
- [ ] `src/components/Header/CartIconButton.tsx`
- [ ] `src/components/Header/LanguageToggle.tsx`
- [ ] `src/components/Header/UserMenu.tsx`

### Phase 3: Blocks
- [ ] `src/blocks/WorkshopSlider/Component.tsx`
- [ ] `src/blocks/HeroBanner/Component.tsx`
- [ ] `src/blocks/FeatureCards/Component.tsx`
- [ ] `src/blocks/FeaturedProductCards/Component.tsx`
- [ ] `src/blocks/ReadyToLearnCTA/Component.tsx`
- [ ] `src/blocks/OurStory/Component.tsx`
- [ ] `src/blocks/TeamCards/Component.tsx`
- [ ] `src/blocks/TeamPreview/Component.tsx`
- [ ] `src/blocks/SponsorsBar/Component.tsx`
- [ ] `src/blocks/ContactBlock/Component.tsx`
- [ ] `src/blocks/ProductSlider/Component.tsx`
- [ ] `src/blocks/VoucherCta/Component.tsx`
- [ ] `src/blocks/CollectionGrid/Component.tsx`
- [ ] `src/blocks/WorkshopPhases/Component.tsx`
- [ ] `src/blocks/ShopHero/Component.tsx`
- [ ] `src/blocks/ShopProductGrid/Component.tsx`
- [ ] `src/blocks/ShopProductList/ShopProductListClient.tsx`
- [ ] `src/blocks/ShopProductList/ProductQuickView.tsx`
- [ ] `src/blocks/OnlineCourseSlider/Component.tsx`
- [ ] `src/blocks/CourseWaitlistCta/Component.tsx`
- [ ] `src/blocks/CourseWaitlistCta/CourseWaitlistCtaInner.tsx`
- [ ] `src/blocks/CourseWaitlistCta/WaitlistForm.tsx`

### Phase 4: Workshop pages + components
- [ ] `src/app/(app)/workshops/[slug]/WorkshopDetailClient.tsx`
- [ ] `src/app/(app)/workshops/[slug]/BookingModal.tsx`
- [ ] `src/app/(app)/workshops/[slug]/LaktoHero.tsx`
- [ ] `src/app/(app)/workshops/[slug]/LaktoCalendar.tsx`
- [ ] `src/app/(app)/workshops/[slug]/LaktoBookingCard.tsx`
- [ ] `src/app/(app)/workshops/[slug]/LaktoVoucherCta.tsx`
- [ ] `src/app/(app)/workshops/[slug]/LaktoFAQ.tsx`
- [ ] `src/app/(app)/workshops/[slug]/KombuchaHero.tsx`
- [ ] `src/app/(app)/workshops/[slug]/KombuchaBookingCard.tsx`
- [ ] `src/app/(app)/workshops/[slug]/KombuchaVoucherCta.tsx`
- [ ] `src/app/(app)/workshops/[slug]/KombuchaFAQ.tsx`
- [ ] `src/app/(app)/workshops/[slug]/TempehHero.tsx`
- [ ] `src/app/(app)/workshops/[slug]/TempehBookingCard.tsx`
- [ ] `src/app/(app)/workshops/[slug]/TempehVoucherCta.tsx`
- [ ] `src/app/(app)/workshops/[slug]/TempehFAQ.tsx`
- [ ] `src/app/(app)/workshops/voucher/page.tsx`
- [ ] `src/app/(app)/workshops/voucher/VoucherHero.tsx`
- [ ] `src/app/(app)/workshops/voucher/VoucherBenefitsSection.tsx`
- [ ] `src/app/(app)/workshops/voucher/VoucherAboutSection.tsx`
- [ ] `src/app/(app)/workshops/voucher/VoucherWhySection.tsx`
- [ ] `src/app/(app)/workshops/voucher/VoucherHowSection.tsx`
- [ ] `src/app/(app)/workshops/voucher/FAQSection.tsx`
- [ ] `src/app/(app)/workshops/voucher/StarterSetSection.tsx`
- [ ] `src/components/workshops/WorkshopTypesSlider.tsx`
- [ ] `src/components/workshops/AllWorkshopsHero.tsx`
- [ ] `src/components/workshops/FAQSliderSection.tsx`
- [ ] `src/components/workshops/WorkshopBookingSection.tsx`
- [ ] `src/components/workshops/WorkshopTermineSection.tsx`
- [ ] `src/components/workshops/WorkshopCalendar.tsx`
- [ ] `src/components/workshops/WhyOnlineSection.tsx`
- [ ] `src/components/workshops/GiftAndOnlineSection.tsx`
- [ ] `src/components/workshops/LearnOnlineSection.tsx`
- [ ] `src/components/workshops/TeamBuildingSection.tsx`

### Phase 5: Shop pages + components
- [ ] `src/components/shop/ShopHero.tsx`
- [ ] `src/components/shop/ShopHeroSlider.tsx`
- [ ] `src/components/shop/ShopProductCard.tsx`
- [ ] `src/components/shop/ShopProductSection.tsx`
- [ ] `src/components/shop/ShopGiftSection.tsx`
- [ ] `src/components/shop/ShopFeaturedSection.tsx`
- [ ] `src/components/shop/ShopWorkshopCta.tsx`
- [ ] `src/components/shop/ShopBenefitsSection.tsx`
- [ ] `src/components/product/ProductDetailPage.tsx`
- [ ] `src/components/product/CourseProductPage.tsx`
- [ ] `src/components/Grid/tile.tsx`
- [ ] `src/components/Grid/Label.tsx`

### Phase 6: Account + auth pages
- [ ] `src/app/(app)/account/layout.tsx`
- [ ] `src/app/(app)/account/page.tsx`
- [ ] `src/app/(app)/account/orders/page.tsx`
- [ ] `src/app/(app)/account/order-confirmation/page.tsx`
- [ ] `src/app/(app)/account/profile/page.tsx`
- [ ] `src/app/(app)/account/addresses/page.tsx`
- [ ] `src/app/(app)/account/learning/page.tsx`
- [ ] `src/app/(app)/account/downloads/page.tsx`
- [ ] `src/app/(app)/account/reviews/page.tsx`
- [ ] `src/app/(app)/account/cancellations/page.tsx`
- [ ] `src/app/(app)/account/return-requests/page.tsx`
- [ ] `src/app/(app)/account/payment-methods/page.tsx`
- [ ] `src/app/(app)/account/shipping-methods/page.tsx`
- [ ] `src/components/dashboard/AccountSidebar.tsx`
- [ ] `src/components/dashboard/EditAddressModal.tsx`
- [ ] `src/app/(app)/login/page.tsx`
- [ ] `src/app/(app)/create-account/page.tsx`
- [ ] `src/app/(app)/recover-password/page.tsx`
- [ ] `src/components/forms/LoginForm/index.tsx`
- [ ] `src/components/forms/CreateAccountForm/index.tsx`

### Phase 7: Other pages + components
- [ ] `src/app/(app)/fermentation/page.tsx`
- [ ] `src/app/(app)/fermentation/FaqAccordion.tsx`
- [ ] `src/app/(app)/fermentation/PracticeAccordion.tsx`
- [ ] `src/app/(app)/fermentation/DangerAccordion.tsx`
- [ ] `src/app/(app)/fermentation/WhySection.tsx`
- [ ] `src/components/fermentation/FermentationHero.tsx`
- [ ] `src/components/fermentation/FermentedVegHowTos.tsx`
- [ ] `src/components/fermentation/FermentKalender.tsx`
- [ ] `src/app/(app)/gastronomy/page.tsx`
- [ ] `src/components/gastronomy/GastronomyProductSlider.tsx`
- [ ] `src/components/gastronomy/GastronomyOfferCards.tsx`
- [ ] `src/app/(app)/courses/page.tsx`
- [ ] `src/app/(app)/courses/basic-fermentation/page.tsx`
- [ ] `src/app/(app)/courses/basic-fermentation/CurriculumWithProgress.tsx`
- [ ] `src/app/(app)/courses/basic-fermentation/StickyCurriculumBar.tsx`
- [ ] `src/components/courses/CourseCard.tsx`
- [ ] `src/components/courses/LessonList.tsx`
- [ ] `src/components/courses/NotifyMeDialog.tsx`
- [ ] `src/app/(app)/voucher/success/VoucherSuccessClient.tsx`
- [ ] `src/app/(app)/redeem-voucher/RedeemVoucherClient.tsx`
- [ ] `src/app/(app)/tipps/[slug]/ArticleDetailClient.tsx`

### Phase 8: Cart + Checkout + UI components
- [ ] `src/components/Cart/CartModal.tsx`
- [ ] `src/components/Cart/DeleteItemButton.tsx`
- [ ] `src/components/checkout/CheckoutPage.tsx`
- [ ] `src/components/Search/index.tsx`
- [ ] `src/components/ui/FAQCard.tsx`
- [ ] `src/components/ui/ContentSection.tsx`
- [ ] `src/components/ui/CTABanner.tsx`
- [ ] `src/components/ui/FeatureCard.tsx`
- [ ] `src/components/layout/search/filter/FilterItemDropdown.tsx`
- [ ] `src/components/layout/search/Categories.tsx`
- [ ] `src/components/CategoryTabs/index.tsx`
- [ ] `src/components/CategoryTabs/Item.tsx`
- [ ] `src/components/WorkshopCardsSection.tsx`
- [ ] `src/components/WorkshopCardButton.tsx`
- [ ] `src/components/OpeningPopups.tsx`

---

## Accessibility Notes
- Contrast check all dark mode color pairs before merging
- White (#fff) on #111 = ~21:1 ✅
- Gold (#e6be68) on #111 = ~7.4:1 ✅ large text
- white/60 on #111 = ~7.3:1 ✅
- white/40 on #111 = ~4.5:1 ✅ (borderline for normal text — use only for decorative/muted)

## Commit Strategy
Single commit: `feat: complete dark mode implementation` after all files done + `npx tsc --noEmit` passes.
