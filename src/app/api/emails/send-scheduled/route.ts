import { NextRequest, NextResponse } from 'next/server'

import { getPayload } from 'payload'

import { BREVO_TEMPLATES, sendTemplateEmail } from '@/lib/brevo'
import config from '@/payload.config'

/**
 * Scheduled Email Trigger Endpoint
 * POST /api/emails/send-scheduled
 *
 * This endpoint runs on a schedule (e.g., via Vercel Cron or external service)
 * to send time-based emails like reminders, follow-ups, and re-engagement campaigns.
 *
 * Supported Triggers:
 * 1. Workshop 7-Day Reminder (template 32)
 * 2. Workshop 1-Day Reminder (template 33)
 * 3. Post-Workshop Follow-up (template 34)
 * 4. Feedback Request (template 35)
 * 5. Review Request (template 38)
 * 6. Abandoned Cart (template 39)
 * 7. Re-engagement (template 43)
 */

async function sendScheduledEmails() {
  const payload = await getPayload({ config })

  const results = {
    sentCount: 0,
    errorCount: 0,
    errors: [] as string[],
  }

  try {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. WORKSHOP 7-DAY REMINDER (Template 32)
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const now = new Date()
      const sevenDaysAway = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Find workshops that are 7 days away and haven't had reminder sent
      const workshopsBookings = await payload.find({
        collection: 'workshop-bookings' as any,
        where: {
          and: [
            {
              'workshop.workshopDateTime': {
                greater_than_equal: new Date(sevenDaysAway.getTime() - 1 * 24 * 60 * 60 * 1000),
              },
            },
            {
              'workshop.workshopDateTime': {
                less_than: new Date(sevenDaysAway.getTime() + 1 * 24 * 60 * 60 * 1000),
              },
            },
            {
              'emailReminders.sent7DayReminder': { exists: false },
            },
          ],
        },
        depth: 2,
      })

      for (const booking of workshopsBookings.docs) {
        const bookingData = booking as unknown as Record<string, any>
        const userEmail = bookingData.guestEmail || bookingData.customer?.email || bookingData.email
        const firstName =
          bookingData.guestName?.split(' ')[0] ||
          bookingData.customer?.name?.split(' ')[0] ||
          'Participant'

        const workshopName = bookingData.workshop?.title ?? 'Workshop'

        if (userEmail) {
          await sendTemplateEmail({
            to: [{ email: userEmail, name: firstName }],
            templateId: BREVO_TEMPLATES.WORKSHOP_7DAY_REMINDER,
            params: {
              FIRST_NAME: firstName,
              WORKSHOP_NAME: workshopName,
              WORKSHOP_DATE: new Date(sevenDaysAway).toLocaleDateString('de-DE'),
              LOCATION: 'FermentFreude Workshop',
              JOIN_URL: `${process.env.NEXT_PUBLIC_SERVER_URL}/workshops/${bookingData.workshopSlug}`,
            },
          })

          // Mark as sent
          await payload.update({
            collection: 'workshop-bookings' as any,
            id: bookingData.id as string,
            data: {
              emailReminders: {
                ...(bookingData.emailReminders || {}),
                sent7DayReminder: new Date(),
              },
            },
            context: { skipRevalidate: true },
          })

          results.sentCount++
        }
      }
    } catch (error) {
      const msg = `7-Day Reminder: ${error instanceof Error ? error.message : String(error)}`
      results.errors.push(msg)
      results.errorCount++
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. WORKSHOP 1-DAY REMINDER (Template 33)
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

      const workshopsBookings = await payload.find({
        collection: 'workshop-bookings' as any,
        where: {
          and: [
            {
              'workshop.workshopDateTime': {
                greater_than_equal: new Date(tomorrow.getTime() - 12 * 60 * 60 * 1000),
              },
            },
            {
              'workshop.workshopDateTime': {
                less_than: new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000),
              },
            },
            {
              'emailReminders.sent1DayReminder': { exists: false },
            },
          ],
        },
        depth: 2,
      })

      for (const booking of workshopsBookings.docs) {
        const bookingData = booking as unknown as Record<string, any>
        const userEmail = bookingData.guestEmail || bookingData.customer?.email || bookingData.email
        const firstName =
          bookingData.guestName?.split(' ')[0] ||
          bookingData.customer?.name?.split(' ')[0] ||
          'Participant'

        const workshopName = bookingData.workshop?.title ?? 'Workshop'

        if (userEmail) {
          await sendTemplateEmail({
            to: [{ email: userEmail, name: firstName }],
            templateId: BREVO_TEMPLATES.WORKSHOP_1DAY_REMINDER,
            params: {
              FIRST_NAME: firstName,
              WORKSHOP_NAME: workshopName,
              WORKSHOP_DATE: new Date(tomorrow).toLocaleDateString('de-DE'),
              TIME: '18:00 Uhr',
              LOCATION: 'FermentFreude Workshop',
              JOIN_INSTRUCTIONS: 'Bitte 15 Minuten früher anmelden',
            },
          })

          // Mark as sent
          await payload.update({
            collection: 'workshop-bookings' as any,
            id: bookingData.id as string,
            data: {
              emailReminders: {
                ...(bookingData.emailReminders || {}),
                sent1DayReminder: new Date(),
              },
            },
            context: { skipRevalidate: true },
          })

          results.sentCount++
        }
      }
    } catch (error) {
      const msg = `1-Day Reminder: ${error instanceof Error ? error.message : String(error)}`
      results.errors.push(msg)
      results.errorCount++
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. POST-WORKSHOP FOLLOW-UP (Template 34) - 1 day after workshop
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)

      const workshopsBookings = await payload.find({
        collection: 'workshop-bookings' as any,
        where: {
          and: [
            {
              'workshop.workshopDateTime': {
                less_than_equal: yesterday,
              },
            },
            {
              'emailReminders.sentPostWorkshopFollowup': { exists: false },
            },
          ],
        },
        depth: 2,
      })

      for (const booking of workshopsBookings.docs) {
        const bookingData = booking as unknown as Record<string, any>
        const userEmail = bookingData.guestEmail || bookingData.customer?.email || bookingData.email
        const firstName =
          bookingData.guestName?.split(' ')[0] ||
          bookingData.customer?.name?.split(' ')[0] ||
          'Participant'

        const workshopName = bookingData.workshop?.title ?? 'Workshop'

        if (userEmail) {
          await sendTemplateEmail({
            to: [{ email: userEmail, name: firstName }],
            templateId: BREVO_TEMPLATES.POST_WORKSHOP_FOLLOWUP,
            params: {
              FIRST_NAME: firstName,
              WORKSHOP_NAME: workshopName,
              PHOTOS_GALLERY_URL: `${process.env.NEXT_PUBLIC_SERVER_URL}/gallery/${bookingData.workshopSlug}`,
              FEEDBACK_FORM_URL: `${process.env.NEXT_PUBLIC_SERVER_URL}/feedback/${bookingData.id}`,
              NEXT_WORKSHOP_RECOMMENDATION: 'Entdecke weitere Workshops',
            },
          })

          // Mark as sent
          await payload.update({
            collection: 'workshop-bookings' as any,
            id: bookingData.id as string,
            data: {
              emailReminders: {
                ...(bookingData.emailReminders || {}),
                sentPostWorkshopFollowup: new Date(),
              },
            },
            context: { skipRevalidate: true },
          })

          results.sentCount++
        }
      }
    } catch (error) {
      const msg = `Post-Workshop Follow-up: ${error instanceof Error ? error.message : String(error)}`
      results.errors.push(msg)
      results.errorCount++
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. FEEDBACK REQUEST (Template 35) - 7 days after workshop
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const workshopsBookings = await payload.find({
        collection: 'workshop-bookings' as any,
        where: {
          and: [
            {
              'workshop.workshopDateTime': {
                less_than_equal: sevenDaysAgo,
              },
            },
            {
              'emailReminders.sentFeedbackRequest': { exists: false },
            },
          ],
        },
        depth: 2,
      })

      for (const booking of workshopsBookings.docs) {
        const bookingData = booking as unknown as Record<string, any>
        const userEmail = bookingData.guestEmail || bookingData.customer?.email || bookingData.email
        const firstName =
          bookingData.guestName?.split(' ')[0] ||
          bookingData.customer?.name?.split(' ')[0] ||
          'Participant'

        const workshopName = bookingData.workshop?.title ?? 'Workshop'

        if (userEmail) {
          await sendTemplateEmail({
            to: [{ email: userEmail, name: firstName }],
            templateId: BREVO_TEMPLATES.FEEDBACK_REQUEST,
            params: {
              FIRST_NAME: firstName,
              WORKSHOP_NAME: workshopName,
              FEEDBACK_FORM_URL: `${process.env.NEXT_PUBLIC_SERVER_URL}/feedback/${bookingData.id}`,
              INCENTIVE: 'Erhalte einen 5% Rabatt auf deinen nächsten Workshop',
            },
          })

          // Mark as sent
          await payload.update({
            collection: 'workshop-bookings' as any,
            id: bookingData.id as string,
            data: {
              emailReminders: {
                ...(bookingData.emailReminders || {}),
                sentFeedbackRequest: new Date(),
              },
            },
            context: { skipRevalidate: true },
          })

          results.sentCount++
        }
      }
    } catch (error) {
      const msg = `Feedback Request: ${error instanceof Error ? error.message : String(error)}`
      results.errors.push(msg)
      results.errorCount++
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. REVIEW REQUEST (Template 38) - 14 days after order
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

      const orders = await payload.find({
        collection: 'orders' as any,
        where: {
          and: [
            {
              createdAt: {
                less_than_equal: twoWeeksAgo,
              },
            },
            {
              'emailTracking.sentReviewRequest': { exists: false },
            },
          ],
        },
        depth: 1,
      })

      for (const order of orders.docs) {
        const orderData = order as unknown as Record<string, any>
        const customerId = orderData.customer?.id || orderData.customerId
        let customerEmail: string | undefined
        let firstName = 'Valued Customer'

        if (customerId) {
          try {
            const user = await payload.findByID({
              collection: 'users',
              id: customerId as string,
              depth: 0,
            })
            customerEmail = user?.email
            firstName = (user?.name as string)?.split(' ')[0] || firstName
          } catch {
            customerEmail = undefined
          }
        } else if (orderData.customerEmail) {
          customerEmail = orderData.customerEmail
        }

        // Prefer the buyer-supplied name from checkout (guest flow)
        if (
          typeof orderData.customerName === 'string' &&
          orderData.customerName.trim().length > 0
        ) {
          firstName = orderData.customerName.trim().split(/\s+/)[0] || firstName
        }

        if (customerEmail) {
          const items = orderData.items as
            | Array<{ product?: string | Record<string, any> }>
            | undefined
          const itemTitles =
            items?.map((item) => {
              if (typeof item.product === 'object' && item.product?.title) {
                return (item.product as Record<string, any>).title
              }
              return 'Product'
            }) || []

          await sendTemplateEmail({
            to: [{ email: customerEmail, name: firstName }],
            templateId: BREVO_TEMPLATES.REVIEW_REQUEST,
            params: {
              FIRST_NAME: firstName,
              ORDER_NUMBER: String(orderData.id),
              PRODUCTS: itemTitles.join(', '),
              REVIEW_LINK: `${process.env.NEXT_PUBLIC_SERVER_URL}/reviews/${orderData.id}`,
              INCENTIVE: 'Schreibe eine Bewertung und gewinne einen €50 Gutschein',
            },
          })

          // Mark as sent
          await payload.update({
            collection: 'orders' as any,
            id: orderData.id as string,
            data: {
              emailTracking: {
                ...(orderData.emailTracking || {}),
                sentReviewRequest: new Date(),
              },
            },
            context: { skipRevalidate: true },
          })

          results.sentCount++
        }
      }
    } catch (error) {
      const msg = `Review Request: ${error instanceof Error ? error.message : String(error)}`
      results.errors.push(msg)
      results.errorCount++
    }

    payload.logger.info(
      `[Scheduled Emails] Sent: ${results.sentCount}, Errors: ${results.errorCount}`,
    )
    if (results.errors.length > 0) {
      payload.logger.error(`[Scheduled Emails] Errors: ${results.errors.join(' | ')}`)
    }
  } catch (error) {
    payload.logger.error(
      `[Scheduled Emails] Fatal error: ${error instanceof Error ? error.message : String(error)}`,
    )
    results.errorCount++
    results.errors.push(String(error))
  }

  return results
}

export async function POST(req: NextRequest) {
  // Scheduled/reminder emails are temporarily disabled until V2 templates ship.
  // Only essential confirmation emails (booking, order, voucher) are active in production.
  // The block below is preserved (not deleted) so it can be re-enabled by flipping the flag.
  const SCHEDULED_EMAILS_ENABLED = false

  if (!SCHEDULED_EMAILS_ENABLED) {
    return NextResponse.json(
      { disabled: true, message: 'Scheduled emails temporarily disabled' },
      { status: 200 },
    )
  }

  // Verify request is from Vercel Cron or authorized source
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await sendScheduledEmails()
    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
