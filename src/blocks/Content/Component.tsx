import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

const GOOGLE_MAPS_ADDRESS_URL =
  'https://www.google.com/maps/search/?api=1&query=Grabenstraße+15,+8010+Graz,+Österreich'
const CONTACT_PHONE_TEXT = 'Telefon: +43 (0) 660 49 43 577'
const CONTACT_EMAIL_TEXT = 'E-Mail: fermentfreude@gmail.com'
const CONTACT_EMAIL_URL = 'mailto:fermentfreude@gmail.com'
const CONTACT_WEBSITE_TEXT = 'Website: https://www.ferment-freude.at'
const CONTACT_WEBSITE_URL = 'https://www.ferment-freude.at'

function getParagraphText(node: unknown): string | null {
  if (!node || typeof node !== 'object') return null
  const paragraph = node as { type?: unknown; children?: unknown }
  if (paragraph.type !== 'paragraph' || !Array.isArray(paragraph.children)) return null

  return paragraph.children
    .map((child) => {
      if (!child || typeof child !== 'object') return ''
      const text = (child as { text?: unknown }).text
      return typeof text === 'string' ? text : ''
    })
    .join('')
    .trim()
}

function withLegalAddressMapLink(richText: unknown): unknown {
  if (!richText || typeof richText !== 'object') return richText

  const state = structuredClone(richText) as {
    root?: {
      children?: unknown[]
    }
  }

  const children = state.root?.children
  if (!Array.isArray(children)) return richText
  let changed = false

  for (let i = 0; i < children.length - 2; i++) {
    const first = getParagraphText(children[i])
    const second = getParagraphText(children[i + 1])
    const third = getParagraphText(children[i + 2])

    const isAddressBlock =
      (first === 'Grabenstraße 15' || first === 'Grabenstrasse 15') &&
      second === '8010 Graz' &&
      (third === 'Österreich' || third === 'Oesterreich')

    if (!isAddressBlock) continue

    children.splice(i, 3, {
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
      children: [
        {
          type: 'link',
          fields: {
            linkType: 'custom',
            url: GOOGLE_MAPS_ADDRESS_URL,
            newTab: true,
          },
          format: '',
          indent: 0,
          version: 3,
          children: [
            {
              type: 'text',
              text: 'Grabenstraße 15, 8010 Graz, Österreich',
              format: 0,
              style: '',
              mode: 'normal',
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
    })

    changed = true
    break
  }

  for (let i = 0; i < children.length - 1; i++) {
    const first = getParagraphText(children[i])
    const second = getParagraphText(children[i + 1])

    const isStakeholderBlock = first === 'Marcel Raunnigger' && second === 'David Haider'
    if (!isStakeholderBlock) continue

    children.splice(i, 2, {
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
      children: [
        {
          type: 'text',
          text: 'Marcel Raunnigger, David Haider',
          format: 0,
          style: '',
          mode: 'normal',
          detail: 0,
          version: 1,
        },
      ],
    })

    changed = true
    break
  }

  for (let i = 0; i < children.length; i++) {
    const line = getParagraphText(children[i])
    if (!line) continue

    if (line === CONTACT_PHONE_TEXT) {
      children[i] = {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            text: CONTACT_PHONE_TEXT,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            version: 1,
          },
        ],
      }
      changed = true
      continue
    }

    if (line === CONTACT_EMAIL_TEXT) {
      children[i] = {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'link',
            fields: {
              linkType: 'custom',
              url: CONTACT_EMAIL_URL,
              newTab: false,
            },
            format: '',
            indent: 0,
            version: 3,
            children: [
              {
                type: 'text',
                text: CONTACT_EMAIL_TEXT,
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
                version: 1,
              },
            ],
          },
        ],
      }
      changed = true
      continue
    }

    if (line === CONTACT_WEBSITE_TEXT) {
      children[i] = {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'link',
            fields: {
              linkType: 'custom',
              url: CONTACT_WEBSITE_URL,
              newTab: true,
            },
            format: '',
            indent: 0,
            version: 3,
            children: [
              {
                type: 'text',
                text: CONTACT_WEBSITE_TEXT,
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
                version: 1,
              },
            ],
          },
        ],
      }
      changed = true
    }
  }

  return changed ? state : richText
}

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
    legalStyle?: boolean
  }
> = (props) => {
  const { columns, className, legalStyle } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className={cn('container my-16', className)}>
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col
            const resolvedRichText = legalStyle ? withLegalAddressMapLink(richText) : richText

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && (
                  <RichText
                    data={resolvedRichText as NonNullable<typeof richText>}
                    enableGutter={false}
                    className={legalStyle ? 'legal-richtext' : undefined}
                  />
                )}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
