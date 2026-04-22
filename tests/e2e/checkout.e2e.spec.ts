import { expect, test } from '@playwright/test'

type CheckoutUser = {
  email: string
  id: string
}

type MockCart = {
  createdAt: string
  currency: 'EUR'
  id: string
  items: Array<{
    id: string
    product: {
      courseSlug?: string
      gallery?: Array<{ image: null }>
      id: string
      meta?: { image?: null } | null
      priceInEUR: number
      productType?: string
      slug: string
      title: string
    }
    quantity: number
  }>
  secret: string
  status: 'active'
  subtotal: number
  updatedAt: string
}

function createDigitalCourseCart(overrides: Partial<MockCart> = {}): MockCart {
  return {
    createdAt: '2026-04-20T10:00:00.000Z',
    currency: 'EUR',
    id: 'cart_test_1',
    items: [
      {
        id: 'item_test_1',
        product: {
          courseSlug: 'fermentation-basics',
          gallery: [],
          id: 'product_test_1',
          meta: null,
          priceInEUR: 9900,
          productType: 'digital-course',
          slug: 'fermentation-basics-course',
          title: 'Fermentation Basics Course',
        },
        quantity: 1,
      },
    ],
    secret: 'cart_secret_test_1',
    status: 'active',
    subtotal: 9900,
    updatedAt: '2026-04-20T10:00:00.000Z',
    ...overrides,
  }
}

async function stubStripeBrowser(page: import('@playwright/test').Page) {
  await page.route('https://js.stripe.com/**', async (route) => {
    await route.fulfill({
      body: `
        window.Stripe = function Stripe() {
          return {
            _registerWrapper() {},
            elements() {
              return {
                create() {
                  return {
                    blur() {},
                    clear() {},
                    destroy() {},
                    focus() {},
                    mount() {},
                    off() {},
                    on() {},
                    unmount() {},
                    update() {},
                  };
                },
                getElement() { return null; },
                off() {},
                on() {},
                submit() { return Promise.resolve({}); },
                update() {},
              };
            },
            confirmPayment() {
              return Promise.resolve({ paymentIntent: { id: 'pi_test_123', status: 'succeeded' } });
            },
          };
        };
      `,
      contentType: 'application/javascript',
      status: 200,
    })
  })
}

async function stubCheckoutApi(
  page: import('@playwright/test').Page,
  {
    cart,
    initiationBodies,
    loggedInUser,
  }: {
    cart: MockCart
    initiationBodies: Array<Record<string, unknown>>
    loggedInUser: CheckoutUser | null
  },
) {
  await page.route('**/api/users/me**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        user: loggedInUser
          ? {
              cart: {
                docs: [{ id: cart.id }],
              },
              email: loggedInUser.email,
              id: loggedInUser.id,
            }
          : null,
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/addresses**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ docs: [] }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/carts/**', async (route) => {
    await route.fulfill({
      body: JSON.stringify(cart),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/payments/stripe/initiate', async (route) => {
    initiationBodies.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({
      body: JSON.stringify({
        clientSecret: 'pi_test_123_secret_456',
        message: 'Payment initiated successfully',
        paymentIntentID: 'pi_test_123',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

}

async function seedGuestCart(page: import('@playwright/test').Page, cart: MockCart) {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ cartId, cartSecret }) => {
      window.localStorage.setItem('cart', cartId)
      window.localStorage.setItem('cart_secret', cartSecret)
    },
    { cartId: cart.id, cartSecret: cart.secret },
  )
}

test.describe('Checkout purchase flows', () => {
  test('guest checkout sends guest email through Stripe initiation', async ({ page }) => {
    const cart = createDigitalCourseCart({ id: 'cart_guest_1', secret: 'cart_secret_guest_1' })
    const initiationBodies: Array<Record<string, unknown>> = []

    await stubStripeBrowser(page)
    await stubCheckoutApi(page, {
      cart,
      initiationBodies,
      loggedInUser: null,
    })
    await seedGuestCart(page, cart)

    await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#main-content').getByText('Fermentation Basics Course')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go to payment' })).toBeVisible()

    await page.getByLabel('Email Address').fill('guest@example.com')
    await page.getByRole('button', { name: 'Continue as guest' }).click()

    await page.getByRole('button', { name: 'Go to payment' }).click()

    await expect.poll(() => initiationBodies.length).toBeGreaterThan(0)
    expect(initiationBodies[0]).toMatchObject({
      cartID: 'cart_guest_1',
      currency: 'EUR',
      customerEmail: 'guest@example.com',
      secret: 'cart_secret_guest_1',
    })

    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel payment' })).toBeVisible()
  })

  test('logged-in checkout uses the account email for Stripe initiation', async ({ page }) => {
    const cart = createDigitalCourseCart({ id: 'cart_user_1', secret: 'cart_secret_user_1' })
    const initiationBodies: Array<Record<string, unknown>> = []

    await stubStripeBrowser(page)
    await stubCheckoutApi(page, {
      cart,
      initiationBodies,
      loggedInUser: {
        email: 'member@example.com',
        id: 'user_checkout_1',
      },
    })

    await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Go to payment' })).toBeVisible()

    await expect(page.locator('#main-content').getByText('member@example.com')).toBeVisible()
    await expect(page.getByLabel('Email Address')).toHaveCount(0)

    await page.getByRole('button', { name: 'Go to payment' }).click()

    await expect.poll(() => initiationBodies.length).toBeGreaterThan(0)
    expect(initiationBodies[0]).toMatchObject({
      cartID: 'cart_user_1',
      currency: 'EUR',
      customerEmail: 'member@example.com',
    })

    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel payment' })).toBeVisible()
  })
})