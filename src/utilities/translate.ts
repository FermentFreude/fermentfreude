import * as deepl from 'deepl-node'

let translator: deepl.Translator | null = null

function getTranslator(): deepl.Translator | null {
  if (translator) return translator

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return null

  translator = new deepl.Translator(apiKey)
  return translator
}

/**
 * Translate text from German to English using DeepL.
 * Returns the original text if no API key is configured or translation fails.
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text

  const t = getTranslator()
  if (!t) return text

  try {
    const result = await t.translateText(text, 'de', 'en-US')
    return result.text
  } catch (error) {
    console.warn('[DeepL] Translation failed, using original text:', error)
    return text
  }
}

/**
 * Translate multiple texts in a single API call (more efficient).
 * Returns original texts if no API key or translation fails.
 */
export async function translateBatchToEnglish(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return texts

  const t = getTranslator()
  if (!t) return texts

  try {
    const results = await t.translateText(texts, 'de', 'en-US')
    return results.map((r) => r.text)
  } catch (error) {
    console.warn('[DeepL] Batch translation failed, using original texts:', error)
    return texts
  }
}
