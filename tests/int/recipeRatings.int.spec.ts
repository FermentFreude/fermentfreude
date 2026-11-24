import { describe, expect, it } from 'vitest'

import { clientIp, parseRatingInput, ratingHashes, summarize } from '@/lib/recipeRatings'

describe('parseRatingInput', () => {
  it('accepts a slug and 1–5 whole stars', () => {
    expect(parseRatingInput({ slug: 'trauben-kombucha', stars: 5 })).toEqual({ slug: 'trauben-kombucha', stars: 5 })
    expect(parseRatingInput({ slug: 'a', stars: 1 })).toEqual({ slug: 'a', stars: 1 })
  })
  it.each([
    [null],
    ['text'],
    [{ slug: 'x', stars: 0 }],
    [{ slug: 'x', stars: 6 }],
    [{ slug: 'x', stars: 3.5 }],
    [{ slug: 'x', stars: '4' }],
    [{ slug: '../admin', stars: 4 }],
    [{ slug: 'Großes Rezept', stars: 4 }],
    [{ slug: 'a'.repeat(121), stars: 4 }],
    [{ stars: 4 }],
  ])('rejects %j', (body) => expect(parseRatingInput(body)).toBeNull())
})

describe('ratingHashes', () => {
  it('is stable, never contains the IP, and differs per recipe for the voter only', () => {
    const a = ratingHashes('secret', '203.0.113.7', 'Safari', 'r1')
    const b = ratingHashes('secret', '203.0.113.7', 'Safari', 'r1')
    const c = ratingHashes('secret', '203.0.113.7', 'Safari', 'r2')
    expect(a).toEqual(b)
    expect(a.voter).not.toBe(c.voter)
    expect(a.ipHash).toBe(c.ipHash)
    expect(a.voter + a.ipHash).not.toContain('203.0.113.7')
    expect(a.voter).toMatch(/^[0-9a-f]{64}$/)
  })
  it('depends on the secret', () => {
    expect(ratingHashes('s1', 'ip', 'ua', 'r').voter).not.toBe(ratingHashes('s2', 'ip', 'ua', 'r').voter)
  })
})

describe('clientIp', () => {
  it('uses the first x-forwarded-for address, then x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
    expect(clientIp(new Headers({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})

describe('summarize', () => {
  it('counts and averages to one decimal, ignoring invalid values', () => {
    expect(summarize([5, 4, 4])).toEqual({ count: 3, average: 4.3 })
    expect(summarize([5, 0, 7, 3])).toEqual({ count: 2, average: 4 })
    expect(summarize([])).toEqual({ count: 0, average: 0 })
  })
})
