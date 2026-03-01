import { useState, useMemo, useEffect } from 'react'
import { getTranslationStats } from '../utils/xcstringsParser'
import { ITEMS_PER_PAGE } from '../constants'

export function useTranslationEditor(xcstringsData, setXcstringsData, stats, setStats, addLog) {
  const [editDialog, setEditDialog] = useState({ open: false, key: '', lang: '', value: '' })
  const [filterLang, setFilterLang] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const availableLanguages = useMemo(() => {
    if (!stats) return []
    return stats.languages.filter(l => l !== 'en')
  }, [stats])

  const filteredTranslations = useMemo(() => {
    if (!xcstringsData?.strings) return []

    const entries = Object.entries(xcstringsData.strings)
      .map(([key, value]) => {
        const localizations = value?.localizations || {}
        const englishText = localizations.en?.stringUnit?.value || key

        return {
          key,
          english: englishText,
          translations: localizations
        }
      })
      .filter(item => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesKey = item.key.toLowerCase().includes(query)
          const matchesEnglish = item.english.toLowerCase().includes(query)
          const matchesTranslation = Object.values(item.translations).some(t =>
            t?.stringUnit?.value?.toLowerCase().includes(query)
          )
          if (!matchesKey && !matchesEnglish && !matchesTranslation) return false
        }

        if (filterLang !== 'all') {
          if (!item.translations[filterLang]?.stringUnit?.value) return false
        }

        return true
      })
      .sort((a, b) => a.key.localeCompare(b.key))

    return entries
  }, [xcstringsData, searchQuery, filterLang])

  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery, filterLang])

  const paginatedTranslations = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE
    return filteredTranslations.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTranslations, currentPage])

  const totalPages = Math.ceil(filteredTranslations.length / ITEMS_PER_PAGE)

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleEditTranslation = (key, lang, currentValue) => {
    setEditDialog({
      open: true,
      key,
      lang,
      value: currentValue || ''
    })
  }

  const handleSaveEdit = () => {
    if (!xcstringsData || !editDialog.key) return

    const newData = JSON.parse(JSON.stringify(xcstringsData))

    if (!newData.strings[editDialog.key]) {
      newData.strings[editDialog.key] = {}
    }
    if (!newData.strings[editDialog.key].localizations) {
      newData.strings[editDialog.key].localizations = {}
    }

    newData.strings[editDialog.key].localizations[editDialog.lang] = {
      stringUnit: {
        state: 'translated',
        value: editDialog.value
      }
    }

    setXcstringsData(newData)
    const newStats = getTranslationStats(newData)
    setStats(newStats)
    setEditDialog({ open: false, key: '', lang: '', value: '' })
    addLog(`Updated ${editDialog.lang} translation for "${editDialog.key}"`, 'success')
  }

  return {
    editDialog,
    setEditDialog,
    filterLang,
    setFilterLang,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    availableLanguages,
    filteredTranslations,
    paginatedTranslations,
    totalPages,
    truncateText,
    handleEditTranslation,
    handleSaveEdit,
    ITEMS_PER_PAGE,
  }
}
