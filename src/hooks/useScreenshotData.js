import { useState, useMemo, useCallback } from 'react'

export function useScreenshotData(xcstringsData, stats) {
  const [screenshotHeadlineKey, setScreenshotHeadlineKey] = useState('')
  const [screenshotSubheadlineKey, setScreenshotSubheadlineKey] = useState('')
  const [screenshotApplyAll, setScreenshotApplyAll] = useState(true)

  const getLocalizedStringValue = useCallback((key, lang) => {
    if (!xcstringsData?.strings?.[key]) return ''
    const localization = xcstringsData.strings[key]?.localizations?.[lang]
    if (!localization) return ''
    return localization.stringUnit?.value
      || localization.variations?.plural?.other?.stringUnit?.value
      || localization.variations?.device?.other?.stringUnit?.value
      || ''
  }, [xcstringsData])

  const screenshotLanguages = useMemo(() => {
    if (!xcstringsData) return []
    const fromStats = stats?.languages?.length ? stats.languages : []
    const baseLang = xcstringsData?.sourceLanguage || 'en'
    const languages = fromStats.length ? fromStats : [baseLang]
    return Array.from(new Set(languages))
  }, [stats, xcstringsData])

  const screenshotKeyOptions = useMemo(() => {
    return xcstringsData?.strings ? Object.keys(xcstringsData.strings).sort() : []
  }, [xcstringsData])

  const screenshotLocalizationPayload = useMemo(() => {
    if (!screenshotLanguages.length) return null
    const headlinesByLang = {}
    const subheadlinesByLang = {}

    if (screenshotHeadlineKey) {
      screenshotLanguages.forEach((lang) => {
        const value = getLocalizedStringValue(screenshotHeadlineKey, lang)
        if (value !== '') headlinesByLang[lang] = value
      })
    }

    if (screenshotSubheadlineKey) {
      screenshotLanguages.forEach((lang) => {
        const value = getLocalizedStringValue(screenshotSubheadlineKey, lang)
        if (value !== '') subheadlinesByLang[lang] = value
      })
    }

    return {
      languages: screenshotLanguages,
      sourceLanguage: xcstringsData?.sourceLanguage || 'en',
      headlinesByLang,
      subheadlinesByLang,
      applyToAll: screenshotApplyAll
    }
  }, [
    screenshotApplyAll,
    screenshotHeadlineKey,
    screenshotSubheadlineKey,
    screenshotLanguages,
    getLocalizedStringValue
  ])

  return {
    screenshotHeadlineKey,
    setScreenshotHeadlineKey,
    screenshotSubheadlineKey,
    setScreenshotSubheadlineKey,
    screenshotApplyAll,
    setScreenshotApplyAll,
    screenshotLanguages,
    screenshotKeyOptions,
    screenshotLocalizationPayload,
  }
}
