import { describe, expect, it } from 'vitest'

import { mergeSaved, parseSavedInput, SAVED_RECIPES_MAX } from '@/lib/savedRecipes'

describe('parseSavedInput', () => {
  it('accepts add and/or remove lists of slugs, without doubles', () => {
    expect(parseSavedInput({ add: ['paprika-kimchi', 'paprika-kimchi'] })).toEqual({ add: ['paprika-kimchi'], remove: [] })
    expect(parseSavedInput({ remove: ['a'] })).toEqual({ add: [], remove: ['a'] })
  })
  it.each([
    [null],
    [{}],
    [{ add: [] }],
    [{ add: 'paprika-kimchi' }],
    [{ add: ['../admin'] }],
    [{ add: ['Groß'] }],
    [{ add: [1] }],
    [{ add: Array.from({ length: SAVED_RECIPES_MAX + 1 }, (_, i) => `r${i}`) }],
  ])('rejects %j', (body) => expect(parseSavedInput(body)).toBeNull())
})

describe('mergeSaved', () => {
  it('puts new ones first, keeps order, drops removed and doubles', () => {
    expect(mergeSaved(['a', 'b', 'c'], ['d', 'b'], ['c'])).toEqual(['d', 'b', 'a'])
  })
  it('caps the list', () => {
    expect(mergeSaved(['a', 'b', 'c'], ['x'], [], 2)).toEqual(['x', 'a'])
  })
})
